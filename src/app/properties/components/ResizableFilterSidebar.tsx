'use client';

import React, { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Building, 
  Building2, 
  Warehouse,
  Bed,
  Bath,
  Car,
  Wifi,
  Waves,
  Dumbbell,
  Shield,
  MapPin,
  DollarSign,
  Maximize,
  X
} from 'lucide-react';

interface FiltersState {
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
}

interface ResizableFilterSidebarProps {
  onFiltersChange?: (filters: FiltersState) => void;
}

export default function ResizableFilterSidebar({ onFiltersChange }: ResizableFilterSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState<string[]>([]);
  const [selectedBathrooms, setSelectedBathrooms] = useState<string[]>([]);
  const [areaRange, setAreaRange] = useState<[number, number]>([0, 500]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [transactionType, setTransactionType] = useState('');

  // Update parent whenever filters change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        priceRange,
        bedrooms: selectedBedrooms,
        bathrooms: selectedBathrooms,
        propertyTypes: selectedPropertyTypes,
        transactionType,
        constructionStatus: '',
        floor: '',
        furniture: '',
        area: areaRange,
        amenities: selectedAmenities
      });
    }
  }, [priceRange, selectedPropertyTypes, selectedBedrooms, selectedBathrooms, areaRange, selectedAmenities, transactionType, onFiltersChange]);

  const propertyTypes = [
    { id: 'apartment', label: 'ბინა', icon: Building },
    { id: 'house', label: 'სახლი', icon: Home },
    { id: 'villa', label: 'ვილა', icon: Home },
    { id: 'studio', label: 'სტუდიო', icon: Building2 },
    { id: 'penthouse', label: 'პენთჰაუსი', icon: Building2 },
    { id: 'commercial', label: 'კომერციული', icon: Building2 },
    { id: 'land', label: 'მიწა', icon: Warehouse },
    { id: 'office', label: 'ოფისი', icon: Building2 }
  ];

  const amenities = [
    { id: 'parking', label: 'პარკინგი', icon: Car },
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'pool', label: 'აუზი', icon: Waves },
    { id: 'gym', label: 'სპორტდარბაზი', icon: Dumbbell },
    { id: 'security', label: 'უსაფრთხოება', icon: Shield },
    { id: 'garden', label: 'ბაღი', icon: MapPin }
  ];

  const getActiveFiltersCount = () => {
    let count = 0;
    if (priceRange[0] > 0 || priceRange[1] < 1000000) count++;
    if (selectedPropertyTypes.length > 0) count++;
    if (selectedBedrooms.length > 0) count++;
    if (selectedBathrooms.length > 0) count++;
    if (areaRange[0] > 0 || areaRange[1] < 500) count++;
    if (selectedAmenities.length > 0) count++;
    if (transactionType) count++;
    return count;
  };

  const clearAllFilters = () => {
    setPriceRange([0, 1000000]);
    setSelectedPropertyTypes([]);
    setSelectedBedrooms([]);
    setSelectedBathrooms([]);
    setAreaRange([0, 500]);
    setSelectedAmenities([]);
    setTransactionType('');
  };

  const togglePropertyType = (typeId: string) => {
    setSelectedPropertyTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const toggleBedroom = (count: string) => {
    setSelectedBedrooms(prev => 
      prev.includes(count) 
        ? prev.filter(c => c !== count)
        : [...prev, count]
    );
  };

  const toggleBathroom = (count: string) => {
    setSelectedBathrooms(prev => 
      prev.includes(count) 
        ? prev.filter(c => c !== count)
        : [...prev, count]
    );
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  if (isCollapsed) {
    return (
      <div className="h-full w-12 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
        <div className="w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {getActiveFiltersCount()}
        </div>
        <DollarSign className="h-5 w-5 text-gray-400" />
        <Building className="h-5 w-5 text-gray-400" />
        <Bed className="h-5 w-5 text-gray-400" />
        <Bath className="h-5 w-5 text-gray-400" />
        <Maximize className="h-5 w-5 text-gray-400" />
        <Wifi className="h-5 w-5 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full bg-white border-r border-gray-200 shadow-[inset_-1px_0_0_rgba(0,0,0,.03)]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900">ფილტრები</h2>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-primary-400 text-white text-xs px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>გასუფთავება</span>
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto h-full">
        {/* Transaction Type */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>გარიგების ტიპი</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {['იყიდება', 'ქირავდება'].map((type) => (
              <button
                key={type}
                onClick={() => setTransactionType(transactionType === type ? '' : type)}
                className={`p-2 text-sm rounded-lg border transition-colors ${
                  transactionType === type
                    ? 'bg-cream-100 border-primary-200 text-primary-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">ფასის დიაპაზონი</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="მინ"
                value={priceRange[0] || ''}
                onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="მაქს"
                value={priceRange[1] || ''}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 1000000])}
                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <input
              type="range"
              min="0"
              max="1000000"
              step="10000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-orange"
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>ქონების ტიპი</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {propertyTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => togglePropertyType(type.id)}
                  className={`p-3 rounded-lg border transition-colors flex flex-col items-center space-y-1 ${
                    selectedPropertyTypes.includes(type.id)
                      ? 'bg-cream-100 border-primary-200 text-primary-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bedrooms */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 flex items-center space-x-2">
            <Bed className="h-4 w-4" />
            <span>საძინებლები</span>
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {['1', '2', '3', '4+'].map((num) => (
              <button
                key={num}
                onClick={() => toggleBedroom(num)}
                className={`p-2 text-sm rounded-lg border transition-colors ${
                  selectedBedrooms.includes(num)
                    ? 'bg-cream-100 border-primary-200 text-primary-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Bathrooms */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 flex items-center space-x-2">
            <Bath className="h-4 w-4" />
            <span>აბაზანები</span>
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {['1', '2', '3', '4+'].map((num) => (
              <button
                key={num}
                onClick={() => toggleBathroom(num)}
                className={`p-2 text-sm rounded-lg border transition-colors ${
                  selectedBathrooms.includes(num)
                    ? 'bg-cream-100 border-primary-200 text-primary-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Area Range */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 flex items-center space-x-2">
            <Maximize className="h-4 w-4" />
            <span>ფართობი (მ²)</span>
          </h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="მინ"
                value={areaRange[0] || ''}
                onChange={(e) => setAreaRange([Number(e.target.value) || 0, areaRange[1]])}
                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="მაქს"
                value={areaRange[1] || ''}
                onChange={(e) => setAreaRange([areaRange[0], Number(e.target.value) || 500])}
                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={areaRange[1]}
              onChange={(e) => setAreaRange([areaRange[0], Number(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-orange"
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 flex items-center space-x-2">
            <Wifi className="h-4 w-4" />
            <span>სერვისები</span>
          </h3>
          <div className="space-y-2">
            {amenities.map((amenity) => {
              const Icon = amenity.icon;
              return (
                <label
                  key={amenity.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity.id)}
                    onChange={() => toggleAmenity(amenity.id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <Icon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{amenity.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-orange::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider-orange::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
} 