import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { FormResponse } from './form-response.entity';
import { ContextSummary } from './context-summary.entity';
import { AuditLog } from './audit-log.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  calBookingId: string; // Cal.com booking ID

  @Column()
  userId: string;

  @Column()
  eventTypeId: string; // Cal.com event type ID

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'int' })
  duration: number; // in minutes

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'jsonb', nullable: true })
  attendees: Array<{
    email: string;
    name: string;
    timeZone: string;
  }>;

  @Column({ 
    type: 'enum', 
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  })
  sensitivity: 'High' | 'Medium' | 'Low';

  @Column({ default: false })
  isAnonymous: boolean;

  @Column({ type: 'jsonb', nullable: true })
  providerIds: Record<string, string>; // Calendar provider event IDs

  @Column({ type: 'text', nullable: true })
  encryptedIntake: string; // AES-GCM encrypted intake data

  @Column({ type: 'text', nullable: true })
  redactedDescription: string; // For external calendar events

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  })
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.bookings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => FormResponse, response => response.booking)
  formResponses: FormResponse[];

  @OneToMany(() => ContextSummary, summary => summary.booking)
  contextSummaries: ContextSummary[];

  @OneToMany(() => AuditLog, audit => audit.booking)
  auditLogs: AuditLog[];
}
