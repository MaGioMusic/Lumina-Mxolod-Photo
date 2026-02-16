'use client';

import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface LeafletMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  hoveredPropertyId: number | null;
  onPropertyHover: (propertyId: number | null) => void;
  onPropertySelect: (property: Property) => void;
  onBoundsChange: (bounds: MapBounds) => void;
}

export default function LeafletMap({ 
  properties, 
  selectedPropertyId, 
  hoveredPropertyId, 
  onPropertyHover, 
  onPropertySelect, 
  onBoundsChange 
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const hasFitBounds = useRef(false);
  const [layer, setLayer] = useState<'osm' | 'sat'>('osm');
  const isDev = process.env.NODE_ENV === 'development';

  // Custom tooltip styles (card-like bubble)
  const tooltipStyles = `
    .leaflet-tooltip.lumina-tooltip { background: transparent; border: none; box-shadow: none; padding: 0; }
    /* Bubble card */
    .lumina-card {
      position: relative;
      border-radius: 12px;
      background: rgba(255,255,255,0.96);
      border: 1px solid #e5e7eb;
      box-shadow: 0 10px 24px rgba(0,0,0,0.12);
      animation: luminaPop 160ms ease-out, luminaPulse 2200ms ease-in-out infinite;
      transform-origin: bottom center;
    }
    /* Small pointer tail */
    .lumina-card::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      width: 14px; height: 14px;
      background: rgba(255,255,255,0.96);
      border-left: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      transform: translateX(-50%) rotate(45deg);
      box-shadow: 0 6px 16px rgba(0,0,0,0.08);
      border-bottom-left-radius: 4px;
    }
    @keyframes luminaPop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    @keyframes luminaPulse {
      0% { box-shadow: 0 10px 24px rgba(240, 131, 54, 0.00), 0 2px 8px rgba(0,0,0,0.08); }
      50% { box-shadow: 0 12px 28px rgba(240, 131, 54, 0.22), 0 3px 10px rgba(0,0,0,0.10); }
      100% { box-shadow: 0 10px 24px rgba(240, 131, 54, 0.00), 0 2px 8px rgba(0,0,0,0.08); }
    }
  `;

  // Fit bounds once on initial properties load to avoid "magnet" effect
  useEffect(() => {
    try {
      const map = mapRef.current;
      if (!map || !properties || properties.length === 0 || hasFitBounds.current) return;
      const bounds = L.latLngBounds(properties.map((p) => L.latLng(p.coordinates[0], p.coordinates[1])));
      if (!bounds.isValid()) return;
      map.fitBounds(bounds.pad(0.15));
      const b = map.getBounds();
      onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
      hasFitBounds.current = true;
    } catch {}
  }, [onBoundsChange, properties]);

  const PropertyPin = ({ property }: { property: Property }) => {
    const isHovered = hoveredPropertyId === property.id;
    const isSelected = selectedPropertyId === property.id.toString();
    
    const createCustomIcon = (isHovered: boolean, isSelected: boolean) => {
      const size = isHovered || isSelected ? 38 : 26;
      const base = '#F08336'; // Lumina orange
      const base2 = '#ff9b5b';

      const svgIcon = `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="mkShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/>
            </filter>
            <style>
              @keyframes ripple { 0% { r: 4; opacity: .35 } 80% { r: 11; opacity: 0 } 100% { opacity: 0 } }
              .ring { fill: none; stroke: ${base}; stroke-width: 2; opacity: .35; transform-origin: 12px 12px; }
              .ring1 { animation: ripple 1.8s ease-out infinite; }
              .ring2 { animation: ripple 1.8s ease-out .3s infinite; }
              .ring3 { animation: ripple 1.8s ease-out .6s infinite; }
            </style>
          </defs>
          <!-- expanding rings -->
          <circle class="ring ring1" cx="12" cy="12" r="4" />
          <circle class="ring ring2" cx="12" cy="12" r="4" />
          <circle class="ring ring3" cx="12" cy="12" r="4" />
          <!-- center dot -->
          <g filter="url(#mkShadow)">
            <circle cx="12" cy="12" r="6" fill="${base}" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="2.2" fill="${base2}"/>
          </g>
        </svg>
      `;

      return L.divIcon({
        html: svgIcon,
        className: 'custom-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    };

    return (
      <Marker
        position={property.coordinates}
        icon={createCustomIcon(isHovered, isSelected)}
        eventHandlers={{
          mouseover: () => onPropertyHover(property.id),
          mouseout: () => onPropertyHover(null),
          click: () => onPropertySelect(property),
        }}
      >
        <Tooltip className="lumina-tooltip" direction="top" offset={[0, -18]} opacity={1}>
          <div className="lumina-card p-3 min-w-[220px] max-w-[280px]">
            <div className="flex items-start gap-3">
              <img
                src={property.image}
                alt={property.title}
                className="w-20 h-16 object-cover rounded-md flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">
                  {property.title}
                </div>
                <div className="text-[13px] font-bold text-[#F08336] mt-1">
                  {property.price}
                </div>
                <div className="text-[12px] text-gray-600 truncate">
                  {property.location}
                </div>
              </div>
            </div>
          </div>
        </Tooltip>
      </Marker>
    );
  };

  return (
    <>
      <style jsx global>{tooltipStyles}</style>
    <MapContainer
      center={[41.7151, 44.7661]}
      zoom={12}
      className="w-full h-full rounded-lg"
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
      whenReady={() => {
        if (isDev) console.log('Map is ready, setting up event listeners...');
        
        // Add a small delay to ensure map is fully loaded
        setTimeout(() => {
          if (mapRef.current) {
            const mapInstance = mapRef.current;
            
            const updateBounds = () => {
              const bounds = mapInstance.getBounds();
              if (isDev) console.log('Map bounds changed:', {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest()
              });
              
              onBoundsChange({
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest()
              });
            };
            
            // Add event listeners for map movement
            mapInstance.on('moveend', updateBounds);
            mapInstance.on('zoomend', updateBounds);
            
          // Initial bounds update
          updateBounds();
          
            if (isDev) console.log('Event listeners added successfully');
        }
      }, 500);
    }}
  >
      {/* Auto-fit bounds to current properties when list changes */}
      {/* markers rendered below */}
      {layer === 'osm' ? (
        <TileLayer
          key="osm"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      ) : (
        <TileLayer
          key="sat"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
      )}
      
      {properties.map((property) => (
        <PropertyPin key={property.id} property={property} />
      ))}

      {/* Layer Toggle */}
      <div className="leaflet-top leaflet-right">
        <div className="leaflet-control leaflet-bar">
          <button
            onClick={() => setLayer((l) => (l === 'osm' ? 'sat' : 'osm'))}
            title={layer === 'osm' ? 'სატელიტი' : 'რუკა'}
            className="px-2 py-1 text-xs bg-white hover:bg-gray-50"
            style={{ cursor: 'pointer' }}
          >
            {layer === 'osm' ? '🛰️' : '🗺️'}
          </button>
        </div>
      </div>
    </MapContainer>
    </>
  );
}
