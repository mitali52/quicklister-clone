import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { ListingsRepository } from './listings.repository';
import { LISTINGS_REPOSITORY } from './interfaces/listings-repository.interface';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ListingsController],
  providers: [
    { provide: LISTINGS_REPOSITORY, useClass: ListingsRepository },
    ListingsService,
  ],
  exports: [ListingsService],
})
export class ListingsModule {}
