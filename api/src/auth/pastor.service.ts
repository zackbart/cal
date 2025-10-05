import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Pastor } from '../entities/pastor.entity';

@Injectable()
export class PastorService {
  private readonly logger = new Logger(PastorService.name);

  constructor(
    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,
  ) {}

  async createPastor(data: {
    username: string;
    email: string;
    password: string;
    calManagedUserId?: string;
    firstName?: string;
    lastName?: string;
    churchName?: string;
  }): Promise<Pastor> {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const pastor = this.pastorRepository.create({
      username: data.username,
      email: data.email,
      passwordHash,
      calManagedUserId: data.calManagedUserId,
      firstName: data.firstName,
      lastName: data.lastName,
      churchName: data.churchName,
    });

    return this.pastorRepository.save(pastor);
  }

  async findByUsername(username: string): Promise<Pastor | null> {
    return this.pastorRepository.findOne({
      where: { username, isActive: true },
    });
  }

  async findByEmail(email: string): Promise<Pastor | null> {
    return this.pastorRepository.findOne({
      where: { email, isActive: true },
    });
  }

  async validatePassword(pastor: Pastor, password: string): Promise<boolean> {
    return bcrypt.compare(password, pastor.passwordHash);
  }

  async updatePassword(pastorId: number, newPassword: string): Promise<void> {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    await this.pastorRepository.update(pastorId, { passwordHash });
  }

  async getAllPastors(): Promise<Pastor[]> {
    return this.pastorRepository.find({
      where: { isActive: true },
      select: ['id', 'username', 'email', 'firstName', 'lastName', 'churchName', 'createdAt'],
    });
  }

  async deactivatePastor(pastorId: number): Promise<void> {
    await this.pastorRepository.update(pastorId, { isActive: false });
  }
}
