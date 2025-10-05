import { Controller, Post, Body, Headers, Logger, BadRequestException } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

interface CalWebhookHeaders {
  'cal-signature-256': string;
  'cal-timestamp': string;
  'cal-webhook-id': string;
}

@Controller('webhooks/cal')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('booking.created')
  async handleBookingCreated(
    @Body() payload: any,
    @Headers() headers: CalWebhookHeaders,
  ) {
    this.logger.log('Received booking.created webhook', { 
      bookingId: payload?.id, 
      uid: payload?.uid,
      webhookId: headers['cal-webhook-id'] 
    });
    
    try {
      // Validate webhook payload
      if (!payload?.id || !payload?.uid) {
        throw new BadRequestException('Invalid webhook payload: missing required fields');
      }

      // TODO: Verify webhook signature for security
      // await this.verifyWebhookSignature(payload, headers);

      await this.webhooksService.handleBookingCreated(payload);
      return { status: 'success' };
    } catch (error) {
      this.logger.error('Failed to handle booking.created', { 
        bookingId: payload?.id, 
        error: error.message 
      });
      throw error;
    }
  }

  @Post('booking.updated')
  async handleBookingUpdated(
    @Body() payload: any,
    @Headers() headers: CalWebhookHeaders,
  ) {
    this.logger.log('Received booking.updated webhook', { 
      bookingId: payload?.id, 
      uid: payload?.uid,
      webhookId: headers['cal-webhook-id'] 
    });
    
    try {
      // Validate webhook payload
      if (!payload?.id || !payload?.uid) {
        throw new BadRequestException('Invalid webhook payload: missing required fields');
      }

      // TODO: Verify webhook signature for security
      // await this.verifyWebhookSignature(payload, headers);

      await this.webhooksService.handleBookingUpdated(payload);
      return { status: 'success' };
    } catch (error) {
      this.logger.error('Failed to handle booking.updated', { 
        bookingId: payload?.id, 
        error: error.message 
      });
      throw error;
    }
  }

  // TODO: Implement webhook signature verification
  // private async verifyWebhookSignature(payload: any, headers: CalWebhookHeaders): Promise<void> {
  //   // Verify the webhook signature using Cal.com's webhook secret
  //   // This ensures the webhook is actually from Cal.com
  // }
}
