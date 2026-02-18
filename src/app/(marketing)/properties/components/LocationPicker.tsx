'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { MapPin, Search, X } from 'lucide-react';

interface LocationData {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  district?: string;
  city?: string;
  country?: string;
}

interface LocationPickerProps {
  value: LocationData | null;
  onChange: (location: LocationData) => void;
  apiKey: string;
  className?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  apiKey,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  // Default to Tbilisi center
  const defaultCenter = { lat: 41.7151, lng: 44.7661 };
  const center = value?.coordinates || defaultCenter;

  const initializeServices = useCallback(() => {
    if (typeof window === 'undefined' || !window.google?.maps) return false;
    try {
      geocoder.current = new google.maps.Geocoder();
      if (window.google.maps.places?.AutocompleteService) {
        autocompleteService.current = new google.maps.places.AutocompleteService();
      } else {
        autocompleteService.current = null;
      }
      return true;
    } catch (error) {
      console.error('Google Maps services init error:', error);
      autocompleteService.current = null;
      geocoder.current = null;
      return false;
    }
  }, []);

  // Initialize Google Maps services after APIProvider script load
  useEffect(() => {
    if (initializeServices()) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (initializeServices() || attempts >= 20) {
        window.clearInterval(timer);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [apiKey, initializeServices]);

  // Search for address suggestions
  const searchAddresses = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      if (!autocompleteService.current) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const request = {
          input: query,
          componentRestrictions: { country: 'ge' }, // Restrict to Georgia
          types: ['address'],
        };

        autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
          }
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Address search error:', error);
        setIsLoading(false);
      }
    },
    []
  );

  // Handle address selection
  const handleAddressSelect = useCallback(
    async (placeId: string, description: string) => {
      if (!geocoder.current) return;

      setSearchQuery(description);
      setShowSuggestions(false);
      setIsLoading(true);

      try {
        geocoder.current.geocode({ placeId }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            const result = results[0];
            const location = result.geometry.location;
            
            // Extract address components
            const addressComponents = result.address_components;
            let district = '';
            let city = '';
            let country = '';

            addressComponents?.forEach(component => {
              if (component.types.includes('sublocality') || component.types.includes('sublocality_level_1')) {
                district = component.long_name;
              } else if (component.types.includes('locality')) {
                city = component.long_name;
              } else if (component.types.includes('country')) {
                country = component.long_name;
              }
            });

            const locationData: LocationData = {
              address: result.formatted_address,
              coordinates: {
                lat: location.lat(),
                lng: location.lng(),
              },
              district,
              city,
              country,
            };

            onChange(locationData);
          }
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Geocoding error:', error);
        setIsLoading(false);
      }
    },
    [onChange]
  );

  // Handle marker drag
  const handleMarkerDrag = useCallback(
    async (event: google.maps.MapMouseEvent) => {
      if (!event.latLng || !geocoder.current) return;

      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      setIsLoading(true);
      try {
        geocoder.current.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
              const result = results[0];
              const address = result.formatted_address;
              
              // Extract address components
              const addressComponents = result.address_components;
              let district = '';
              let city = '';
              let country = '';

              addressComponents?.forEach(component => {
                if (component.types.includes('sublocality') || component.types.includes('sublocality_level_1')) {
                  district = component.long_name;
                } else if (component.types.includes('locality')) {
                  city = component.long_name;
                } else if (component.types.includes('country')) {
                  country = component.long_name;
                }
              });

              const locationData: LocationData = {
                address,
                coordinates: { lat, lng },
                district,
                city,
                country,
              };

              setSearchQuery(address);
              onChange(locationData);
            }
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setIsLoading(false);
      }
    },
    [onChange]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!autocompleteService.current) {
      onChange({
        address: query,
        coordinates: value?.coordinates || defaultCenter,
        district: value?.district,
        city: value?.city,
        country: value?.country,
      });
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    if (query.length > 2) {
      searchAddresses(query);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Clear location
  const clearLocation = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onChange({
      address: '',
      coordinates: defaultCenter,
    });
  };

  return (
    <APIProvider apiKey={apiKey} libraries={['places']}>
      <div className={`space-y-4 ${className}`}>
        {/* Address Search Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            მისამართი
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="მოძებნეთ მისამართი..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 dark:bg-gray-700 dark:text-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearLocation}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-3 top-11 w-5 h-5">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-400 border-t-transparent"></div>
            </div>
          )}

          {/* Address Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  type="button"
                  onClick={() => handleAddressSelect(suggestion.place_id, suggestion.description)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                >
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {suggestion.structured_formatting?.main_text}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {suggestion.structured_formatting?.secondary_text}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <Map
            defaultCenter={center}
            center={center}
            defaultZoom={15}
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{
              width: '100%',
              height: '100%',
            }}
            mapTypeId="roadmap"
            /* theme-based styles omitted to match Map props typing */
          >
            <Marker
              position={center}
              draggable={true}
              onDragEnd={handleMarkerDrag}
              title="გადაადგილეთ ზუსტი მდებარეობისთვის"
            />
          </Map>
        </div>

        {/* Selected Location Info */}
        {value?.address && (
          <div className="bg-cream-100 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-primary-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-orange-900 dark:text-orange-200">
                  არჩეული მდებარეობა:
                </div>
                <div className="text-sm text-primary-700 dark:text-orange-300 break-words">
                  {value.address}
                </div>
                {value.coordinates && (
                  <div className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                    {value.coordinates.lat.toFixed(6)}, {value.coordinates.lng.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </APIProvider>
  );
};

export default LocationPicker; 