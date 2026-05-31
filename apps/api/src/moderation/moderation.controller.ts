import {
  Controller,
  Get,
  Post,
  Param,
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
import { ModerationService } from './moderation.service';
import { GetQueueDto } from './dto/get-queue.dto';
import { ApproveListingDto } from './dto/approve-listing.dto';
import { RejectListingDto } from './dto/reject-listing.dto';
import {
  ModerationReviewDto,
  ModerationReviewWithReviewerDto,
  ReviewQueueResponseDto,
} from './dto/moderation-response.dto';

@Controller('moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('moderator', 'admin')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('queue')
  async getQueue(@Query() dto: GetQueueDto): Promise<ReviewQueueResponseDto> {
    const result = await this.moderationService.getQueue(dto.page, dto.limit);
    return ReviewQueueResponseDto.fromDomain(result);
  }

  @Post('listings/:listingId/approve')
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('listingId', ParseUUIDPipe) listingId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ApproveListingDto,
  ): Promise<ModerationReviewDto> {
    const review = await this.moderationService.approve(listingId, user.id, dto);
    return ModerationReviewDto.fromDomain(review);
  }

  @Post('listings/:listingId/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('listingId', ParseUUIDPipe) listingId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: RejectListingDto,
  ): Promise<ModerationReviewDto> {
    const review = await this.moderationService.reject(listingId, user.id, dto);
    return ModerationReviewDto.fromDomain(review);
  }

  @Get('listings/:listingId/reviews')
  async getReviewHistory(
    @Param('listingId', ParseUUIDPipe) listingId: string,
  ): Promise<ModerationReviewWithReviewerDto[]> {
    const reviews = await this.moderationService.getReviewHistory(listingId);
    return reviews.map((r) => ModerationReviewWithReviewerDto.fromDomain(r));
  }
}
