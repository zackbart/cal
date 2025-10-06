import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    console.log('Validating user with email:', email);
    
    const user = await this.userRepository.findOne({ where: { email } });
    console.log('User found in database:', user ? 'Yes' : 'No');
    console.log('User has password:', user?.password ? 'Yes' : 'No');
    
    if (!user || !user.password) {
      console.log('User validation failed: No user or no password');
      return null;
    }

    console.log('Comparing password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('User validation failed: Invalid password');
      return null;
    }

    console.log('User validation successful');
    return user;
  }

  async login(user: User) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
      },
    };
  }
}
