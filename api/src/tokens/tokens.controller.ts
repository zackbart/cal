import { Controller, Post, Body, Logger } from '@nestjs/common';
import { TokensService } from './tokens.service';

export class TokenRequestDto {
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
}
