'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Upload, Image as ImageIcon, MapPin, Home, DollarSign } from 'lucide-react';
import LocationPicker from './LocationPicker';

interface UploadPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  location: LocationData | null;
  propertyType: string;
  transactionType: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  floor: string;
  totalFloors: string;
  constructionYear: string;
  condition: string;
  furnished: string;
  amenities: string[];
  images: File[];
}

export default function UploadPropertyModal({ isOpen, onClose }: UploadPropertyModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: '',
    location: null,
    propertyType: '',
    transactionType: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    floor: '',
    totalFloors: '',
    constructionYear: '',
    condition: '',
    furnished: '',
    amenities: [],
    images: []
  });

  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Separate handler for location data
  const handleLocationChange = (location: LocationData) => {
    setFormData(prev => ({
      ...prev,
      location
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const newImages = Array.from(files).slice(0, 10 - formData.images.length);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement actual upload logic
      console.log('Uploading property:', formData);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(t('propertyUploadSuccess'));
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert(t('propertyUploadError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const districts = [
    { value: 'vake', label: t('vake') },
    { value: 'mtatsminda', label: t('mtatsminda') },
    { value: 'saburtalo', label: t('saburtalo') },
    { value: 'isani', label: t('isani') },
    { value: 'gldani', label: t('gldani') },
    { value: 'didube', label: t('didube') },
    { value: 'krtsanisi', label: t('krtsanisi') },
    { value: 'nadzaladevi', label: t('nadzaladevi') }
  ];

  const propertyTypes = [
    { value: 'apartment', label: t('apartment') },
    { value: 'house', label: t('house') },
    { value: 'villa', label: t('villa') },
    { value: 'studio', label: t('studio') },
    { value: 'penthouse', label: t('penthouse') },
    { value: 'commercial', label: t('commercial') }
  ];

  const amenitiesList = [
    'parking', 'swimming_pool', 'gym', 'garden', 'balcony', 'air_conditioning',
    'elevator', 'security', 'internet', 'heating', 'fireplace', 'storage'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Home className="w-6 h-6 text-primary-500" />
            {t('uploadProperty')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              {t('basicInformation')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('propertyTitle')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 dark:bg-gray-700 dark:text-white"
                  placeholder={t('enterPropertyTitle')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('price')} (₾)
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('propertyType')}
                </label>
                <select
                  required
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('selectPropertyType')}</option>
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('transactionType')}
                </label>
                <select
                  required
                  value={formData.transactionType}
                  onChange={(e) => handleInputChange('transactionType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('selectTransactionType')}</option>
                  <option value="for-sale">{t('forSale')}</option>
                  <option value="for-rent">{t('forRent')}</option>
                  <option value="for-lease">{t('forLease')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('area')}
                </label>
                <input
                  type="number"
                  required
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <LocationPicker
                value={formData.location}
                onChange={handleLocationChange}
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('description')}
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 dark:bg-gray-700 dark:text-white"
                placeholder={t('enterPropertyDescription')}
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary-500" />
              {t('propertyDetails')}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('bedrooms')}
                </label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">-</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5+">5+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('bathrooms')}
                </label>
                <select
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">-</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('floor')}
                </label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => handleInputChange('floor', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('totalFloors')}
                </label>
                <input
                  type="number"
                  value={formData.totalFloors}
                  onChange={(e) => handleInputChange('totalFloors', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Images Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary-500" />
              {t('propertyImages')} ({formData.images.length}/10)
            </h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-primary-400 bg-cream-100 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleImageUpload(e.dataTransfer.files);
              }}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {t('dragDropImages')}
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-block px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 cursor-pointer transition-colors"
              >
                {t('selectImages')}
              </label>
            </div>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`${t('property')} ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('amenities')}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenitiesList.map(amenity => (
                <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t(amenity)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('uploading')}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {t('uploadProperty')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 