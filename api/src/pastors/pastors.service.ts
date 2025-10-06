import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Booking } from '../entities/booking.entity';
import { CalLookupService } from '../tokens/cal-lookup.service';

export interface PastorProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio?: string;
  churchName?: string;
  calUserId?: number;
  calUsername?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventType {
  id: number;
  title: string;
  slug: string;
  description?: string;
  length: number;
  schedulingType: string;
  locations?: Array<{
    type: string;
    address?: string;
  }>;
  requiresConfirmation: boolean;
  minimumBookingNotice: number;
  metadata?: Record<string, any>;
}

export interface Availability {
  date: string;
  slots: Array<{
    start: string;
    end: string;
    available: boolean;
  }>;
}

@Injectable()
export class PastorsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly calLookupService: CalLookupService,
  ) {}

  async getPastorByUsername(username: string): Promise<PastorProfile> {
    const user = await this.userRepository.findOne({
      where: { username, isActive: true }
    });

    if (!user) {
      throw new NotFoundException('Pastor not found');
    }

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      bio: user.preferences?.bio,
      churchName: user.preferences?.churchName,
      calUserId: user.calUserId,
      calUsername: user.username,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getPastorEventTypes(username: string): Promise<EventType[]> {
    const user = await this.userRepository.findOne({
      where: { username, isActive: true }
    });

    if (!user) {
      throw new NotFoundException('Pastor not found');
    }

    if (!user.calUserId) {
      return [];
    }

    try {
      // Get event types from Cal.com API
      const eventTypes = await this.calLookupService.getEventTypes(user.calUserId);
      
      return eventTypes.map(eventType => ({
        id: eventType.id,
        title: eventType.title,
        slug: eventType.slug,
        description: eventType.description,
        length: eventType.length,
        schedulingType: eventType.schedulingType,
        locations: eventType.locations,
        requiresConfirmation: eventType.requiresConfirmation,
        minimumBookingNotice: eventType.minimumBookingNotice,
        metadata: eventType.metadata,
      }));
    } catch (error) {
      console.error('Error fetching event types:', error);
      return [];
    }
  }

  async getPastorAvailability(
    username: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Availability[]> {
    const user = await this.userRepository.findOne({
      where: { username, isActive: true }
    });

    if (!user) {
      throw new NotFoundException('Pastor not found');
    }

    if (!user.calUserId) {
      return [];
    }

    try {
      // Get availability from Cal.com API
      const availability = await this.calLookupService.getAvailability(
        user.calUserId,
        startDate,
        endDate
      );
      
      return availability;
    } catch (error) {
      console.error('Error fetching availability:', error);
      return [];
    }
  }

  async getPastorBookings(
    userId: string,
    username: string,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
    } = {}
  ): Promise<{ bookings: Booking[]; total: number }> {
    // Verify the requesting user is the pastor
    const user = await this.userRepository.findOne({
      where: { username, isActive: true }
    });

    if (!user) {
      throw new NotFoundException('Pastor not found');
    }

    if (user.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.userId = :userId', { userId })
      .orderBy('booking.startTime', 'DESC');

    if (options.status) {
      query.andWhere('booking.status = :status', { status: options.status });
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    const [bookings, total] = await query.getManyAndCount();

    return { bookings, total };
  }
}
