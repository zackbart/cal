import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Booking } from './booking.entity';
import { Form } from './form.entity';
import { Policy } from './policy.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  calUserId: string; // Cal.com user ID

  @Column()
  username: string; // Cal.com username

  @Column()
  email: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Booking, booking => booking.user)
  bookings: Booking[];

  @OneToMany(() => Form, form => form.user)
  forms: Form[];

  @OneToMany(() => Policy, policy => policy.user)
  policies: Policy[];
}
