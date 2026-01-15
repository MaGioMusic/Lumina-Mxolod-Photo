'use client';

import React, { useState } from 'react';
import MapView from './MapView';
import { useTheme } from '@/contexts/ThemeContext';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
  agent: {
    name: string;
    avatar: string;
  };
  featured: boolean;
  forSale: boolean;
  coordinates: { lat: number; lng: number };
}

interface AdvancedFilters {
  propertyTypes: string[];
  transactionTypes: string[];
  constructionStatus: string[];
  floorOptions: string[];
  furnitureOptions: string[];
  amenities: string[];
  priceRange: [number, number];
  areaRange: [number, number];
  bedroomOptions: string[];
  bathroomOptions: string[];
}

const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Casa Lomas De Machali Machas',
    price: '$7250.00',
    location: '145 Brooklyn Ave, California, New York',
    beds: 4,
    baths: 2,
    sqft: 1150,
    image: '/images/properties/property-1.jpg',
    agent: {
      name: 'Esther Howard',
      avatar: '/images/photos/contact-1.jpg'
    },
    featured: true,
    forSale: true,
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: '2',
    title: 'Casa Lomas De Machali Machas',
    price: '$7250.00',
    location: '145 Brooklyn Ave, California, New York',
    beds: 2,
    baths: 2,
    sqft: 1150,
    image: '/images/properties/property-2.jpg',
    agent: {
      name: 'Savannah Nguyen',
      avatar: '/images/photos/contact-2.jpg'
    },
    featured: true,
    forSale: true,
    coordinates: { lat: 40.7138, lng: -74.0070 }
  },
  {
    id: '3',
    title: 'Casa Lomas De Machali Machas',
    price: '$7250.00',
    location: '145 Brooklyn Ave, California, New York',
    beds: 4,
    baths: 2,
    sqft: 1150,
    image: '/images/properties/property-3.jpg',
    agent: {
      name: 'Arlene McCoy',
      avatar: '/images/photos/contact-3.jpg'
    },
    featured: true,
    forSale: true,
    coordinates: { lat: 40.7148, lng: -74.0080 }
  },
  {
    id: '4',
    title: 'Casa Lomas De Machali Machas',
    price: '$7250.00',
    location: '145 Brooklyn Ave, California, New York',
    beds: 2,
    baths: 2,
    sqft: 1150,
    image: '/images/properties/property-4.jpg',
    agent: {
      name: 'Savannah Nguyen',
      avatar: '/images/photos/contact-4.jpg'
    },
    featured: true,
    forSale: true,
    coordinates: { lat: 40.7158, lng: -74.0090 }
  }
];

export default function MotiffTestPropertiesPage() {
  const [searchType, setSearchType] = useState<'rent' | 'sale'>('rent');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [advancedSearchModalOpen, setAdvancedSearchModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    propertyTypes: [],
    transactionTypes: [],
    constructionStatus: [],
    floorOptions: [],
    furnitureOptions: [],
    amenities: [],
    priceRange: [0, 1000000],
    areaRange: [0, 500],
    bedroomOptions: [],
    bathroomOptions: []
  });
  const { theme } = useTheme();

  // Filter options
  const filterOptions = {
    propertyTypes: [
      { value: 'apartment', label: 'ბინა', icon: '🏢' },
      { value: 'house', label: 'სახლი', icon: '🏠' },
      { value: 'villa', label: 'ვილა', icon: '🏡' },
      { value: 'commercial', label: 'კომერციული', icon: '🏢' }
    ],
    transactionTypes: [
      { value: 'for-sale', label: 'იყიდება' },
      { value: 'for-rent', label: 'ქირავდება' },
      { value: 'for-lease', label: 'იჯარებნა' }
    ],
    constructionStatus: [
      { value: 'new', label: 'ახალი აშენება' },
      { value: 'under-construction', label: 'მშენებარე' },
      { value: 'old', label: 'ძველი აშენება' },
      { value: 'renovated', label: 'რემონტირებული' }
    ],
    floorOptions: [
      { value: 'first', label: 'პირველი სართული' },
      { value: 'last', label: 'ბოლო სართული' },
      { value: 'middle', label: 'შუა სართულები' },
      { value: '1-5', label: '1-5 სართული' },
      { value: '6-10', label: '6-10 სართული' },
      { value: '11-15', label: '11-15 სართული' },
      { value: '16+', label: '16+ სართული' }
    ],
    furnitureOptions: [
      { value: 'furnished', label: 'ავეჯიანი' },
      { value: 'partially', label: 'ნაწილობრივ ავეჯიანი' },
      { value: 'unfurnished', label: 'ავეჯის გარეშე' }
    ],
    amenities: [
      { value: 'parking', label: 'პარკინგი', icon: '🚗' },
      { value: 'pool', label: 'აუზი', icon: '🏊' },
      { value: 'gym', label: 'სპორტდარბაზი', icon: '💪' },
      { value: 'garden', label: 'ბაღი', icon: '🌳' },
      { value: 'balcony', label: 'აივანი', icon: '🌿' },
      { value: 'ac', label: 'კონდიციონერი', icon: '❄️' }
    ],
    bedroomOptions: ['1', '2', '3', '4', '5+'],
    bathroomOptions: ['1', '2', '3', '4+']
  };

  // Toggle functions for filters
  const toggleFilter = (filterType: keyof AdvancedFilters, value: string) => {
    if (filterType === 'priceRange' || filterType === 'areaRange') return;
    
    setAdvancedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((item: string) => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const resetFilters = () => {
    setAdvancedFilters({
      propertyTypes: [],
      transactionTypes: [],
      constructionStatus: [],
      floorOptions: [],
      furnitureOptions: [],
      amenities: [],
      priceRange: [0, 1000000],
      areaRange: [0, 500],
      bedroomOptions: [],
      bathroomOptions: []
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#2F2F2F]' : 'bg-white'} font-['Geist',sans-serif]`}>
      {/* Advanced Search Modal */}
      {advancedSearchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
            theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
              theme === 'dark' ? 'border-gray-700 bg-[#1a1a1a]' : 'border-gray-200 bg-white'
            }`}>
              <h2 className={`text-2xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Advanced Search Filters</h2>
              <button
                onClick={() => setAdvancedSearchModalOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Property Types */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Property Type</h3>
                  <div className="space-y-3">
                    {filterOptions.propertyTypes.map((type) => (
                      <label key={type.value} className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{type.icon}</span>
                          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {type.label}
                          </span>
                        </div>
                        <div 
                          onClick={() => toggleFilter('propertyTypes', type.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            advancedFilters.propertyTypes.includes(type.value) 
                              ? 'bg-[#FFCB74]' 
                              : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            advancedFilters.propertyTypes.includes(type.value) ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Transaction Types */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Transaction Type</h3>
                  <div className="space-y-3">
                    {filterOptions.transactionTypes.map((type) => (
                      <label key={type.value} className="flex items-center justify-between cursor-pointer">
                        <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {type.label}
                        </span>
                        <div 
                          onClick={() => toggleFilter('transactionTypes', type.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            advancedFilters.transactionTypes.includes(type.value) 
                              ? 'bg-[#FFCB74]' 
                              : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            advancedFilters.transactionTypes.includes(type.value) ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Construction Status */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Construction Status</h3>
                  <div className="space-y-3">
                    {filterOptions.constructionStatus.map((status) => (
                      <label key={status.value} className="flex items-center justify-between cursor-pointer">
                        <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {status.label}
                        </span>
                        <div 
                          onClick={() => toggleFilter('constructionStatus', status.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            advancedFilters.constructionStatus.includes(status.value) 
                              ? 'bg-[#FFCB74]' 
                              : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            advancedFilters.constructionStatus.includes(status.value) ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Floor Options */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Floor</h3>
                  <div className="space-y-3">
                    {filterOptions.floorOptions.map((floor) => (
                      <label key={floor.value} className="flex items-center justify-between cursor-pointer">
                        <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {floor.label}
                        </span>
                        <div 
                          onClick={() => toggleFilter('floorOptions', floor.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            advancedFilters.floorOptions.includes(floor.value) 
                              ? 'bg-[#FFCB74]' 
                              : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            advancedFilters.floorOptions.includes(floor.value) ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Furniture */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Furniture</h3>
                  <div className="space-y-3">
                    {filterOptions.furnitureOptions.map((furniture) => (
                      <label key={furniture.value} className="flex items-center justify-between cursor-pointer">
                        <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {furniture.label}
                        </span>
                        <div 
                          onClick={() => toggleFilter('furnitureOptions', furniture.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            advancedFilters.furnitureOptions.includes(furniture.value) 
                              ? 'bg-[#FFCB74]' 
                              : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            advancedFilters.furnitureOptions.includes(furniture.value) ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Amenities</h3>
                  <div className="space-y-3">
                    {filterOptions.amenities.map((amenity) => (
                      <label key={amenity.value} className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{amenity.icon}</span>
                          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {amenity.label}
                          </span>
                        </div>
                        <div 
                          onClick={() => toggleFilter('amenities', amenity.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            advancedFilters.amenities.includes(amenity.value) 
                              ? 'bg-[#FFCB74]' 
                              : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            advancedFilters.amenities.includes(amenity.value) ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Bedrooms</h3>
                  <div className="space-y-3">
                    {filterOptions.bedroomOptions.map((bedroom) => (
                      <label key={bedroom} className="flex items-center justify-between cursor-pointer">
                        <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {bedroom} {bedroom === '1' ? 'საძინებელი' : 'საძინებლები'}
                        </span>
                        <div 
                          onClick={() => toggleFilter('bedroomOptions', bedroom)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            advancedFilters.bedroomOptions.includes(bedroom) 
                              ? 'bg-[#FFCB74]' 
                              : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            advancedFilters.bedroomOptions.includes(bedroom) ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bathrooms */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Bathrooms</h3>
                  <div className="space-y-3">
                    {filterOptions.bathroomOptions.map((bathroom) => (
                      <label key={bathroom} className="flex items-center justify-between cursor-pointer">
                        <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {bathroom} {bathroom === '1' ? 'სააბაზანო' : 'სააბაზანოები'}
                        </span>
                        <div 
                          onClick={() => toggleFilter('bathroomOptions', bathroom)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            advancedFilters.bathroomOptions.includes(bathroom) 
                              ? 'bg-[#FFCB74]' 
                              : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            advancedFilters.bathroomOptions.includes(bathroom) ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className={`sticky bottom-0 flex items-center justify-between p-6 border-t ${
              theme === 'dark' ? 'border-gray-700 bg-[#1a1a1a]' : 'border-gray-200 bg-white'
            }`}>
              <button
                onClick={resetFilters}
                className={`px-6 py-3 border rounded-full transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Reset All
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setAdvancedSearchModalOpen(false)}
                  className={`px-6 py-3 border rounded-full transition-colors ${
                    theme === 'dark' 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Apply filters logic here
                    setAdvancedSearchModalOpen(false);
                  }}
                  className="px-8 py-3 bg-[#FFCB74] text-white rounded-full hover:bg-[#E6B866] transition-colors font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className={`border-b px-8 py-4 ${
        theme === 'dark' 
          ? 'border-gray-700 bg-[#2F2F2F]' 
          : 'border-gray-100 bg-white'
      }`}>
        <div className="flex items-center gap-4">
          {/* For Rent/Sale Toggle */}
          <div className="flex rounded-full overflow-hidden">
            <button 
              onClick={() => setSearchType('rent')}
              className={`px-8 py-3 text-sm font-medium ${
                searchType === 'rent' 
                  ? 'bg-[#FFCB74] text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              For rent
            </button>
            <button 
              onClick={() => setSearchType('sale')}
              className={`px-8 py-3 text-sm font-medium ${
                searchType === 'sale' 
                  ? 'bg-[#FFCB74] text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              For Sale
            </button>
          </div>

          {/* Search Inputs */}
          <div className="flex items-center gap-4 flex-1">
            <div className={`flex items-center gap-2 px-4 py-3 border rounded-full min-w-[250px] ${
              theme === 'dark' 
                ? 'border-gray-600 bg-gray-700 text-white' 
                : 'border-gray-300 bg-white text-gray-700'
            }`}>
              <svg className={`w-4 h-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Type keyword..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${
                  theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-600 placeholder-gray-400'
                }`}
              />
            </div>

            <input 
              type="text" 
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`px-4 py-3 border rounded-full outline-none min-w-[250px] ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                  : 'border-gray-300 bg-white text-gray-700 placeholder-gray-400'
              }`}
            />

            <div className={`flex items-center justify-between px-4 py-3 border rounded-full min-w-[250px] ${
              theme === 'dark' 
                ? 'border-gray-600 bg-gray-700 text-white' 
                : 'border-gray-300 bg-white text-gray-700'
            }`}>
              <span>Type</span>
              <svg className={`w-4 h-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <button 
              onClick={() => setAdvancedSearchModalOpen(true)}
              className={`flex items-center gap-2 px-5 py-3 border rounded-full hover:bg-gray-50 transition-colors ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Search advanced</span>
              <svg className={`w-4 h-4 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </button>

            <button className="flex items-center gap-2 px-8 py-3 bg-[#FFCB74] text-white rounded-full hover:bg-[#E6B866] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Side - Properties List */}
        <div className={`w-[720px] p-8 overflow-y-auto ${
          theme === 'dark' ? 'bg-[#2F2F2F]' : 'bg-white'
        }`}>
          {/* Title & View Controls */}
          <div className="mb-6">
            <h1 className={`text-2xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Property Listing</h1>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button className={`p-2 border rounded ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button className={`p-2 border rounded ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-2 border rounded ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-700'
              }`}>
                <span>Sort by (Default)</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-6">
            {mockProperties.map((property) => (
              <div key={property.id} className={`border rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-gray-800 hover:shadow-gray-900/50' 
                  : 'border-gray-200 bg-white hover:shadow-lg'
              }`}>
                {/* Property Image */}
                <div 
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${property.image})` }}
                >
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {property.featured && (
                      <span className="px-2 py-1 bg-[#F08336] text-white text-xs rounded">
                        Featured
                      </span>
                    )}
                    {property.forSale && (
                      <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded">
                        For Sale
                      </span>
                    )}
                  </div>
                  
                  {/* Location */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-1 text-white text-xs">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{property.location}</span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <h3 className={`text-lg font-medium mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{property.title}</h3>
                  
                  {/* Property Stats */}
                  <div className={`flex items-center gap-4 text-sm mb-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                      <span>Beds: {property.beds}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                      <span>Baths: {property.baths}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                      <span>Sqft: {property.sqft}</span>
                    </div>
                  </div>

                  {/* Agent & Price */}
                  <div className={`flex items-center justify-between pt-4 border-t ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <img 
                        src={property.agent.avatar} 
                        alt={property.agent.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>{property.agent.name}</span>
                    </div>
                    <div className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{property.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="flex-1 relative">
          <MapView onPropertyHighlight={() => {}} />
        </div>
      </div>

      {/* AI Chat Component */}
      {/* AI Chat mounted globally in layout */}
    </div>
  );
} 