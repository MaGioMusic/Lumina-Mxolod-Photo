export interface MockProperty {
  id: number;
  image: string;
  images?: string[];
  price: number;
  address: string; // district key, translate at usage site
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  floor?: number;
  type: string;
  status: 'for-sale' | 'for-rent';
  isNew?: boolean;
  amenities: string[];
  year?: number;
}

let cached: MockProperty[] | null = null;

import { PROPERTY_IMAGES, pickPropertyImages } from './propertyImages';

export function getMockProperties(count: number = 100): MockProperty[] {
  if (cached && cached.length === count) return cached;

  const props = Array.from({ length: count }, (_, i) => {
    const basePrice = 100000 + (i * 4567) % 400000;
    const bedroomCount = (i % 4) + 1;
    const bathroomCount = (i % 3) + 1;
    const sqftValue = 50 + (i * 13) % 150;
    const floorValue = (i % 20) + 1;
    const districtKeys = ['vake', 'mtatsminda', 'saburtalo', 'isani', 'gldani'];
    const districtKey = districtKeys[i % districtKeys.length];
    const propertyTypes = ['apartment', 'house', 'villa', 'studio', 'penthouse'];
    const propertyType = propertyTypes[i % propertyTypes.length];
    let status: 'for-sale' | 'for-rent' = 'for-sale';
    if (propertyType === 'apartment' || propertyType === 'studio') {
      status = i % 3 === 0 ? 'for-rent' : 'for-sale';
    } else if (propertyType === 'house' || propertyType === 'villa') {
      status = i % 4 === 0 ? 'for-rent' : 'for-sale';
    }

    const imgIdx = ((i * 7 + 3) % PROPERTY_IMAGES.length); // disperse across full curated set
    return {
      id: i + 1,
      image: PROPERTY_IMAGES[imgIdx],
      images: pickPropertyImages(i, 4),
      price: basePrice,
      address: districtKey,
      bedrooms: bedroomCount,
      bathrooms: bathroomCount,
      sqft: sqftValue,
      floor: floorValue,
      type: propertyType,
      status,
      isNew: i % 7 === 0,
      amenities: [
        i % 2 === 0 ? 'parking' : null,
        i % 4 === 0 ? 'swimming_pool' : null,
        i % 3 === 0 ? 'gym' : null,
        i % 2 === 1 ? 'garden' : null,
        i % 3 === 1 ? 'balcony' : null,
        i % 5 === 0 ? 'air_conditioning' : null,
      ].filter(Boolean) as string[],
      year: 2000 + (i % 20),
    } as MockProperty;
  });

  cached = props;
  return props;
}

export function getMockPropertyById(id: number): MockProperty | undefined {
  const list = cached ?? getMockProperties();
  return list.find(p => p.id === id);
}


