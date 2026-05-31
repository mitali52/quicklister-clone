import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthUser } from '../auth/interfaces/auth-user.interface';
import { DashboardService } from './dashboard.service';
import { UserDashboardResponseDto } from './dto/dashboard-response.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('user')
  @ApiOperation({ summary: 'Get authenticated user dashboard' })
  @ApiResponse({ status: 200, type: UserDashboardResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  async getUserDashboard(@CurrentUser() user: AuthUser): Promise<UserDashboardResponseDto> {
    const dashboard = await this.dashboardService.getUserDashboard(user.id);
    return UserDashboardResponseDto.fromDomain(dashboard);
  }
}
