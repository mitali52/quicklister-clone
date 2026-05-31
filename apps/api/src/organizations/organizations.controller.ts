import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import type { PaginatedResult } from './interfaces/organizations-repository.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

@ApiTags('organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  // ── Authenticated user's own organizations ──────────────────────────────────

  @Get('me')
  @ApiOperation({ summary: "List the authenticated user's organizations" })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200 })
  async findMine(
    @CurrentUser() user: AuthUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<PaginatedResult<OrganizationResponseDto>> {
    const result = await this.organizationsService.findMyOrganizations(user.id, {
      page: Number.parseInt(page, 10),
      limit: Math.min(Number.parseInt(limit, 10), 100),
    });
    return { ...result, data: result.data.map(OrganizationResponseDto.fromDomain) };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an organization' })
  @ApiResponse({ status: 201, type: OrganizationResponseDto })
  @ApiResponse({ status: 409, description: 'Slug is already taken' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const org = await this.organizationsService.create(user.id, dto);
    return OrganizationResponseDto.fromDomain(org);
  }

  // ── Single organization routes ───────────────────────────────────────────────
  // Placed after /me to avoid routing collision

  @Get()
  @ApiOperation({ summary: 'List all organizations' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200 })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<PaginatedResult<OrganizationResponseDto>> {
    const result = await this.organizationsService.findAll({
      page: Number.parseInt(page, 10),
      limit: Math.min(Number.parseInt(limit, 10), 100),
    });
    return { ...result, data: result.data.map(OrganizationResponseDto.fromDomain) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an organization by ID' })
  @ApiParam({ name: 'id', description: 'Organization UUID' })
  @ApiResponse({ status: 200, type: OrganizationResponseDto })
  @ApiResponse({ status: 404 })
  async findOne(@Param('id') id: string): Promise<OrganizationResponseDto> {
    const org = await this.organizationsService.findById(id);
    return OrganizationResponseDto.fromDomain(org);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an organization (owner only)' })
  @ApiParam({ name: 'id', description: 'Organization UUID' })
  @ApiResponse({ status: 200, type: OrganizationResponseDto })
  @ApiResponse({ status: 403, description: 'Requester is not the owner' })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409, description: 'Slug is already taken' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const org = await this.organizationsService.update(id, user.id, dto);
    return OrganizationResponseDto.fromDomain(org);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an organization (owner only)' })
  @ApiParam({ name: 'id', description: 'Organization UUID' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 403, description: 'Requester is not the owner' })
  @ApiResponse({ status: 404 })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.organizationsService.remove(id, user.id);
  }
}
