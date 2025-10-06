import { 
  Controller, 
  Get, 
  Param, 
  Query,
  UseGuards,
  Request,
  ValidationPipe
} from '@nestjs/common';
import { PastorsService } from './pastors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pastors')
export class PastorsController {
  constructor(private readonly pastorsService: PastorsService) {}

  @Get(':username')
  async getPastorByUsername(@Param('username') username: string) {
    return this.pastorsService.getPastorByUsername(username);
  }

  @Get(':username/event-types')
  async getPastorEventTypes(@Param('username') username: string) {
    return this.pastorsService.getPastorEventTypes(username);
  }

  @Get(':username/availability')
  async getPastorAvailability(
    @Param('username') username: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;
    
    return this.pastorsService.getPastorAvailability(username, startDate, endDate);
  }

  @Get(':username/bookings')
  @UseGuards(JwtAuthGuard)
  async getPastorBookings(
    @Request() req: any,
    @Param('username') username: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: string,
  ) {
    const userId = req.user.id;
    const options = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      status,
    };

    return this.pastorsService.getPastorBookings(userId, username, options);
  }
}
