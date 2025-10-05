import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Booking } from './booking.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  bookingId: string;

  @Column()
  userId: string;

  @Column()
  action: string; // e.g., 'BOOKING_CREATED', 'BOOKING_UPDATED', 'decrypt_intake', 'view_secure_notes', 'access_summary'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  entityType: string; // e.g., 'booking', 'user', 'form'

  @Column({ nullable: true })
  entityId: string; // ID of the entity being acted upon

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Flexible metadata structure

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Booking, booking => booking.auditLogs)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;
}
