import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Booking } from '../entities/booking.entity';
import { Form } from '../entities/form.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Form)
    private formRepository: Repository<Form>,
  ) {}

  async getUsers() {
    return this.userRepository.find({
      select: [
        'id',
        'email',
        'username',
        'role',
        'isActive',
        'calUserId',
        'displayName',
        'preferences',
        'createdAt',
        'updatedAt',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async toggleUserStatus(id: string, isActive: boolean) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = isActive;
    return this.userRepository.save(user);
  }

  async getStats() {
    const [userCount, bookingCount, formCount] = await Promise.all([
      this.userRepository.count(),
      this.bookingRepository.count(),
      this.formRepository.count(),
    ]);

    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });

    const recentUsers = await this.userRepository.count({
      where: {
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    });

    return {
      totalUsers: userCount,
      activeUsers,
      recentUsers,
      totalBookings: bookingCount,
      totalForms: formCount,
    };
  }
}
