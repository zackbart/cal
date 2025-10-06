import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { User } from '../entities/user.entity';
import { ContextSummary } from '../entities/context-summary.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { CalLookupService } from '../tokens/cal-lookup.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface CreateBookingDto {
  calBookingId: number;
  calBookingUid?: string;
  eventTypeId: number;
  eventTypeTitle?: string;
  eventTypeSlug?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  timeZone?: string;
  duration: number;
  location?: string;
  attendees?: Array<{
    email: string;
    name: string;
    timeZone: string;
  }>;
  sensitivity?: 'High' | 'Medium' | 'Low';
  isAnonymous?: boolean;
  providerIds?: Record<string, string>;
  metadata?: Record<string, any>;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'ACCEPTED' | 'PENDING' | 'CANCELLED' | 'REJECTED';
}

export interface UpdateBookingDto {
  title?: string;
  description?: string;
  sensitivity?: 'High' | 'Medium' | 'Low';
  isAnonymous?: boolean;
  metadata?: Record<string, any>;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'ACCEPTED' | 'PENDING' | 'CANCELLED' | 'REJECTED';
}

export interface BookingStats {
  total: number;
  upcoming: number;
  past: number;
  thisWeek: number;
  thisMonth: number;
  byStatus: Record<string, number>;
  bySensitivity: Record<string, number>;
}

@Injectable()
export class BookingsService {
  private readonly encryptionKey: string;
  private readonly encryptionAlgorithm = 'aes-256-gcm';

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ContextSummary)
    private readonly contextSummaryRepository: Repository<ContextSummary>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly calLookupService: CalLookupService,
    private readonly configService: ConfigService,
  ) {
    this.encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!this.encryptionKey) {
      throw new Error('ENCRYPTION_KEY is required');
    }
  }

  async createBooking(userId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if booking already exists
    const existingBooking = await this.bookingRepository.findOne({
      where: { calBookingId: createBookingDto.calBookingId }
    });
    if (existingBooking) {
      throw new BadRequestException('Booking already exists');
    }

    // Create new booking
    const booking = this.bookingRepository.create({
      ...createBookingDto,
      userId,
      attendeeEmails: createBookingDto.attendees?.map(a => a.email) || [],
      attendeeNames: createBookingDto.attendees?.map(a => a.name) || [],
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // Log the creation
    await this.logAuditEvent('CREATE', savedBooking.id, userId, {
      calBookingId: createBookingDto.calBookingId,
      eventTypeId: createBookingDto.eventTypeId,
      title: createBookingDto.title,
    });

    return savedBooking;
  }

  async getBookings(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
      sensitivity?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<{ bookings: Booking[]; total: number }> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.userId = :userId', { userId })
      .orderBy('booking.startTime', 'DESC');

    if (options.status) {
      query.andWhere('booking.status = :status', { status: options.status });
    }

    if (options.sensitivity) {
      query.andWhere('booking.sensitivity = :sensitivity', { sensitivity: options.sensitivity });
    }

    if (options.startDate) {
      query.andWhere('booking.startTime >= :startDate', { startDate: options.startDate });
    }

    if (options.endDate) {
      query.andWhere('booking.startTime <= :endDate', { endDate: options.endDate });
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    const [bookings, total] = await query.getManyAndCount();

    // Log the access
    await this.logAuditEvent('READ_LIST', null, userId, {
      filters: options,
      count: bookings.length,
    });

    return { bookings, total };
  }

  async getBookingById(bookingId: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['formResponses', 'contextSummaries']
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check access permissions
    if (booking.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Log the access
    await this.logAuditEvent('READ', bookingId, userId, {
      calBookingId: booking.calBookingId,
      title: booking.title,
    });

    return booking;
  }

  async updateBooking(bookingId: string, userId: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.getBookingById(bookingId, userId);

    // Update booking
    Object.assign(booking, updateBookingDto);
    const updatedBooking = await this.bookingRepository.save(booking);

    // Log the update
    await this.logAuditEvent('UPDATE', bookingId, userId, {
      changes: updateBookingDto,
    });

    return updatedBooking;
  }

  async deleteBooking(bookingId: string, userId: string): Promise<void> {
    const booking = await this.getBookingById(bookingId, userId);

    await this.bookingRepository.remove(booking);

    // Log the deletion
    await this.logAuditEvent('DELETE', bookingId, userId, {
      calBookingId: booking.calBookingId,
      title: booking.title,
    });
  }

  async getBookingStats(userId: string): Promise<BookingStats> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      total,
      upcoming,
      past,
      thisWeek,
      thisMonth,
      byStatus,
      bySensitivity
    ] = await Promise.all([
      this.bookingRepository.count({ where: { userId } }),
      this.bookingRepository.count({ where: { userId, startTime: { $gte: now } as any } }),
      this.bookingRepository.count({ where: { userId, startTime: { $lt: now } as any } }),
      this.bookingRepository.count({ where: { userId, startTime: { $gte: startOfWeek } as any } }),
      this.bookingRepository.count({ where: { userId, startTime: { $gte: startOfMonth } as any } }),
      this.bookingRepository
        .createQueryBuilder('booking')
        .select('booking.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('booking.userId = :userId', { userId })
        .groupBy('booking.status')
        .getRawMany(),
      this.bookingRepository
        .createQueryBuilder('booking')
        .select('booking.sensitivity', 'sensitivity')
        .addSelect('COUNT(*)', 'count')
        .where('booking.userId = :userId', { userId })
        .groupBy('booking.sensitivity')
        .getRawMany(),
    ]);

    // Log the stats access
    await this.logAuditEvent('READ_STATS', null, userId, {});

    return {
      total,
      upcoming,
      past,
      thisWeek,
      thisMonth,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: parseInt(item.count) }), {}),
      bySensitivity: bySensitivity.reduce((acc, item) => ({ ...acc, [item.sensitivity]: parseInt(item.count) }), {}),
    };
  }

  async getSecureNotes(bookingId: string, userId: string): Promise<string> {
    const booking = await this.getBookingById(bookingId, userId);

    if (!booking.encryptedIntake) {
      return '';
    }

    try {
      const decrypted = this.decryptData(booking.encryptedIntake);
      
      // Log the secure notes access
      await this.logAuditEvent('READ_SECURE_NOTES', bookingId, userId, {
        calBookingId: booking.calBookingId,
        hasNotes: true,
      });

      return decrypted;
    } catch (error) {
      throw new BadRequestException('Failed to decrypt secure notes');
    }
  }

  async updateSecureNotes(bookingId: string, userId: string, notes: string): Promise<void> {
    const booking = await this.getBookingById(bookingId, userId);

    const encryptedNotes = this.encryptData(notes);
    booking.encryptedIntake = encryptedNotes;
    
    await this.bookingRepository.save(booking);

    // Log the secure notes update
    await this.logAuditEvent('UPDATE_SECURE_NOTES', bookingId, userId, {
      calBookingId: booking.calBookingId,
      hasNotes: notes.length > 0,
    });
  }

  async generateContextSummary(bookingId: string, userId: string): Promise<ContextSummary> {
    const booking = await this.getBookingById(bookingId, userId);

    // Check if summary already exists
    const existingSummary = await this.contextSummaryRepository.findOne({
      where: { bookingId: booking.id }
    });

    if (existingSummary) {
      return existingSummary;
    }

    // TODO: Implement AI summary generation
    // This would call the AI service to generate a summary
    const summary = this.contextSummaryRepository.create({
      bookingId: booking.id,
      encryptedSummary: this.encryptData('AI-generated summary placeholder'),
      metadata: {
        topic: 'Meeting context',
        participants: booking.attendeeNames || [],
        sensitivity: booking.sensitivity || 'Medium',
        location: booking.location || 'Unknown',
        when: booking.startTime.toISOString(),
        duration: booking.duration,
        plainText: 'AI-generated summary placeholder',
        generatedAt: new Date(),
        method: 'ai-generated',
      },
    });

    const savedSummary = await this.contextSummaryRepository.save(summary);

    // Log the summary generation
    await this.logAuditEvent('GENERATE_SUMMARY', bookingId, userId, {
      calBookingId: booking.calBookingId,
      summaryId: savedSummary.id,
    });

    return savedSummary;
  }

  private encryptData(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.encryptionAlgorithm, Buffer.from(this.encryptionKey, 'hex'), iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted,
      authTag: authTag.toString('hex'),
    });
  }

  private decryptData(encryptedData: string): string {
    const { iv, encrypted, authTag } = JSON.parse(encryptedData);
    
    const decipher = crypto.createDecipheriv(this.encryptionAlgorithm, Buffer.from(this.encryptionKey, 'hex'), Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private async logAuditEvent(
    action: string,
    bookingId: string | null,
    userId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      action,
      entityType: 'booking',
      entityId: bookingId,
      userId,
      bookingId: bookingId,
      metadata,
    });

    await this.auditLogRepository.save(auditLog);
  }
}
