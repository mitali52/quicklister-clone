import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ListingSearchService } from './listing-search.service';
import { SearchListingsDto } from './dto/search-listings.dto';
import { ListingSearchResponseDto } from './dto/listing-search-response.dto';

@Controller('listings/search')
export class ListingSearchController {
  constructor(private readonly listingSearchService: ListingSearchService) {}

  @Get()
  @Public()
  async search(@Query() dto: SearchListingsDto): Promise<ListingSearchResponseDto> {
    const result = await this.listingSearchService.search(dto);
    return ListingSearchResponseDto.fromDomain(result);
  }
}
