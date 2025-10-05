import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { FormResponse } from './form-response.entity';

@Entity('forms')
export class Form {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  schema: {
    fields: Array<{
      id: string;
      type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'time' | 'email' | 'phone';
      label: string;
      required: boolean;
      placeholder?: string;
      options?: string[];
      validation?: Record<string, any>;
      conditional?: {
        field: string;
        operator: 'equals' | 'not_equals' | 'contains' | 'not_contains';
        value: any;
      };
    }>;
    branching: Array<{
      from: string;
      to: string;
      condition: {
        field: string;
        operator: 'equals' | 'not_equals' | 'contains' | 'not_contains';
        value: any;
      };
    }>;
  };

  @Column({ 
    type: 'enum', 
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  })
  status: 'active' | 'inactive' | 'archived';

  @Column({ default: false })
  isDefault: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    allowAnonymous: boolean;
    requireAuthentication: boolean;
    maxSubmissions?: number;
    expiresAt?: Date;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.forms)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => FormResponse, response => response.form)
  responses: FormResponse[];
}
