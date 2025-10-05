import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';

@Module({
  imports: [ConfigModule],
  controllers: [TokensController],
  providers: [TokensService],
})
export class TokensModule {}
