import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardResponseDto } from './dto/admin-dashboard-response.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('admin')
  @ApiOperation({
    summary: 'Get admin dashboard — platform-wide stats across users, listings, moderation, and system',
  })
  @ApiResponse({ status: 200, type: AdminDashboardResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  @ApiResponse({ status: 403, description: 'Admin role required' })
  async getDashboard(): Promise<AdminDashboardResponseDto> {
    const dashboard = await this.adminDashboardService.getDashboard();
    return AdminDashboardResponseDto.fromDomain(dashboard);
  }
}
