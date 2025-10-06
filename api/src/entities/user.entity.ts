import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Booking } from './booking.entity';
import { Form } from './form.entity';
import { Policy } from './policy.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  calUserId: number; // Cal.com user ID (nullable for admin users)

  @Column()
  username: string; // Cal.com username

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string; // Hashed password for local auth

  @Column({ nullable: true })
  displayName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'user' })
  role: string; // 'admin', 'user', 'pastor'

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
