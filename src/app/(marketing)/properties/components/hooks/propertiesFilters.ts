'use client';

export interface PropertiesFiltersState {
  priceRange: [number, number];
  bedrooms: string[];
  bathrooms: string[];
  propertyTypes: string[];
  transactionType: string;
  constructionStatus: string;
  floor: string;
  furniture: string;
  area: [number, number];
  amenities: string[];
  dateAdded: [Date | null, Date | null];
  quality: string[];
}

export type RemovableArrayFilterKey =
  | 'bedrooms'
  | 'bathrooms'
  | 'propertyTypes'
  | 'amenities'
  | 'quality';

export type RemovableFilterTarget =
  | keyof PropertiesFiltersState
  | 'search'
  | { arrayKey: RemovableArrayFilterKey; value: string };

export const CLEARABLE_PROPERTIES_QUERY_PARAMS = [
  'location',
  'minPrice',
  'maxPrice',
  'rooms',
  'status',
  'property_type',
  'type',
  'sort',
] as const;

export const createDefaultPropertiesFilters = (): PropertiesFiltersState => ({
  priceRange: [0, 1_000_000],
  bedrooms: [],
  bathrooms: [],
  propertyTypes: [],
  transactionType: '',
  constructionStatus: '',
  floor: '',
  furniture: '',
  area: [0, 10_000],
  amenities: [],
  dateAdded: [null, null],
  quality: [],
});
