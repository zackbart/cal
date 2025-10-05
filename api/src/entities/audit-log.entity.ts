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
  action: string; // e.g., 'decrypt_intake', 'view_secure_notes', 'access_summary'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    resourceType?: string;
    resourceId?: string;
    success: boolean;
    errorMessage?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Booking, booking => booking.auditLogs)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;
}
