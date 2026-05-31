import type { ListingType, PropertyType } from '../listings/domain/listing';
import type { SortOption } from './domain/listing-search';

interface BuiltQuery {
  text: string;
  params: unknown[];
}

export class ListingSearchQueryBuilder {
  private readonly conditions: string[] = [
    'l.deleted_at IS NULL',
    "l.status = 'published'",
  ];
  private readonly params: unknown[] = [];

  private get nextParamIndex(): number {
    return this.params.length + 1;
  }

  withTextSearch(q: string): this {
    const i = this.nextParamIndex;
    this.params.push(`%${q}%`);
    // Single param referenced three times — valid PostgreSQL syntax
    this.conditions.push(
      `(l.title ILIKE $${i} OR l.description ILIKE $${i} OR l.city ILIKE $${i})`,
    );
    return this;
  }

  withListingType(type: ListingType): this {
    const i = this.nextParamIndex;
    this.params.push(type);
    this.conditions.push(`l.listing_type = $${i}`);
    return this;
  }

  withPropertyType(type: PropertyType): this {
    const i = this.nextParamIndex;
    this.params.push(type);
    this.conditions.push(`l.property_type = $${i}`);
    return this;
  }

  withMinPrice(minPrice: number): this {
    const i = this.nextParamIndex;
    this.params.push(minPrice);
    // COALESCE selects whichever price column is populated for the row
    this.conditions.push(`COALESCE(l.asking_price, l.monthly_rent) >= $${i}`);
    return this;
  }

  withMaxPrice(maxPrice: number): this {
    const i = this.nextParamIndex;
    this.params.push(maxPrice);
    this.conditions.push(`COALESCE(l.asking_price, l.monthly_rent) <= $${i}`);
    return this;
  }

  withMinBedrooms(min: number): this {
    const i = this.nextParamIndex;
    this.params.push(min);
    this.conditions.push(`l.bedrooms >= $${i}`);
    return this;
  }

  withMaxBedrooms(max: number): this {
    const i = this.nextParamIndex;
    this.params.push(max);
    this.conditions.push(`l.bedrooms <= $${i}`);
    return this;
  }

  withCity(city: string): this {
    const i = this.nextParamIndex;
    this.params.push(city.toLowerCase());
    this.conditions.push(`LOWER(l.city) = $${i}`);
    return this;
  }

  withPostcodePrefix(prefix: string): this {
    const i = this.nextParamIndex;
    // Uppercase normalisation matches how postcodes are stored
    this.params.push(`${prefix.toUpperCase()}%`);
    this.conditions.push(`l.postcode LIKE $${i}`);
    return this;
  }

  buildSelect(sortBy: SortOption, limit: number, offset: number): BuiltQuery {
    const where = this.conditions.join(' AND ');
    const orderBy = this.toOrderByClause(sortBy);
    const limitIdx = this.params.length + 1;
    const offsetIdx = this.params.length + 2;

    const text = `
      SELECT
        l.id,
        l.user_id,
        l.title,
        l.description,
        l.listing_type,
        l.property_type,
        l.asking_price,
        l.monthly_rent,
        l.address_line1,
        l.address_line2,
        l.city,
        l.postcode,
        l.bedrooms,
        l.bathrooms,
        l.created_at,
        l.updated_at,
        lm.url AS primary_photo_url
      FROM listings l
      LEFT JOIN listing_media lm
        ON lm.listing_id = l.id AND lm.is_primary = TRUE
      WHERE ${where}
      ORDER BY ${orderBy}
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `.trim();

    return { text, params: [...this.params, limit, offset] };
  }

  buildCount(): BuiltQuery {
    const where = this.conditions.join(' AND ');
    const text = `SELECT COUNT(*) AS total FROM listings l WHERE ${where}`.trim();
    return { text, params: [...this.params] };
  }

  private toOrderByClause(sortBy: SortOption): string {
    switch (sortBy) {
      case 'price_asc':
        return 'COALESCE(l.asking_price, l.monthly_rent) ASC NULLS LAST, l.created_at DESC';
      case 'price_desc':
        return 'COALESCE(l.asking_price, l.monthly_rent) DESC NULLS LAST, l.created_at DESC';
      case 'bedrooms_asc':
        return 'l.bedrooms ASC NULLS LAST, l.created_at DESC';
      case 'bedrooms_desc':
        return 'l.bedrooms DESC NULLS LAST, l.created_at DESC';
      case 'oldest':
        return 'l.created_at ASC';
      case 'newest':
      default:
        return 'l.created_at DESC';
    }
  }
}
