import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PortalRecordsService } from './portal-records.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { CreatePortalRecordDto } from './dto/create-portal-record.dto';
import { UpdatePortalRecordDto } from './dto/update-portal-record.dto';

@UseGuards(JwtAuthGuard)
@Controller('portal-records')
export class PortalRecordsController {
  constructor(private readonly portalRecordsService: PortalRecordsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('type') type: string,
  ) {
    this.portalRecordsService.assertRecordType(type);
    return this.portalRecordsService.findAll(user.id, type);
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreatePortalRecordDto) {
    return this.portalRecordsService.create(user.id, dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePortalRecordDto,
  ) {
    return this.portalRecordsService.update(user.id, id, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.portalRecordsService.remove(user.id, id);
  }
}
