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
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { type PaginatedResult } from './interfaces/users-repository.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthUser } from '../auth/interfaces/auth-user.interface';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── Profile (self-service) ──────────────────────────────────────────────────

  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user\'s profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getMyProfile(@CurrentUser() user: AuthUser): Promise<UserResponseDto> {
    const profile = await this.usersService.getProfile(user.id);
    return UserResponseDto.fromDomain(profile);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the authenticated user\'s profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async updateMyProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const updated = await this.usersService.updateProfile(user.id, dto);
    return UserResponseDto.fromDomain(updated);
  }

  @Patch('me/avatar')
  @ApiOperation({ summary: 'Update the authenticated user\'s avatar URL' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async updateMyAvatar(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateAvatarDto,
  ): Promise<UserResponseDto> {
    const updated = await this.usersService.updateAvatar(user.id, dto.avatarUrl);
    return UserResponseDto.fromDomain(updated);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change the authenticated user\'s password' })
  @ApiResponse({ status: 204, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async changeMyPassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.usersService.changePassword(user.id, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete the authenticated user\'s account' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  async deleteMyAccount(@CurrentUser() user: AuthUser): Promise<void> {
    await this.usersService.deleteAccount(user.id);
  }

  // ── Admin routes ────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all users (admin)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200 })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<PaginatedResult<UserResponseDto>> {
    const result = await this.usersService.findAll({
      page: Number.parseInt(page, 10),
      limit: Math.min(Number.parseInt(limit, 10), 100),
    });
    return { ...result, data: result.data.map(UserResponseDto.fromDomain) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID (admin)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404 })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    return UserResponseDto.fromDomain(user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a user (admin)' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(dto);
    return UserResponseDto.fromDomain(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID (admin)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, dto);
    return UserResponseDto.fromDomain(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a user by ID (admin)' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
