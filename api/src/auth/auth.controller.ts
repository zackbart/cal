import { Controller, Post, Body, Res, HttpCode, HttpStatus, UseGuards, Get, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService, LoginResponse } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PastorPayload } from './auth.service';

export class LoginDto {
  username: string;
  password: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponse> {
    const result = await this.authService.login(loginDto.username, loginDto.password);
    
    // Set secure HTTP-only cookies
    response.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const result = await this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
    
    // Update access token cookie
    response.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    const refreshToken = request.cookies.refreshToken;
    
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    
    // Clear cookies
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() request: Request): Promise<PastorPayload> {
    return request.user as PastorPayload;
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@Req() request: Request): Promise<{ valid: boolean; pastor: PastorPayload }> {
    return {
      valid: true,
      pastor: request.user as PastorPayload,
    };
  }
}
