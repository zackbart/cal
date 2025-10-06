import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { StackAuthService } from './stack-auth.service';

export class StackTokenRequestDto {
  stackUserId: string;
}

@Controller('auth/stack')
export class StackAuthController {
  constructor(private readonly stackAuthService: StackAuthService) {}

  @Post('cal-token')
  async getCalTokenForStackUser(@Body() request: StackTokenRequestDto) {
    return this.stackAuthService.getCalTokenForStackUser(request.stackUserId);
  }

  @Get('validate/:stackUserId')
  async validateStackUser(@Param('stackUserId') stackUserId: string) {
    const user = await this.stackAuthService.validateStackUser(stackUserId);
    return {
      valid: true,
      user: {
        id: user.id,
        email: user.primaryEmail,
        displayName: user.displayName,
      }
    };
  }
}
