'use client';

import { memo, useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemeHydration } from '@/contexts/ThemeContext';
import { useFavorites, FavoriteProperty } from '@/contexts/FavoritesContext';
import { Bed, Bath, Maximize2, Heart, GitCompare } from 'lucide-react';
import PropertyImageCarousel from './PropertyImageCarousel';
import { getPropertyImages } from '@/lib/samplePropertyImages';
import { useCompare } from '@/contexts/CompareContext';
import GlowingShadow from '@/components/GlowingShadow';

interface PropertyCardProps {
  id: string;
  slug?: string;
  image: string;
  images?: string[]; // New prop for multiple images
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
  onHighlight?: (propertyId: number | null) => void;
  onFavoriteToggle?: (property: FavoriteProperty, nextIsFavorite: boolean) => void;
}

function PropertyCard({
  id,
  slug,
  image,
  images,
  price,
  address,
  bedrooms,
  bathrooms,
  sqft,
  floor,
  type,
  status,
  isNew,
  title,
  area,
  isHighlighted,
  onHighlight,
  onFavoriteToggle
}: PropertyCardProps) {
  const { t } = useLanguage();
  const isHydrated = useThemeHydration();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { toggle: toggleCompare, isSelected: isCompared } = useCompare();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [heartClick, setHeartClick] = useState(false);
  const propertyId = slug ?? id;
  const numericCardId = Number.parseInt(id, 10);
  const isCardCompared = Number.isFinite(numericCardId) && isCompared(numericCardId);
  
  // Generate multiple images for carousel if not provided
  const propertyImages = images || [image, ...getPropertyImages(id).slice(0, 4)];

  // Check if this property is in favorites
  const isPropertyFavorite = isFavorite(propertyId);

  // Note: do not auto-scroll on hover highlight to avoid jumpy UX.

  const handleFavoriteClick = (e: MouseEvent) => {
    e.stopPropagation();
    setHeartClick(true);
    setTimeout(() => setHeartClick(false), 300);
    
    // Create property object for favorites
    const propertyData: FavoriteProperty = {
      id: propertyId,
      title: title || address || t('property'),
      price,
      location: address,
      image,
      bedrooms,
      bathrooms,
      area: area || (sqft ? `${sqft} მ²` : undefined),
      type
    };
    const nextIsFavorite = !isPropertyFavorite;
    
    if (onFavoriteToggle) {
      onFavoriteToggle(propertyData, nextIsFavorite);
      return;
    }
    
    if (isPropertyFavorite) {
      removeFromFavorites(propertyId);
      console.log(`Property ${propertyId}: წაშლილია ფავორიტებიდან!`);
    } else {
      addToFavorites(propertyData);
      console.log(`Property ${propertyId}: დამატებულია ფავორიტებში!`);
    }
  };

  // Details view button currently unused

  const handleCompareClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (!Number.isFinite(numericCardId)) return;
    toggleCompare(numericCardId);
  };

  const handleCardClick = () => {
    console.log(`Card clicked for property ${propertyId}`);
    router.push(`/properties/${propertyId}`);
  };

  // Prevent hydration mismatch by not applying dynamic classes until hydrated
  const shouldApplyHoverEffects = isHydrated && isHovered;

  const cardInner = (
    <div className={isNew ? 'new-property-gradient-border' : ''}>
      <div 
        id={`property-${id}`}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden cursor-pointer
          transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 animate-fade-in
          transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0
          border border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800
          ${shouldApplyHoverEffects ? 'ring-1 ring-orange-300/30' : ''}
          ${isNew ? 'new-property-content' : ''}
          ${isHighlighted ? 'ring-4 ring-orange-500/50 shadow-2xl shadow-orange-500/25 scale-105 border-orange-500' : ''}
        `}
        onClick={handleCardClick}
        onMouseEnter={() => {
          setIsHovered(true);
          if (Number.isFinite(numericCardId)) {
            onHighlight?.(numericCardId);
          }
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Property Image Carousel with Overlays */}
        <div className="relative group">
          <PropertyImageCarousel
            images={propertyImages}
            alt={title || address || t('property')}
            onImageChange={(index) => console.log(`Property ${id} image changed to ${index}`)}
          />
          
          {/* Property Type and Status Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-20 opacity-100">
            {/* Status Badge - Only show one */}
            {status && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium shadow-sm border
                ${status === 'for-sale' 
                  ? 'bg-green-500 dark:bg-green-600 text-white border-green-600 dark:border-green-500' 
                  : 'bg-blue-500 dark:bg-blue-600 text-white border-blue-600 dark:border-blue-500'
                }
              `}>
                {status === 'for-sale' ? t('forSale') : t('forRent')}
              </span>
            )}
            
            {/* Property Type Badge - Show for all types */}
            {type && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-200/50 dark:border-gray-600/50">
                {type === 'apartment' && t('apartment')}
                {type === 'house' && t('house')}
                {type === 'villa' && t('villa')}
                {type === 'studio' && t('studio')}
                {type === 'penthouse' && t('penthouse')}
                {type === 'commercial' && t('commercial')}
              </span>
            )}
          </div>

          {/* Actions top-right */}
          {/* Compare button - shows on hover for desktop */}
          <div className={`absolute top-2 right-10 z-20 ${isCardCompared ? 'opacity-100' : 'opacity-80 md:opacity-0 md:group-hover:opacity-100'} transition-opacity duration-200`}>
            <button
              onClick={handleCompareClick}
              className={`w-6 h-6 rounded-full bg-white/80 dark:bg-gray-800/80 
                hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 
                flex items-center justify-center shadow-sm hover:shadow-md
                ${isCardCompared ? 'text-[#F08336]' : 'text-gray-600 dark:text-gray-400'}`}
              aria-pressed={isCardCompared}
              aria-label={isCardCompared ? t('addedToCompare') : t('addToCompare')}
              title={isCardCompared ? t('addedToCompare') : t('addToCompare')}
            >
              <GitCompare size={12} />
            </button>
          </div>

          {/* Favorite button - always visible when favorited */}
          <div className={`absolute top-2 right-2 z-20 ${isPropertyFavorite ? 'opacity-100' : 'opacity-80 md:opacity-0 md:group-hover:opacity-100'} transition-opacity duration-200`}>
            <button
              onClick={handleFavoriteClick}
              className={`w-6 h-6 rounded-full bg-white/80 dark:bg-gray-800/80 
                hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 
                flex items-center justify-center shadow-sm hover:shadow-md
                ${heartClick ? 'scale-90' : 'scale-100'} hover:scale-110
                ${isPropertyFavorite ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}
              `}
              aria-label={isPropertyFavorite ? t('removeFromFavorites') : t('addToFavorites')}
              title={isPropertyFavorite ? t('inFavorites') : t('addToFavorites')}
            >
              <Heart 
                size={12} 
                className={`transition-all duration-200 ${isPropertyFavorite ? 'fill-current' : ''}`} 
              />
            </button>
          </div>

          {/* New Property Badge */}
          {isNew && (
            <div className="absolute bottom-2 left-2 z-30">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 rounded-full shadow-lg border border-white/30">
                <span className="text-white text-xs font-bold tracking-wide drop-shadow-sm">{t('new')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="p-3 space-y-2">
          {/* Price */}
          <div className={`text-[#1A365D] dark:text-gray-100 text-sm font-semibold 
            transition-all duration-300 ease-out
            ${shouldApplyHoverEffects ? 'text-primary-600 dark:text-primary-400 transform translate-x-1' : ''}
          `}>
            {price}
          </div>

          {/* Address */}
          <div className={`text-[#4B5563] dark:text-gray-300 text-xs leading-4 
            transition-all duration-300 ease-out line-clamp-2
            ${shouldApplyHoverEffects ? 'text-gray-700 dark:text-gray-200 transform translate-x-0.5' : ''}
          `}>
            {address}
          </div>

          {/* Specifications */}
          <div className={`flex items-center justify-between text-[#6B7280] dark:text-gray-400 text-xs 
            transition-all duration-300 ease-out
            ${shouldApplyHoverEffects ? 'transform translate-x-0.5' : ''}
          `}>
            <div className="flex items-center gap-0.5 hover:scale-105 transition-transform duration-200">
              <Bed 
                className={`w-3 h-3 transition-all duration-300 text-gray-600 dark:text-gray-400
                  ${shouldApplyHoverEffects ? 'opacity-100 scale-110 text-primary-500' : 'opacity-80 dark:opacity-60'}
                `}
              />
              <span className="font-medium">{bedrooms || 0}</span>
            </div>
            
            <div className="flex items-center gap-0.5 hover:scale-105 transition-transform duration-200">
              <Bath 
                className={`w-3 h-3 transition-all duration-300 text-gray-600 dark:text-gray-400
                  ${shouldApplyHoverEffects ? 'opacity-100 scale-110 text-primary-500' : 'opacity-80 dark:opacity-60'}
                `}
              />
              <span className="font-medium">{bathrooms || 0}</span>
            </div>
            
            <div className="flex items-center gap-0.5 hover:scale-105 transition-transform duration-200">
              <Maximize2 
                className={`w-3 h-3 transition-all duration-300 text-gray-600 dark:text-gray-400
                  ${shouldApplyHoverEffects ? 'opacity-100 scale-110 text-primary-500' : 'opacity-80 dark:opacity-60'}
                `}
              />
              <span className="font-medium">{sqft || 0}</span>
            </div>
          </div>

          {/* Floor Information */}
          {floor && (
            <div className={`text-[#6B7280] dark:text-gray-400 text-xs 
              transition-all duration-300 ease-out
              ${shouldApplyHoverEffects ? 'transform translate-x-0.5' : ''}
            `}>
              <span className="font-medium">{t('floor')}: {floor}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return isNew ? (
    <GlowingShadow className="w-full" contentClassName="w-full">
      {cardInner}
    </GlowingShadow>
  ) : cardInner;
}

export default memo(PropertyCard);