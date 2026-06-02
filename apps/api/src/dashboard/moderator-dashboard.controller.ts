import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ModeratorDashboardService } from './moderator-dashboard.service';
import { GetModeratorDashboardDto } from './dto/get-moderator-dashboard.dto';
import { ModeratorDashboardResponseDto } from './dto/moderator-dashboard-response.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('moderator', 'admin')
export class ModeratorDashboardController {
  constructor(private readonly moderatorDashboardService: ModeratorDashboardService) {}

  @Get('moderator')
  @ApiOperation({ summary: 'Get moderator dashboard — review stats, queue depth, recent reviews' })
  @ApiResponse({ status: 200, type: ModeratorDashboardResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  @ApiResponse({ status: 403, description: 'Moderator or admin role required' })
  async getDashboard(
    @Query() dto: GetModeratorDashboardDto,
  ): Promise<ModeratorDashboardResponseDto> {
    const dashboard = await this.moderatorDashboardService.getDashboard(dto.page, dto.limit);
    return ModeratorDashboardResponseDto.fromDomain(dashboard);
  }
}
