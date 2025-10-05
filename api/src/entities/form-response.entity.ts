import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Form } from './form.entity';
import { Booking } from './booking.entity';

@Entity('form_responses')
export class FormResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  formId: string;

  @Column()
  bookingId: string;

  @Column({ type: 'text' })
  encryptedData: string; // AES-GCM encrypted response data

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    submittedAt: Date;
    isAnonymous: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  redactedData: Record<string, any>; // Non-sensitive data for analytics

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Form, form => form.responses)
  @JoinColumn({ name: 'formId' })
  form: Form;

  @ManyToOne(() => Booking, booking => booking.formResponses)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;
}
