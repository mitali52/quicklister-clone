import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../storage/storage.module';
import { ListingMediaController } from './listing-media.controller';
import { ListingMediaService } from './listing-media.service';
import { ListingMediaRepository } from './listing-media.repository';
import { LISTING_MEDIA_REPOSITORY } from './interfaces/listing-media-repository.interface';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [ListingMediaController],
  providers: [
    { provide: LISTING_MEDIA_REPOSITORY, useClass: ListingMediaRepository },
    ListingMediaService,
  ],
  exports: [ListingMediaService],
})
export class ListingMediaModule {}
