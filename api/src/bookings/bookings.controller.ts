import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  UseGuards,
  Request,
  ParseUUIDPipe,
  ParseIntPipe,
  ValidationPipe
} from '@nestjs/common';
import { BookingsService, CreateBookingDto, UpdateBookingDto } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async createBooking(
    @Request() req: any,
    @Body(ValidationPipe) createBookingDto: CreateBookingDto
  ) {
    const userId = req.user.id;
    return this.bookingsService.createBooking(userId, createBookingDto);
  }

  @Get()
  async getBookings(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: string,
    @Query('sensitivity') sensitivity?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.id;
    const options = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      status,
      sensitivity,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return this.bookingsService.getBookings(userId, options);
  }

  @Get('stats')
  async getBookingStats(@Request() req: any) {
    const userId = req.user.id;
    return this.bookingsService.getBookingStats(userId);
  }

  @Get(':id')
  async getBookingById(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const userId = req.user.id;
    return this.bookingsService.getBookingById(id, userId);
  }

  @Put(':id')
  async updateBooking(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateBookingDto: UpdateBookingDto
  ) {
    const userId = req.user.id;
    return this.bookingsService.updateBooking(id, userId, updateBookingDto);
  }

  @Delete(':id')
  async deleteBooking(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const userId = req.user.id;
    await this.bookingsService.deleteBooking(id, userId);
    return { message: 'Booking deleted successfully' };
  }

  @Get(':id/secure-notes')
  async getSecureNotes(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const userId = req.user.id;
    const notes = await this.bookingsService.getSecureNotes(id, userId);
    return { notes };
  }

  @Put(':id/secure-notes')
  async updateSecureNotes(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('notes') notes: string
  ) {
    const userId = req.user.id;
    await this.bookingsService.updateSecureNotes(id, userId, notes);
    return { message: 'Secure notes updated successfully' };
  }

  @Post(':id/summary')
  async generateContextSummary(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const userId = req.user.id;
    return this.bookingsService.generateContextSummary(id, userId);
  }
}
