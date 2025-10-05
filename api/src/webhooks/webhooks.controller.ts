import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks/cal')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('booking.created')
  async handleBookingCreated(
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
  ) {
    this.logger.log('Received booking.created webhook', { payload, headers });
    
    try {
      await this.webhooksService.handleBookingCreated(payload);
      return { status: 'success' };
    } catch (error) {
      this.logger.error('Failed to handle booking.created', error);
      throw error;
    }
  }

  @Post('booking.updated')
  async handleBookingUpdated(
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
  ) {
    this.logger.log('Received booking.updated webhook', { payload, headers });
    
    try {
      await this.webhooksService.handleBookingUpdated(payload);
      return { status: 'success' };
    } catch (error) {
      this.logger.error('Failed to handle booking.updated', error);
      throw error;
    }
  }
}
