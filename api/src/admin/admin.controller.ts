import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/toggle-status')
  async toggleUserStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean }
  ) {
    return this.adminService.toggleUserStatus(id, body.isActive);
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }
}
