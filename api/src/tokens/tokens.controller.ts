import { Controller, Post, Body, Logger } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { TokensService } from './tokens.service';

export class TokenRequestDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class TokenResponseDto {
  accessToken: string;
  expiresAt: string;
}

@Controller('tokens/cal')
export class TokensController {
  private readonly logger = new Logger(TokensController.name);

  constructor(private readonly tokensService: TokensService) {}

  @Post('managed-user')
  async getManagedUserToken(@Body() request: TokenRequestDto): Promise<TokenResponseDto> {
    this.logger.log('Requesting managed user token', { username: request.username });
    
    const result = await this.tokensService.getManagedUserToken(request.username);
    return result;
  }

  @Post('cleanup-test-users')
  async cleanupTestUsers() {
    this.logger.log('Starting cleanup of test users');
    await this.tokensService.cleanupTestUsers();
    return { message: 'Cleanup completed' };
  }
}
