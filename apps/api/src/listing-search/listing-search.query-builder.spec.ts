import { ListingSearchQueryBuilder } from './listing-search.query-builder';

describe('ListingSearchQueryBuilder', () => {
  describe('buildCount', () => {
    it('includes the base conditions by default', () => {
      const { text, params } = new ListingSearchQueryBuilder().buildCount();

      expect(text).toContain("l.status = 'published'");
      expect(text).toContain('l.deleted_at IS NULL');
      expect(params).toHaveLength(0);
    });
  });

  describe('buildSelect', () => {
    it('joins listing_media for primary photo', () => {
      const { text } = new ListingSearchQueryBuilder().buildSelect('newest', 20, 0);

      expect(text).toContain('LEFT JOIN listing_media lm');
      expect(text).toContain('lm.is_primary = TRUE');
      expect(text).toContain('lm.url AS primary_photo_url');
    });

    it('applies LIMIT and OFFSET as the last two params', () => {
      const { params } = new ListingSearchQueryBuilder().buildSelect('newest', 10, 40);

      expect(params.at(-2)).toBe(10);
      expect(params.at(-1)).toBe(40);
    });

    it('orders by created_at DESC for newest', () => {
      const { text } = new ListingSearchQueryBuilder().buildSelect('newest', 20, 0);
      expect(text).toContain('l.created_at DESC');
    });

    it('orders by created_at ASC for oldest', () => {
      const { text } = new ListingSearchQueryBuilder().buildSelect('oldest', 20, 0);
      expect(text).toContain('l.created_at ASC');
    });

    it('orders by COALESCE price ASC for price_asc', () => {
      const { text } = new ListingSearchQueryBuilder().buildSelect('price_asc', 20, 0);
      expect(text).toContain('COALESCE(l.asking_price, l.monthly_rent) ASC NULLS LAST');
    });

    it('orders by COALESCE price DESC for price_desc', () => {
      const { text } = new ListingSearchQueryBuilder().buildSelect('price_desc', 20, 0);
      expect(text).toContain('COALESCE(l.asking_price, l.monthly_rent) DESC NULLS LAST');
    });

    it('orders by bedrooms ASC NULLS LAST for bedrooms_asc', () => {
      const { text } = new ListingSearchQueryBuilder().buildSelect('bedrooms_asc', 20, 0);
      expect(text).toContain('l.bedrooms ASC NULLS LAST');
    });

    it('orders by bedrooms DESC NULLS LAST for bedrooms_desc', () => {
      const { text } = new ListingSearchQueryBuilder().buildSelect('bedrooms_desc', 20, 0);
      expect(text).toContain('l.bedrooms DESC NULLS LAST');
    });
  });

  describe('withTextSearch', () => {
    it('adds an ILIKE condition and wraps the term in wildcards', () => {
      const builder = new ListingSearchQueryBuilder().withTextSearch('london');
      const { text, params } = builder.buildCount();

      expect(params).toContain('%london%');
      expect(text).toContain('l.title ILIKE');
      expect(text).toContain('l.description ILIKE');
      expect(text).toContain('l.city ILIKE');
    });

    it('references the same param index three times', () => {
      const { text } = new ListingSearchQueryBuilder().withTextSearch('test').buildCount();
      // $1 should appear three times (title, description, city)
      const matches = text.match(/\$1/g);
      expect(matches).toHaveLength(3);
    });
  });

  describe('withListingType', () => {
    it('adds a listing_type equality condition', () => {
      const { text, params } = new ListingSearchQueryBuilder()
        .withListingType('residential_let')
        .buildCount();

      expect(text).toContain('l.listing_type = $1');
      expect(params[0]).toBe('residential_let');
    });
  });

  describe('withPropertyType', () => {
    it('adds a property_type equality condition', () => {
      const { text, params } = new ListingSearchQueryBuilder()
        .withPropertyType('flat')
        .buildCount();

      expect(text).toContain('l.property_type = $1');
      expect(params[0]).toBe('flat');
    });
  });

  describe('withMinPrice', () => {
    it('adds a COALESCE >= condition', () => {
      const { text, params } = new ListingSearchQueryBuilder()
        .withMinPrice(50000)
        .buildCount();

      expect(text).toContain('COALESCE(l.asking_price, l.monthly_rent) >= $1');
      expect(params[0]).toBe(50000);
    });
  });

  describe('withMaxPrice', () => {
    it('adds a COALESCE <= condition', () => {
      const { text, params } = new ListingSearchQueryBuilder()
        .withMaxPrice(300000)
        .buildCount();

      expect(text).toContain('COALESCE(l.asking_price, l.monthly_rent) <= $1');
      expect(params[0]).toBe(300000);
    });
  });

  describe('withMinBedrooms', () => {
    it('adds a bedrooms >= condition', () => {
      const { text, params } = new ListingSearchQueryBuilder()
        .withMinBedrooms(2)
        .buildCount();

      expect(text).toContain('l.bedrooms >= $1');
      expect(params[0]).toBe(2);
    });
  });

  describe('withMaxBedrooms', () => {
    it('adds a bedrooms <= condition', () => {
      const { text, params } = new ListingSearchQueryBuilder()
        .withMaxBedrooms(4)
        .buildCount();

      expect(text).toContain('l.bedrooms <= $1');
      expect(params[0]).toBe(4);
    });
  });

  describe('withCity', () => {
    it('lowercases the value and uses LOWER(l.city) comparison', () => {
      const { text, params } = new ListingSearchQueryBuilder()
        .withCity('London')
        .buildCount();

      expect(text).toContain('LOWER(l.city) = $1');
      expect(params[0]).toBe('london');
    });
  });

  describe('withPostcodePrefix', () => {
    it('uppercases the prefix and appends a wildcard', () => {
      const { text, params } = new ListingSearchQueryBuilder()
        .withPostcodePrefix('sw1')
        .buildCount();

      expect(text).toContain('l.postcode LIKE $1');
      expect(params[0]).toBe('SW1%');
    });
  });

  describe('chaining multiple filters', () => {
    it('assigns sequential param indexes to each filter', () => {
      const builder = new ListingSearchQueryBuilder()
        .withListingType('residential_let')
        .withPropertyType('flat')
        .withMinBedrooms(2);

      const { text, params } = builder.buildCount();

      expect(params).toHaveLength(3);
      expect(text).toContain('l.listing_type = $1');
      expect(text).toContain('l.property_type = $2');
      expect(text).toContain('l.bedrooms >= $3');
    });

    it('buildSelect LIMIT/OFFSET follow filter params', () => {
      const builder = new ListingSearchQueryBuilder()
        .withListingType('residential_sale')
        .withMinPrice(100000);

      const { text, params } = builder.buildSelect('price_asc', 10, 20);

      // 2 filters + 2 pagination = 4 params total
      expect(params).toHaveLength(4);
      expect(text).toContain('$3');  // LIMIT
      expect(text).toContain('$4');  // OFFSET
    });
  });
});
