'use client';

import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Heart, House, Trash, List, SquaresFour, MapPin } from '@phosphor-icons/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getMockProperties } from '@/lib/mockProperties';
import { motion, AnimatePresence } from 'framer-motion';

export default function FavoritesPage() {
  const { t } = useLanguage();
  const { state, removeFromFavorites, clearFavorites, addToFavorites, isFavorite } = useFavorites();
  const router = useRouter();

  const { favorites, isLoading } = state;

  // Toolbar state
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'area-asc' | 'area-desc'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Toast state
  const [toast, setToast] = useState<string>('');
  const showToast = (msg: string) => {
    setToast(msg);
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast(''), 1800);
  };

  // Sorted favorites memo
  const sortedFavorites = useMemo(() => {
    const list = [...favorites];
    const priceNum = (p: string) => Number(String(p).replace(/[^0-9.]/g, '')) || 0;
    const areaNum = (a?: string) => Number(String(a || '').replace(/[^0-9.]/g, '')) || 0;
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => priceNum(a.price) - priceNum(b.price));
      case 'price-desc':
        return list.sort((a, b) => priceNum(b.price) - priceNum(a.price));
      case 'area-asc':
        return list.sort((a, b) => areaNum(a.area) - areaNum(b.area));
      case 'area-desc':
        return list.sort((a, b) => areaNum(b.area) - areaNum(a.area));
      default:
        return list; // newest (insertion order)
    }
  }, [favorites, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F08336] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading favorites...</p>
        </div>
      </div>
    );
  }

  const handlePropertyClick = (propertyId: string) => {
    router.push(`/properties/${propertyId}/dashboard`);
  };

  const handleRemoveFavorite = (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromFavorites(propertyId);
    showToast(t('removedFromFavorites') || 'Removed from favorites');
  };

  const handleClearAll = () => {
    if (confirm('ნამდვილად გსურთ ყველა ფავორიტის წაშლა?')) {
      clearFavorites();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="w-full px-2 sm:px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Heart size={32} className="text-[#F08336]" weight="fill" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t('favorites')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                თქვენი შერჩეული ქონება ({favorites.length})
              </p>
            </div>
          </div>

          {favorites.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
            >
              <Trash size={16} />
              <span>ყველას წაშლა</span>
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 border-b border-gray-200 dark:border-gray-800 pb-3 sticky top-16 bg-white/70 dark:bg-gray-900/70 backdrop-blur z-10">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {t('showing') || 'Showing'} {sortedFavorites.length} {t('propertiesCount') || 'properties'}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">{t('sortBy') || 'Sort'}:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border rounded-md px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="newest">{t('newest') || 'Newest'}</option>
              <option value="price-asc">{t('priceLowToHigh') || 'Price: Low → High'}</option>
              <option value="price-desc">{t('priceHighToLow') || 'Price: High → Low'}</option>
              <option value="area-asc">{t('areaSmallToLarge') || 'Area: Small → Large'}</option>
              <option value="area-desc">{t('areaLargeToSmall') || 'Area: Large → Small'}</option>
            </select>

            <div className="ml-2 flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 text-sm flex items-center gap-1 ${viewMode === 'grid' ? 'bg-orange-100 text-orange-700' : 'bg-transparent text-gray-600 dark:text-gray-300'}`}
                aria-pressed={viewMode === 'grid'}
              >
                <SquaresFour className="w-4 h-4" /> {t('grid') || 'Grid'}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 py-1 text-sm flex items-center gap-1 ${viewMode === 'list' ? 'bg-orange-100 text-orange-700' : 'bg-transparent text-gray-600 dark:text-gray-300'}`}
                aria-pressed={viewMode === 'list'}
              >
                <List className="w-4 h-4" /> {t('list') || 'List'}
              </button>
            </div>

            <button
              onClick={() => router.push('/properties')}
              className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              title={t('openMap') || 'Open Map'}
            >
              <MapPin className="w-4 h-4 text-[#F08336]" /> {t('openMap') || 'Open Map'}
            </button>
          </div>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
                <Heart size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              </motion.div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                ფავორიტები ცარიელია
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                დაიწყეთ ქონების მონიშვნა ❤️ ღილაკით რომ ისინი აქ გამოჩნდეს
              </p>
              <button
                onClick={() => router.push('/properties')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#F08336] hover:bg-[#D4AF37] text-white rounded-lg transition-colors duration-200"
              >
                <House size={20} />
                <span>ქონების ნახვა</span>
              </button>
            </div>

            {/* Recommended properties */}
            <div className="mt-12 text-left max-w-6xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('recommendedForYou') || 'Recommended for you'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getMockProperties(12).slice(0, 8).map((p) => {
                  const item = {
                    id: String(p.id),
                    title: `${p.type} • ${t(p.address)}`,
                    price: `$${p.price.toLocaleString()}`,
                    location: `${t('tbilisi') || 'Tbilisi'}, ${t(p.address)}`,
                    image: p.image,
                    bedrooms: p.bedrooms,
                    bathrooms: p.bathrooms,
                    area: `${p.sqft} მ²`,
                    type: p.type,
                  };
                  const added = isFavorite(item.id);
                  return (
                    <div key={p.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="relative h-36">
                        <Image src={p.image} alt={String(p.id)} fill className="object-cover" />
                      </div>
                      <div className="p-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{item.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{item.location}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-[#F08336] font-semibold">{item.price}</div>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (!added) {
                                addToFavorites(item as any);
                                showToast(t('addedToFavorites') || 'Added to favorites');
                              }
                            }}
                            disabled={added}
                            className={`px-3 py-1.5 text-sm rounded-md ${added ? 'bg-gray-200 dark:bg-gray-700 text-gray-500' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
                          >
                            {added ? (t('added') || 'Added') : (t('addToFavorites') || 'Add to favorites')}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Favorites List/Grid */
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}`}>
            {sortedFavorites.map((property) => (
              <div
                key={property.id}
                onClick={() => handlePropertyClick(property.id)}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg hover:border-[#F08336] transition-all duration-300 group ${viewMode === 'list' ? 'flex' : ''}`}
              >
                {/* Property Image */}
                <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-40 h-36 flex-shrink-0' : 'h-48'}`}>
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Remove from Favorites Button */}
                  <motion.button
                    onClick={(e) => handleRemoveFavorite(property.id, e)}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 hover:bg-red-50 dark:hover:bg-red-900/50 p-2 rounded-full shadow-md transition-colors duration-200 group/btn"
                  >
                    <motion.span initial={false} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.25 }}>
                      <Heart 
                        size={16} 
                        className="text-red-500 group-hover/btn:text-red-600" 
                        weight="fill" 
                      />
                    </motion.span>
                  </motion.button>

                  {/* Property Type Badge */}
                  {property.type && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-200/50 dark:border-gray-600/50">
                        {property.type === 'apartment' && t('apartment')}
                        {property.type === 'house' && t('house')}
                        {property.type === 'villa' && t('villa')}
                        {property.type === 'studio' && t('studio')}
                        {property.type === 'penthouse' && t('penthouse')}
                        {property.type === 'commercial' && t('commercial')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <div className="p-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                    {property.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-1">
                    📍 {property.location}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-[#F08336]">
                      {property.price}
                    </span>
                  </div>

                  {/* Property Features */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    {property.bedrooms && (
                      <div className="flex items-center space-x-1">
                        <span>🛏️</span>
                        <span>{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center space-x-1">
                        <span>🚿</span>
                        <span>{property.bathrooms}</span>
                      </div>
                    )}
                    {property.area && (
                      <div className="flex items-center space-x-1">
                        <span>📐</span>
                        <span>{property.area}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Properties Button */}
        {favorites.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/properties')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors duration-200"
            >
              <House size={20} />
              <span>მეტი ქონების ნახვა</span>
            </button>
          </div>
        )}
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
              role="status"
              aria-live="polite"
              className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg text-sm"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 