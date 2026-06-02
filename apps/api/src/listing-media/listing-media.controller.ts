import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ListingMediaService } from './listing-media.service';
import { ListingMediaResponseDto } from './dto/listing-media-response.dto';
import { ReorderListingMediaDto } from './dto/reorder-listing-media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

@ApiTags('listing-media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('listings/:listingId/media')
export class ListingMediaController {
  constructor(private readonly listingMediaService: ListingMediaService) {}

  @Get()
  @ApiOperation({ summary: 'List all media for a listing (owner only)' })
  @ApiParam({ name: 'listingId', description: 'Listing UUID' })
  @ApiResponse({ status: 200, type: [ListingMediaResponseDto] })
  async findAll(
    @Param('listingId', ParseUUIDPipe) listingId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ListingMediaResponseDto[]> {
    const media = await this.listingMediaService.findByListingId(
      listingId,
      user.id,
      user.roleName,
    );
    return media.map((item) => ListingMediaResponseDto.fromDomain(item));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload an image to a listing (owner only)' })
  @ApiParam({ name: 'listingId', description: 'Listing UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, type: ListingMediaResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 422, description: 'Image limit reached (max 20)' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async upload(
    @Param('listingId', ParseUUIDPipe) listingId: string,
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<ListingMediaResponseDto> {
    if (!file) {
      throw new BadRequestException(
        'No file provided. Send the image in a "file" form field.',
      );
    }
    const media = await this.listingMediaService.upload(
      listingId,
      user.id,
      file,
    );
    return ListingMediaResponseDto.fromDomain(media);
  }

  // Declared before DELETE /:mediaId to avoid route collision
  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder images for a listing (owner only)' })
  @ApiParam({ name: 'listingId', description: 'Listing UUID' })
  @ApiResponse({ status: 200, type: [ListingMediaResponseDto] })
  async reorder(
    @Param('listingId', ParseUUIDPipe) listingId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ReorderListingMediaDto,
  ): Promise<ListingMediaResponseDto[]> {
    const media = await this.listingMediaService.reorder(
      listingId,
      user.id,
      dto,
    );
    return media.map((item) => ListingMediaResponseDto.fromDomain(item));
  }

  @Delete(':mediaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a listing image (owner only)' })
  @ApiParam({ name: 'listingId', description: 'Listing UUID' })
  @ApiParam({ name: 'mediaId', description: 'Media UUID' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  async delete(
    @Param('listingId', ParseUUIDPipe) listingId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.listingMediaService.delete(listingId, mediaId, user.id);
  }
}
