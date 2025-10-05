import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { Booking, User, AuditLog } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User, AuditLog])],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
