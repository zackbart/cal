import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Booking } from './booking.entity';

@Entity('context_summaries')
export class ContextSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bookingId: string;

  @Column({ type: 'text' })
  encryptedSummary: string; // AES-GCM encrypted summary data

  @Column({ type: 'jsonb' })
  metadata: {
    topic: string;
    participants: string[];
    sensitivity: 'High' | 'Medium' | 'Low';
    location: string;
    when: string; // ISO 8601 datetime
    duration: number; // minutes
    plainText: string; // One or two sentences, strictly factual
    generatedAt: Date;
    method: 'rule-based' | 'ai-generated';
  };

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date; // For retention policy

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Booking, booking => booking.contextSummaries)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;
}
