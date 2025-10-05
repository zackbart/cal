import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('policies')
export class Policy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  rules: {
    maxMeetingsPerDay?: number;
    maxMeetingsPerWeek?: number;
    bufferTimeMinutes?: number;
    quietHours?: {
      start: string; // HH:MM format
      end: string;   // HH:MM format
      timezone: string;
    };
    allowedDays?: number[]; // 0-6 (Sunday-Saturday)
    blockedDates?: string[]; // ISO date strings
    advanceBookingDays?: number;
    cancellationDeadlineHours?: number;
  };

  @Column({ 
    type: 'enum', 
    enum: ['active', 'inactive'],
    default: 'active'
  })
  status: 'active' | 'inactive';

  @Column({ type: 'jsonb', nullable: true })
  conditions: {
    eventTypes?: string[]; // Cal.com event type IDs
    sensitivity?: ('High' | 'Medium' | 'Low')[];
    locations?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.policies)
  @JoinColumn({ name: 'userId' })
  user: User;
}
