import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { LISTING_SEARCH_REPOSITORY } from './interfaces/listing-search-repository.interface';
import { ListingSearchRepository } from './listing-search.repository';
import { ListingSearchService } from './listing-search.service';
import { ListingSearchController } from './listing-search.controller';

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: LISTING_SEARCH_REPOSITORY, useClass: ListingSearchRepository },
    ListingSearchService,
  ],
  controllers: [ListingSearchController],
})
export class ListingSearchModule {}
