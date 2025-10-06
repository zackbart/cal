import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('Login attempt for email:', loginDto.email);
    console.log('Login DTO received:', { email: loginDto.email, password: '***' });
    
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('Login failed: Invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }
    
    console.log('Login successful for user:', user.email);
    return this.authService.login(user);
  }
}
