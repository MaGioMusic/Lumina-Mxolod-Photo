import React from 'react';
import PropertyCardImpl from '@/app/(marketing)/properties/components/PropertyCard';

interface PropertyCardProps {
  id: string;
  image: string;
  images?: string[];
  price: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  floor?: number;
  type?: string;
  status?: string;
  isNew?: boolean;
  title?: string;
  area?: string;
  isHighlighted?: boolean;
  onHighlight?: () => void;
}

export default function PropertyCard(props: PropertyCardProps) {
  // Delegate to the canonical card implementation used on properties page
  return <PropertyCardImpl {...(props as any)} />;
}