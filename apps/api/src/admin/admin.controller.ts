import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { AdminService } from './admin.service';
import { AdminListUsersDto } from './dto/admin-list-users.dto';
import { AdminListOrganizationsDto } from './dto/admin-list-organizations.dto';
import { AdminListListingsDto } from './dto/admin-list-listings.dto';
import { AdminListAuditLogsDto } from './dto/admin-list-audit-logs.dto';
import { AdminUpdateListingStatusDto } from './dto/admin-update-listing-status.dto';
import {
  AdminAuditLogListResponseDto,
  AdminListingDetailDto,
  AdminListingListResponseDto,
  AdminOrgDetailDto,
  AdminOrgListResponseDto,
  AdminPlatformActivityDto,
  AdminUserDetailDto,
  AdminUserListResponseDto,
} from './dto/admin-response.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Activity ──────────────────────────────────────────────────────────────

  @Get('activity')
  async getActivity(): Promise<AdminPlatformActivityDto> {
    const activity = await this.adminService.getPlatformActivity();
    return AdminPlatformActivityDto.fromDomain(activity);
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  @Get('users')
  async listUsers(@Query() dto: AdminListUsersDto): Promise<AdminUserListResponseDto> {
    const result = await this.adminService.listUsers({
      search: dto.search,
      roleName: dto.roleName,
      suspended: dto.suspended,
      page: dto.page,
      limit: dto.limit,
    });
    return AdminUserListResponseDto.fromDomain(result);
  }

  @Get('users/:id')
  async getUserDetail(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdminUserDetailDto> {
    const user = await this.adminService.getUserDetail(id);
    return AdminUserDetailDto.fromDomain(user);
  }

  @Post('users/:id/suspend')
  @HttpCode(HttpStatus.NO_CONTENT)
  async suspendUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() admin: AuthUser,
  ): Promise<void> {
    await this.adminService.suspendUser(id, admin.id);
  }

  @Post('users/:id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async activateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() admin: AuthUser,
  ): Promise<void> {
    await this.adminService.activateUser(id, admin.id);
  }

  // ── Organizations ─────────────────────────────────────────────────────────

  @Get('organizations')
  async listOrganizations(
    @Query() dto: AdminListOrganizationsDto,
  ): Promise<AdminOrgListResponseDto> {
    const result = await this.adminService.listOrganizations({
      search: dto.search,
      ownerId: dto.ownerId,
      page: dto.page,
      limit: dto.limit,
    });
    return AdminOrgListResponseDto.fromDomain(result);
  }

  @Get('organizations/:id')
  async getOrganizationDetail(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdminOrgDetailDto> {
    const org = await this.adminService.getOrganizationDetail(id);
    return AdminOrgDetailDto.fromDomain(org);
  }

  // ── Listings ──────────────────────────────────────────────────────────────

  @Get('listings')
  async listListings(
    @Query() dto: AdminListListingsDto,
  ): Promise<AdminListingListResponseDto> {
    const result = await this.adminService.listListings({
      search: dto.search,
      status: dto.status,
      listingType: dto.listingType,
      userId: dto.userId,
      page: dto.page,
      limit: dto.limit,
    });
    return AdminListingListResponseDto.fromDomain(result);
  }

  @Get('listings/:id')
  async getListingDetail(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdminListingDetailDto> {
    const listing = await this.adminService.getListingDetail(id);
    return AdminListingDetailDto.fromDomain(listing);
  }

  @Patch('listings/:id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateListingStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateListingStatusDto,
    @CurrentUser() admin: AuthUser,
  ): Promise<void> {
    await this.adminService.updateListingStatus(id, dto.status, admin.id);
  }

  // ── Audit logs ────────────────────────────────────────────────────────────

  @Get('audit-logs')
  async listAuditLogs(
    @Query() dto: AdminListAuditLogsDto,
  ): Promise<AdminAuditLogListResponseDto> {
    const result = await this.adminService.listAuditLogs({
      adminId: dto.adminId,
      resourceType: dto.resourceType,
      resourceId: dto.resourceId,
      action: dto.action,
      page: dto.page,
      limit: dto.limit,
    });
    return AdminAuditLogListResponseDto.fromDomain(result);
  }
}
