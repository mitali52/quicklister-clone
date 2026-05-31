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
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingResponseDto } from './dto/listing-response.dto';
import type { PaginatedResult } from './interfaces/listings-repository.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

@ApiTags('listings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  // ── Static sub-routes first (prevent collision with /:id) ─────────────────

  @Get('me')
  @ApiOperation({ summary: "List the authenticated user's own listings" })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async findMine(
    @CurrentUser() user: AuthUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<PaginatedResult<ListingResponseDto>> {
    const result = await this.listingsService.findMyListings(user.id, {
      page: Number.parseInt(page, 10),
      limit: Math.min(Number.parseInt(limit, 10), 100),
    });
    return { ...result, data: result.data.map(ListingResponseDto.fromDomain) };
  }

  @Get('pending-review')
  @Roles('moderator', 'admin')
  @ApiOperation({ summary: 'List listings pending review (moderator/admin)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async findPendingReview(
    @CurrentUser() user: AuthUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<PaginatedResult<ListingResponseDto>> {
    const result = await this.listingsService.findPendingReview(user.roleName, {
      page: Number.parseInt(page, 10),
      limit: Math.min(Number.parseInt(limit, 10), 100),
    });
    return { ...result, data: result.data.map(ListingResponseDto.fromDomain) };
  }

  // ── Collection routes ─────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a draft listing' })
  @ApiResponse({ status: 201, type: ListingResponseDto })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateListingDto,
  ): Promise<ListingResponseDto> {
    const listing = await this.listingsService.createDraft(user.id, dto);
    return ListingResponseDto.fromDomain(listing);
  }

  @Get()
  @Roles('moderator', 'admin')
  @ApiOperation({ summary: 'List all listings (moderator/admin)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<PaginatedResult<ListingResponseDto>> {
    const result = await this.listingsService.findAll(user.roleName, {
      page: Number.parseInt(page, 10),
      limit: Math.min(Number.parseInt(limit, 10), 100),
    });
    return { ...result, data: result.data.map(ListingResponseDto.fromDomain) };
  }

  // ── Item routes ───────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get a listing by ID' })
  @ApiParam({ name: 'id', description: 'Listing UUID' })
  @ApiResponse({ status: 200, type: ListingResponseDto })
  @ApiResponse({ status: 404 })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ListingResponseDto> {
    const listing = await this.listingsService.findById(id, user.id, user.roleName);
    return ListingResponseDto.fromDomain(listing);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a draft listing (owner only)' })
  @ApiParam({ name: 'id', description: 'Listing UUID' })
  @ApiResponse({ status: 200, type: ListingResponseDto })
  @ApiResponse({ status: 400, description: 'Listing is not in draft status' })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateListingDto,
  ): Promise<ListingResponseDto> {
    const listing = await this.listingsService.updateDraft(id, user.id, dto);
    return ListingResponseDto.fromDomain(listing);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit listing for review (owner only)' })
  @ApiParam({ name: 'id', description: 'Listing UUID' })
  @ApiResponse({ status: 200, type: ListingResponseDto })
  @ApiResponse({ status: 400, description: 'Listing is not in draft status' })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  async submitForReview(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ListingResponseDto> {
    const listing = await this.listingsService.submitForReview(id, user.id);
    return ListingResponseDto.fromDomain(listing);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin')
  @ApiOperation({ summary: 'Publish a listing (moderator/admin)' })
  @ApiParam({ name: 'id', description: 'Listing UUID' })
  @ApiResponse({ status: 200, type: ListingResponseDto })
  @ApiResponse({ status: 400, description: 'Listing is not in pending_review status' })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ListingResponseDto> {
    const listing = await this.listingsService.publish(id, user.roleName);
    return ListingResponseDto.fromDomain(listing);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a listing (owner or admin)' })
  @ApiParam({ name: 'id', description: 'Listing UUID' })
  @ApiResponse({ status: 200, type: ListingResponseDto })
  @ApiResponse({ status: 400, description: 'Listing is already archived' })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  async archive(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ListingResponseDto> {
    const listing = await this.listingsService.archive(id, user.id, user.roleName);
    return ListingResponseDto.fromDomain(listing);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a listing (owner or admin)' })
  @ApiParam({ name: 'id', description: 'Listing UUID' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.listingsService.remove(id, user.id, user.roleName);
  }
}
