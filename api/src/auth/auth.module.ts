import { Module } from '@nestjs/common';
import { StackAuthService } from './stack-auth.service';
import { StackAuthController } from './stack-auth.controller';
import { CalLookupService } from '../tokens/cal-lookup.service';

@Module({
  imports: [],
  providers: [StackAuthService, CalLookupService],
  controllers: [StackAuthController],
  exports: [],
})
export class AuthModule {}
