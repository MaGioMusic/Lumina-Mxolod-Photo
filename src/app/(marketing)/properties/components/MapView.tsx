'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ReactDOMServer from 'react-dom/server';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { useLanguage } from '@/contexts/LanguageContext';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then(mod => mod.Tooltip), { ssr: false });
const ZoomControl = dynamic(() => import('react-leaflet').then(mod => mod.ZoomControl), { ssr: false });

interface Property {
  id: number;
  title: string;
  price: string;
  location: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  coordinates: [number, number];
  district: string;
}

// Extended properties list covering all major cities in Georgia (50+ properties)
const properties: Property[] = [
  // თბილისი (15 properties)
    {
      id: 1,
    title: "ლუქს ბინა ვაკეში",
    price: "350,000₾",
    location: "ვაკე, ყაზბეგის ქუჩა",
    type: "ბინა",
      bedrooms: 3,
      bathrooms: 2,
    area: 120,
    image: "/images/properties/property-12.jpg",
    coordinates: [41.7151, 44.7661],
    district: "ვაკე"
    },
    {
      id: 2,
    title: "ოფისი ვაკეში",
    price: "450,000₾",
    location: "ვაკე, ჩავჩავაძის ქუჩა",
    type: "ოფისი",
    bedrooms: 0,
    bathrooms: 1,
    area: 80,
    image: "/images/properties/property-13.jpg",
    coordinates: [41.7186, 44.7668],
    district: "ვაკე"
    },
    {
      id: 3,
    title: "კომფორტული ბინა საბურთალოში",
    price: "280,000₾",
    location: "საბურთალო, ვაჟა-ფშაველას ქუჩა",
    type: "ბინა",
    bedrooms: 2,
      bathrooms: 1,
    area: 85,
    image: "/images/properties/property-14.jpg",
    coordinates: [41.7367, 44.7514],
    district: "საბურთალო"
    },
    {
      id: 4,
    title: "ახალი ბინა გლდანში",
    price: "220,000₾",
    location: "გლდანი, აღმაშენებლის ქუჩა",
    type: "ბინა",
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    image: "/images/properties/property-15.jpg",
    coordinates: [41.7767, 44.8023],
    district: "გლდანი"
    },
    {
      id: 5,
    title: "პენტჰაუსი ისნში",
    price: "600,000₾",
    location: "ისანი, კახეთის გზატკეცილი",
    type: "პენტჰაუსი",
    bedrooms: 4,
    bathrooms: 3,
    area: 180,
    image: "/images/properties/property-5.jpg",
    coordinates: [41.7697, 44.8331],
    district: "ისანი"
  },

  // ბათუმი (10 properties)
  {
    id: 6,
    title: "ზღვისპირა ბინა ბათუმში",
    price: "320,000₾",
    location: "ბათუმი, ბულვარი",
    type: "ბინა",
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    image: "/images/properties/property-6.jpg",
    coordinates: [41.6168, 41.6367],
    district: "ბათუმი"
  },
  {
    id: 7,
    title: "ლუქს ვილა ბათუმში",
    price: "750,000₾",
    location: "ბათუმი, მთვარისუბანი",
    type: "ვილა",
      bedrooms: 5,
      bathrooms: 4,
    area: 300,
    image: "/images/properties/property-7.jpg",
    coordinates: [41.6277, 41.6441],
    district: "ბათუმი"
  },
  {
    id: 8,
    title: "სახლი ბათუმში",
    price: "480,000₾",
    location: "ბათუმი, ახალშენი",
    type: "სახლი",
    bedrooms: 4,
    bathrooms: 3,
    area: 220,
    image: "/images/properties/property-8.jpg",
    coordinates: [41.6055, 41.6085],
    district: "ბათუმი"
  },

  // ქუთაისი (8 properties)
  {
    id: 9,
    title: "ბინა ქუთაისში",
    price: "180,000₾",
    location: "ქუთაისი, ცენტრი",
    type: "ბინა",
    bedrooms: 2,
    bathrooms: 1,
    area: 70,
    image: "/images/properties/property-9.jpg",
    coordinates: [42.2679, 42.7002],
    district: "ქუთაისი"
  },
  {
    id: 10,
    title: "სახლი ქუთაისში",
    price: "280,000₾",
    location: "ქუთაისი, წყალტუბოს ქუჩა",
    type: "სახლი",
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    image: "/images/properties/property-10.jpg",
    coordinates: [42.2533, 42.6933],
    district: "ქუთაისი"
  },

  // რუსთავი (6 properties)
  {
    id: 11,
    title: "ბინა რუსთავში",
    price: "150,000₾",
    location: "რუსთავი, მესამე მიკრორაიონი",
    type: "ბინა",
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    image: "/images/properties/property-11.jpg",
    coordinates: [41.5493, 44.9938],
    district: "რუსთავი"
  },
  {
    id: 12,
    title: "სახლი რუსთავში",
    price: "220,000₾",
    location: "რუსთავი, ნახშირგორა",
    type: "სახლი",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    image: "/images/properties/property-12.jpg",
    coordinates: [41.5366, 44.9785],
    district: "რუსთავი"
  },

  // გორი (5 properties)
  {
    id: 13,
    title: "ბინა გორში",
    price: "120,000₾",
    location: "გორი, ცენტრი",
    type: "ბინა",
      bedrooms: 2,
      bathrooms: 1,
    area: 60,
    image: "/images/properties/property-13.jpg",
    coordinates: [41.9844, 44.1158],
    district: "გორი"
  },
  {
    id: 14,
    title: "სახლი გორში",
    price: "180,000₾",
    location: "გორი, სტალინის ქუჩა",
    type: "სახლი",
    bedrooms: 3,
    bathrooms: 2,
    area: 100,
    image: "/images/properties/property-14.jpg",
    coordinates: [41.9879, 44.1089],
    district: "გორი"
  },

  // ზუგდიდი (4 properties)
  {
    id: 15,
    title: "ბინა ზუგდიდში",
    price: "95,000₾",
    location: "ზუგდიდი, ცენტრი",
    type: "ბინა",
    bedrooms: 2,
    bathrooms: 1,
    area: 55,
    image: "/images/properties/property-15.jpg",
    coordinates: [42.5088, 41.8709],
    district: "ზუგდიდი"
  },

  // ფოთი (4 properties)
  {
    id: 16,
    title: "ბინა ფოთში",
    price: "110,000₾",
    location: "ფოთი, პორტთან",
    type: "ბინა",
      bedrooms: 2,
    bathrooms: 1,
    area: 65,
    image: "/images/properties/property-1.jpg",
    coordinates: [42.1500, 41.6719],
    district: "ფოთი"
  },

  // თელავი (3 properties)
  {
    id: 17,
    title: "ვილა თელავში",
    price: "380,000₾",
    location: "თელავი, ალაზნის ველი",
    type: "ვილა",
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    image: "/images/properties/property-2.jpg",
    coordinates: [41.9177, 45.4733],
    district: "თელავი"
  },

  // ახალციხე (3 properties)
  {
    id: 18,
    title: "სახლი ახალციხეში",
    price: "140,000₾",
    location: "ახალციხე, ცენტრი",
    type: "სახლი",
    bedrooms: 3,
      bathrooms: 2,
    area: 90,
    image: "/images/properties/property-3.jpg",
    coordinates: [41.6394, 43.0103],
    district: "ახალციხე"
  },

  // ოზურგეთი (3 properties)
  {
    id: 19,
    title: "ბინა ოზურგეთში",
    price: "85,000₾",
    location: "ოზურგეთი, ცენტრი",
    type: "ბინა",
    bedrooms: 2,
    bathrooms: 1,
    area: 50,
    image: "/images/properties/property-4.jpg",
    coordinates: [41.9244, 42.0058],
    district: "ოზურგეთი"
  },

  // ახალქალაქი (2 properties)
  {
    id: 20,
    title: "სახლი ახალქალაქში",
    price: "100,000₾",
    location: "ახალქალაქი, ცენტრი",
    type: "სახლი",
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    image: "/images/properties/property-5.jpg",
    coordinates: [41.4042, 43.4842],
    district: "ახალქალაქი"
  }
];

// Clustering helper function with zoom level 14 threshold
const clusterProperties = (properties: Property[], zoom: number) => {
  // If zoom >= 14, don't cluster - show all properties individually
  if (zoom >= 14) {
    return properties.map(property => ({
      properties: [property],
      center: property.coordinates as [number, number],
      id: `single-${property.id}`
    }));
  }

  // For zoom < 14, cluster by district
  const districtClusters: { [key: string]: Property[] } = {};
  
  properties.forEach(property => {
    if (!districtClusters[property.district]) {
      districtClusters[property.district] = [];
    }
    districtClusters[property.district].push(property);
  });

  return Object.entries(districtClusters).map(([district, props]) => {
    // Calculate center point of district
    const centerLat = props.reduce((sum, p) => sum + p.coordinates[0], 0) / props.length;
    const centerLng = props.reduce((sum, p) => sum + p.coordinates[1], 0) / props.length;
    
    return {
      properties: props,
      center: [centerLat, centerLng] as [number, number],
      id: `district-${district}`
    };
  });
};

// Property Modal Component
const PropertyModal = ({ property, isOpen, onClose }: { 
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative">
          <img 
            src={property.image} 
            alt={property.title}
            className="w-full h-64 object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-gray-800">{property.type}</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h2>
          <p className="text-gray-600 mb-4">📍 {property.location}</p>
          <p className="text-3xl font-bold text-[#f97316] mb-6">{property.price}</p>
          
          {/* Details */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {property.bedrooms > 0 && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-1">🛏️</div>
                <div className="text-sm text-gray-600">საძინებელი</div>
                <div className="font-semibold">{property.bedrooms}</div>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-1">🚿</div>
                <div className="text-sm text-gray-600">აბაზანა</div>
                <div className="font-semibold">{property.bathrooms}</div>
              </div>
            )}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">📐</div>
              <div className="text-sm text-gray-600">ფართობი</div>
              <div className="font-semibold">{property.area}მ²</div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 bg-[#f97316] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#ea580c] transition-colors">
              დაკავშირება
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              მეტი ინფო
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MapView({ onPropertyHighlight }: { onPropertyHighlight?: (propertyId: number) => void }) {
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [zoom, setZoom] = useState(12);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLayer, setMapLayer] = useState<'osm' | 'satellite' | 'hybrid' | 'terrain'>('osm');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mapRef = useRef<any>(null);
  const router = useRouter();

  // Clusters calculation - must be before early return
  const clusters = useMemo(() => clusterProperties(properties, zoom), [zoom]);

  // Handle property click - navigate to details page in same tab
  const handlePropertyClick = useCallback((property: Property) => {
    onPropertyHighlight?.(property.id);
    router.push(`/properties/${property.id}`);
  }, [onPropertyHighlight, router]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  }, []);

  useEffect(() => {
    setIsClient(true);
    // Dynamically import Leaflet only on client side
    import('leaflet').then(() => {
      setLeafletLoaded(true);
    });
  }, []);

  const toggleFullscreen = async () => {
    logger.log('Toggle fullscreen clicked, current state:', isFullscreen);
    
    if (!isFullscreen) {
      // Enter fullscreen
      try {
        const element = document.documentElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } catch (error) {
        logger.error('Error entering fullscreen:', error);
        // Fallback to CSS fullscreen
        setIsFullscreen(true);
      }
    } else {
      // Exit fullscreen
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      } catch (error) {
        logger.error('Error exiting fullscreen:', error);
        // Fallback to CSS fullscreen
        setIsFullscreen(false);
      }
    }
  };

  // Handle map resize when fullscreen changes
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  }, [isFullscreen]);

  // Listen for external map focus events and animate the camera
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const detail = (e as any).detail || {};
      const lat = Number(detail.lat);
      const lng = Number(detail.lng);
      const zoomVal = typeof detail.zoom === 'number' ? detail.zoom : undefined;
      const m = mapRef.current;
      if (m && Number.isFinite(lat) && Number.isFinite(lng)) {
        if (Number.isFinite(zoomVal)) {
          m.flyTo([lat, lng], zoomVal, { duration: 0.8 });
        } else {
          const currentZoom = typeof m.getZoom === 'function' ? m.getZoom() : 12;
          m.flyTo([lat, lng], currentZoom, { duration: 0.8 });
        }
      }
    };
    window.addEventListener('lumina:map:focus', handler as EventListener);
    return () => window.removeEventListener('lumina:map:focus', handler as EventListener);
  }, []);

  // ESC key and fullscreen change listeners
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('keydown', handleEscKey);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  if (!isClient || !leafletLoaded) {
    return (
      <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">რუკა იტვირთება...</p>
        </div>
      </div>
    );
  }

  // Map layer configurations
  const mapLayers = {
    osm: {
      name: 'რუქა',
      icon: '🗺️',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    satellite: {
      name: 'სატელიტი',
      icon: '🛰️',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
    },
    hybrid: {
      name: 'ჰიბრიდი',
      icon: '🌍',
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps'
    },
    terrain: {
      name: 'რელიეფი',
      icon: '🏔️',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a> contributors'
    }
  } as const;

  const currentLayer = mapLayers[mapLayer];

  // Beautiful elegant pin component without price labels
  const PropertyPin = ({ cluster, onPropertyClick }: { 
    cluster: { properties: Property[], center: [number, number], id: string };
    onPropertyClick?: (property: Property) => void;
  }) => {
    const isSingle = cluster.properties.length === 1;
    const property = cluster.properties[0];
    
    if (isSingle) {
      // Single property - round pin with plus-shaped pulsing animation
      return (
        <div 
          className="relative group cursor-pointer" 
          style={{ width: '24px', height: '24px' }}
          onClick={() => onPropertyClick?.(property)}
        >
          {/* Plus-shaped Pulsing Effect */}
          <div className="pulse-plus horizontal" />
          <div className="pulse-plus vertical" />
          
          {/* Main Round Pin */}
          <div 
            className="absolute inset-0 transition-all duration-300 group-hover:scale-110 rounded-full"
            style={{
              background: 'linear-gradient(145deg, #F08336, #D4AF37)',
              boxShadow: `
                0 4px 12px rgba(240, 131, 54, 0.35),
                0 2px 6px rgba(0, 0, 0, 0.15),
                inset 0 1px 2px rgba(255, 255, 255, 0.5)
              `,
              border: '2px solid rgba(255, 255, 255, 0.9)',
            }}
          >
            {/* Glossy Effect */}
            <div 
              className="absolute top-1 left-1 w-2 h-2 rounded-full opacity-60"
            style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 70%, transparent 100%)'
              }}
            />
            
            {/* House Icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="white"
            style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                  opacity: 0.95
                }}
              >
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
          </div>

          {/* Hover Detail Card */}
          <div 
            className="absolute -top-32 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50"
            style={{ width: '240px' }}
          >
            <div className="bg-white rounded-xl shadow-xl border border-black/5 overflow-hidden">
              <div className="h-24 w-full overflow-hidden">
                <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">{property.title}</h4>
                  <span className="text-[13px] font-bold text-[#F08336] whitespace-nowrap">{property.price}</span>
                </div>
                <div className="text-[11px] text-gray-600 truncate">📍 {property.location}</div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Cluster pin - round style with count and pulsing effect
      const count = cluster.properties.length;

      return (
        <div className="relative group" style={{ width: '36px', height: '36px' }}>
          {/* Pulsing Ring Effect */}
          <div 
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: 'rgba(240, 131, 54, 0.22)',
              animationDuration: '2.5s',
              animationIterationCount: 'infinite'
            }}
          />
          
          {/* Main Cluster Pin */}
          <div 
            className="absolute inset-0 transition-all duration-300 group-hover:scale-110 rounded-full"
            style={{
              background: 'linear-gradient(145deg, #F08336, #D4AF37)',
              boxShadow: `
                0 6px 20px rgba(240, 131, 54, 0.35),
                0 2px 8px rgba(0, 0, 0, 0.15),
                inset 0 1px 2px rgba(255, 255, 255, 0.5)
              `,
              border: '2px solid rgba(255, 255, 255, 0.9)',
            }}
          >
            {/* Glossy Effect */}
            <div 
              className="absolute top-2 left-2 w-3 h-3 rounded-full opacity-60"
            style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 70%, transparent 100%)'
            }}
            />

            {/* Count Circle */}
          <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full flex items-center justify-center text-gray-800 font-bold"
            style={{
                width: '20px',
                height: '20px',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.1)',
                fontSize: '11px'
              }}
            >
              {count}
            </div>
          </div>

          {/* Hover Properties Count Tooltip */}
          <div 
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50"
            style={{
              background: 'linear-gradient(135deg, #1f2937, #374151)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {count} თვისება
            {/* Tooltip Arrow */}
            <div 
              className="absolute top-full left-1/2 transform -translate-x-1/2"
            style={{
                width: '0',
                height: '0',
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '4px solid #374151'
              }}
            />
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <style jsx global>{`
        .compact-marker-wrapper {
          background: none !important;
          border: none !important;
        }
        
        .compact-marker {
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .compact-marker.hovered {
          z-index: 1000;
        }
        
        .compact-pin {
          background: #FF5A5F;
          border: 2px solid white;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 50px;
          height: 30px;
          font-size: 11px;
          font-weight: 600;
          color: white;
        }
        
        .compact-pin.multiple {
          background: #FF8A00;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          min-width: 35px;
        }
        
        .compact-marker:hover .compact-pin {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(255, 90, 95, 0.4);
        }
        
        .cluster-count {
          font-size: 12px;
          font-weight: 700;
          color: white;
        }
        
        .price-tag {
          font-size: 10px;
          font-weight: 600;
          color: white;
          white-space: nowrap;
          padding: 0 6px;
        }
        
        .compact-image {
          position: absolute;
          top: -45px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 40px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          background: white;
        }
        
        .compact-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .leaflet-tooltip {
          background: rgba(255, 255, 255, 0.98) !important;
          border: 1px solid #FF5A5F !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
          backdrop-filter: blur(8px) !important;
          padding: 12px 16px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
          color: #1F2937 !important;
          max-width: 280px !important;
          opacity: 1 !important;
        }
        
        .leaflet-tooltip-top:before {
          border-top-color: #FF5A5F !important;
        }
        
        .leaflet-tooltip-bottom:before {
          border-bottom-color: #FF5A5F !important;
        }
        
        .leaflet-tooltip-left:before {
          border-left-color: #FF5A5F !important;
        }

        /* Plus-shaped pulsing effect for pins */
        .pulse-plus {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          pointer-events: none;
        }
        .pulse-plus.horizontal:before,
        .pulse-plus.vertical:before {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background: rgba(240, 131, 54, 0.24);
          filter: blur(1px);
          border-radius: 9999px;
          animation: pulseLine 2s ease-out infinite;
        }
        .pulse-plus.horizontal:before {
          width: 36px;
          height: 6px;
        }
        .pulse-plus.vertical:before {
          width: 6px;
          height: 36px;
        }
        @keyframes pulseLine {
          0% { opacity: .35; transform: translate(-50%, -50%) scale(1); }
          70% { opacity: 0; transform: translate(-50%, -50%) scale(1.6); }
          100% { opacity: 0; }
        }
        
        .leaflet-tooltip-right:before {
          border-right-color: #FF5A5F !important;
        }
        
        .property-tooltip {
          text-align: left;
        }
        
        .property-tooltip-title {
          font-weight: 600;
          color: #1F2937;
          margin-bottom: 6px;
          font-size: 14px;
          line-height: 1.3;
        }
        
        .property-tooltip-price {
          color: #FF5A5F;
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 6px;
        }
        
        .property-tooltip-location {
          color: #6B7280;
          font-size: 12px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .property-tooltip-details {
          color: #374151;
          font-size: 11px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .property-tooltip-badge {
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 2px;
        }
        
        .property-tooltip-type {
          background: #FF5A5F;
          color: white;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          display: inline-block;
        }
        
        .cluster-tooltip {
          text-align: center;
        }
        
        .cluster-tooltip-title {
          font-weight: 600;
          color: #1F2937;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .cluster-tooltip-list {
          text-align: left;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .cluster-tooltip-item {
          padding: 4px 0;
          border-bottom: 1px solid #F3F4F6;
          font-size: 12px;
        }
        
        .cluster-tooltip-item:last-child {
          border-bottom: none;
        }
        
        .cluster-tooltip-item-title {
          font-weight: 500;
          color: #1F2937;
        }
        
        .cluster-tooltip-item-price {
          color: #FF5A5F;
          font-weight: 600;
        }
      `}</style>
      
      {/* Map Container */}
      <div className={`relative ${
        isFullscreen 
          ? 'fixed inset-0 z-[9999] bg-white' 
          : 'h-[600px]'
      } w-full rounded-lg overflow-hidden shadow-lg`}>
        
        {/* Uiverse.io Style Dropdown - Outside MapContainer */}
        <div className="absolute top-8 right-16 z-[1000]">
          <div className="group relative">
            <div className="bg-gray-800 text-white px-2.5 py-1.5 mb-0.5 rounded-md relative z-[100000] text-xs flex items-center justify-between min-w-[100px] shadow-sm cursor-pointer">
              <span className="flex items-center gap-1.5">
                <span className="text-sm">{mapLayers[mapLayer].icon}</span>
                <span>{mapLayers[mapLayer].name}</span>
              </span>
              <svg className="w-5 h-5 fill-white transition-transform duration-300 -rotate-90 group-hover:rotate-0" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </div>
            
            <div className="absolute top-0 left-0 opacity-0 -translate-y-20 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-gray-800 rounded-md p-1 shadow-lg">
              {Object.entries(mapLayers).map(([key, layer]) => (
                <div
                  key={key}
                  className="rounded px-2.5 py-1.5 transition-colors duration-300 bg-gray-800 w-30 text-xs flex items-center gap-1.5 cursor-pointer text-white hover:bg-primary-400"
                  onClick={() => setMapLayer(key as keyof typeof mapLayers)}
                >
                  <span className="text-sm">{layer.icon}</span>
                  <span>{layer.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <MapContainer
          center={[42.0, 43.5]}
          zoom={7}
          className="h-full w-full"
          ref={(mapInstance) => {
            if (mapInstance && typeof window !== 'undefined') {
              mapRef.current = mapInstance;
              // Set initial zoom
              const initialZoom = mapInstance.getZoom();
              setZoom(initialZoom);
              
              // Add zoom event listener
              mapInstance.on('zoomend', () => {
                const currentZoom = mapInstance.getZoom();
                setZoom(currentZoom);
              });

              // Invalidate size when fullscreen changes
              setTimeout(() => {
                mapInstance.invalidateSize();
              }, 100);
            }
          }}
          zoomControl={false}
        >
          <TileLayer
            key={mapLayer}
            url={currentLayer.url}
            attribution={currentLayer.attribution}
          />
          
          <ZoomControl position="topright" />

          {/* Render clusters */}
          {clusters.map((cluster) => (
            <Marker
              key={cluster.id}
              position={cluster.center}
              icon={typeof window !== 'undefined' && (window as any).L ? (window as any).L.divIcon({
                html: ReactDOMServer.renderToString(<PropertyPin cluster={cluster} onPropertyClick={handlePropertyClick} />),
                className: 'custom-marker',
                iconSize: cluster.properties.length === 1 ? [32, 50] : [36, 54],
                iconAnchor: cluster.properties.length === 1 ? [16, 42] : [18, 46]
              }) : undefined}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="property-tooltip">
                  {cluster.properties.length === 1 ? (
                    // Single property tooltip
                    <div className="flex gap-3 min-w-[280px]">
                      <img 
                        src={cluster.properties[0].image} 
                        alt={cluster.properties[0].title}
                        className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-gray-900 mb-1">{cluster.properties[0].title}</h4>
                        <p className="text-xs text-gray-600 mb-1">📍 {cluster.properties[0].location}</p>
                        <p className="text-xs text-[#FF8C00] font-bold mb-2">{cluster.properties[0].price}</p>
                        
                        <div className="flex gap-2 text-xs text-gray-500 flex-wrap">
                          <span className="bg-gray-100 px-2 py-1 rounded">{cluster.properties[0].type}</span>
                          {cluster.properties[0].bedrooms > 0 && (
                            <span className="bg-gray-100 px-2 py-1 rounded">🛏️ {cluster.properties[0].bedrooms}</span>
                          )}
                          {cluster.properties[0].bathrooms > 0 && (
                            <span className="bg-gray-100 px-2 py-1 rounded">🚿 {cluster.properties[0].bathrooms}</span>
                          )}
                          <span className="bg-gray-100 px-2 py-1 rounded">📏 {cluster.properties[0].area}მ²</span>
              </div>
              </div>
        </div>
                  ) : (
                    // Cluster tooltip
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 mb-3 text-center">
                        {cluster.properties.length} {t('objectsInZone')}
                      </h4>
                      
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {cluster.properties.slice(0, 4).map((property) => (
                          <div key={property.id} className="flex gap-2 p-2 hover:bg-gray-50 rounded border-b border-gray-100 last:border-0">
                            <img 
                              src={property.image} 
                              alt={property.title}
                              className="w-12 h-10 object-cover rounded flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-medium text-gray-900 truncate mb-1">{property.title}</h5>
                              <p className="text-xs text-[#FF8C00] font-bold">{property.price}</p>
                  </div>
                </div>
                        ))}
                        
                        {cluster.properties.length > 4 && (
                          <div className="text-xs text-gray-500 text-center pt-1">
                            {t('moreObjects').replace('{count}', String(cluster.properties.length - 4))}
                          </div>
                        )}
              </div>

                      <div className="text-xs text-gray-500 mt-2 text-center">
                        {t('zoomToSeeAll')}
            </div>
          </div>
        )}
      </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Fullscreen toggle button */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors z-[1000]"
        >
          {isFullscreen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </div>

      {/* Property Modal */}
      <PropertyModal 
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </>
  );
} 