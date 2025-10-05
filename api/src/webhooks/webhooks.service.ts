import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { User } from '../entities/user.entity';
import { AuditLog } from '../entities/audit-log.entity';

interface CalBookingPayload {
  id: number;
  uid: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  attendees: Array<{
    email: string;
    name: string;
    timeZone: string;
  }>;
  user: {
    id: number;
    username: string;
    email: string;
    name: string;
  };
  eventType: {
    id: number;
    title: string;
    slug: string;
  };
  status: 'ACCEPTED' | 'PENDING' | 'CANCELLED' | 'REJECTED';
  metadata?: Record<string, any>;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async handleBookingCreated(payload: CalBookingPayload): Promise<void> {
    this.logger.log('Processing booking.created', { bookingId: payload.id, uid: payload.uid });
    
    try {
      // 1. Find or create user record
      let user = await this.userRepository.findOne({
        where: { calUserId: payload.user.id }
      });

      if (!user) {
        user = this.userRepository.create({
          calUserId: payload.user.id,
          username: payload.user.username,
          email: payload.user.email,
          displayName: payload.user.name,
        });
        await this.userRepository.save(user);
        this.logger.log('Created new user record', { userId: user.id, calUserId: payload.user.id });
      }

      // 2. Create booking record
      const startTime = new Date(payload.startTime);
      const endTime = new Date(payload.endTime);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes

      const booking = this.bookingRepository.create({
        calBookingId: payload.id,
        calBookingUid: payload.uid,
        title: payload.title,
        description: payload.description,
        startTime: startTime,
        endTime: endTime,
        timeZone: payload.timeZone,
        duration: duration,
        status: payload.status,
        userId: user.id,
        eventTypeId: payload.eventType.id,
        eventTypeTitle: payload.eventType.title,
        eventTypeSlug: payload.eventType.slug,
        attendees: payload.attendees,
        attendeeEmails: payload.attendees.map(a => a.email),
        attendeeNames: payload.attendees.map(a => a.name),
        metadata: payload.metadata || {},
      });

      await this.bookingRepository.save(booking);

      // 3. Create audit log
      await this.auditLogRepository.save({
        action: 'BOOKING_CREATED',
        entityType: 'booking',
        entityId: booking.id,
        userId: user.id,
        bookingId: booking.id,
        metadata: {
          calBookingId: payload.id,
          calBookingUid: payload.uid,
          eventType: payload.eventType.title,
        },
      });

      this.logger.log('Successfully processed booking.created', { 
        bookingId: booking.id, 
        calBookingId: payload.id 
      });

      // TODO: Schedule JIT validation job
      // TODO: Process questionnaire responses if present
      // TODO: Apply policy enforcement

    } catch (error) {
      this.logger.error('Failed to process booking.created', { 
        bookingId: payload.id, 
        error: error.message 
      });
      throw error;
    }
  }

  async handleBookingUpdated(payload: CalBookingPayload): Promise<void> {
    this.logger.log('Processing booking.updated', { bookingId: payload.id, uid: payload.uid });
    
    try {
      // 1. Find existing booking
      const booking = await this.bookingRepository.findOne({
        where: { calBookingId: payload.id },
        relations: ['user'],
      });

      if (!booking) {
        this.logger.warn('Booking not found for update', { calBookingId: payload.id });
        // Create new booking if it doesn't exist (might have been missed)
        await this.handleBookingCreated(payload);
        return;
      }

      // 2. Update booking record
      const startTime = new Date(payload.startTime);
      const endTime = new Date(payload.endTime);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes

      booking.title = payload.title;
      booking.description = payload.description;
      booking.startTime = startTime;
      booking.endTime = endTime;
      booking.timeZone = payload.timeZone;
      booking.duration = duration;
      booking.status = payload.status;
      booking.eventTypeTitle = payload.eventType.title;
      booking.eventTypeSlug = payload.eventType.slug;
      booking.attendees = payload.attendees;
      booking.attendeeEmails = payload.attendees.map(a => a.email);
      booking.attendeeNames = payload.attendees.map(a => a.name);
      booking.metadata = { ...booking.metadata, ...payload.metadata };

      await this.bookingRepository.save(booking);

      // 3. Create audit log
      await this.auditLogRepository.save({
        action: 'BOOKING_UPDATED',
        entityType: 'booking',
        entityId: booking.id,
        userId: booking.user.id,
        bookingId: booking.id,
        metadata: {
          calBookingId: payload.id,
          calBookingUid: payload.uid,
          status: payload.status,
          eventType: payload.eventType.title,
        },
      });

      this.logger.log('Successfully processed booking.updated', { 
        bookingId: booking.id, 
        calBookingId: payload.id,
        status: payload.status 
      });

      // TODO: Handle status-specific logic
      // TODO: Schedule reminders if booking is confirmed
      // TODO: Generate context summary if booking is completed
      // TODO: Apply redaction to external calendar events

    } catch (error) {
      this.logger.error('Failed to process booking.updated', { 
        bookingId: payload.id, 
        error: error.message 
      });
      throw error;
    }
  }
}
