'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, MapPin, Phone, Mail } from 'lucide-react';
import PropertyImageCarousel from '../components/PropertyImageCarousel';
import SinglePropertyMap from '../components/SinglePropertyMap';
import { getPropertyImages } from '@/lib/samplePropertyImages';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from 'recharts';
import PropertySnapshotEmitter from '../components/PropertySnapshotEmitter';

interface PropertyDetailsProps {
  params: Promise<{ id: string }>;
}

interface PropertyDetailsData {
  id: string;
  title: string;
  price: number;
  location: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number; // sqm
  description: string;
  images: string[];
  coordinates: { lat: number; lng: number };
  agent: { name: string; phone: string; email: string };
  features: string[];
}

export default function PropertyDetails({ params }: PropertyDetailsProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [data, setData] = useState<PropertyDetailsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    params.then(async (resolved) => {
      try {
        const res = await fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tool: 'get_property_details', params: { propertyId: resolved.id } })
        });
        const json = await res.json();
        if (!active) return;
        const images = (json.images as string[])?.length ? json.images : getPropertyImages(resolved.id);
        setData({ ...json, images } as PropertyDetailsData);
      } catch (e) {
        // fallback minimal mock
        if (!active) return;
        setData({
          id: resolved.id,
          title: 'Property',
          price: 250000,
          location: 'Tbilisi, Georgia',
          type: 'apartment',
          bedrooms: 3,
          bathrooms: 2,
          area: 120,
          description: '—',
          images: getPropertyImages(resolved.id),
          coordinates: { lat: 41.7151, lng: 44.7661 },
          agent: { name: 'Agent', phone: '+995 555 000 000', email: 'agent@example.com' },
          features: []
        });
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => { active = false; };
  }, [params]);

  const priceSeries = useMemo(() => {
    // simple synthetic 12-months price history based on price
    const base = data?.price || 200000;
    return Array.from({ length: 12 }).map((_, i) => ({
      m: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
      v: Math.round(base * (0.95 + Math.sin(i / 2.5) * 0.03 + i * 0.002))
    }));
  }, [data?.price]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Broadcast snapshot to AI chat on first render */}
      <PropertySnapshotEmitter
        id={data.id}
        title={data.title}
        price={data.price}
        address={data.location}
        bedrooms={data.bedrooms}
        bathrooms={data.bathrooms}
        area={data.area}
        images={data.images}
        type={data.type}
        features={data.features}
      />
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('back') ?? 'Back'}</span>
            </button>
            <div className="h-5 w-px bg-gray-300" />
            <h1 className="text-lg font-semibold text-gray-900">{t('propertyDetails') ?? 'Property Details'}</h1>
          </div>
          {/* Describe this page button */}
          <button
            onClick={() => {
              try {
                const cid = new URLSearchParams(window.location.search).get('cid') || window.sessionStorage.getItem('lumina_cid');
                if (!cid) return;
                const payload = {
                  type: 'property_snapshot',
                  id: data.id,
                  title: data.title,
                  price: data.price,
                  address: data.location,
                  bedrooms: data.bedrooms,
                  bathrooms: data.bathrooms,
                  area: data.area,
                  images: data.images,
                  propertyType: data.type,
                  featuresList: data.features,
                };
                // Broadcast
                const ch = new BroadcastChannel(`lumina-ai-${cid}`);
                ch.postMessage(payload);
                ch.close();
                // Persist for same-tab pickup
                const key = `lumina_snapshots_${cid}`;
                const arr = JSON.parse(window.sessionStorage.getItem(key) || '[]');
                const nextArr = [...arr, { ...payload, ts: Date.now() }];
                window.sessionStorage.setItem(key, JSON.stringify(nextArr));
              } catch {}
            }}
            className="text-sm h-8 px-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            title="Describe this page"
          >
            {t('describe') ?? 'Describe this page'}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <PropertyImageCarousel images={data.images} alt={data.title} className="h-96" />
            </div>

            {/* Heading & price */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{data.title}</h2>
                  <p className="text-gray-600 mt-1 flex items-center gap-2"><MapPin className="w-4 h-4" />{data.location}</p>
                  <p className="text-gray-500 mt-1">{data.bedrooms} Beds | {data.bathrooms} Baths | {data.area} m²</p>
                </div>
                <div className="text-3xl font-bold text-gray-900">${data.price.toLocaleString()}</div>
              </div>
            </div>

            {/* Key facts */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('keyFacts') ?? 'Key Facts'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div className="flex justify-between border-b border-gray-200 py-3"><p className="text-gray-600">{t('propertyType') ?? 'Property Type'}</p><p className="font-medium text-gray-900 capitalize">{data.type}</p></div>
                <div className="flex justify-between border-b border-gray-200 py-3"><p className="text-gray-600">{t('area') ?? 'Area'}</p><p className="font-medium text-gray-900">{data.area} m²</p></div>
                <div className="flex justify-between border-b border-gray-200 py-3"><p className="text-gray-600">{t('bedrooms') ?? 'Bedrooms'}</p><p className="font-medium text-gray-900">{data.bedrooms}</p></div>
                <div className="flex justify-between border-b border-gray-200 py-3"><p className="text-gray-600">{t('bathrooms') ?? 'Bathrooms'}</p><p className="font-medium text-gray-900">{data.bathrooms}</p></div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('description') ?? 'Description'}</h3>
              <p className="text-gray-600 leading-relaxed">{data.description}</p>
            </div>

            {/* Amenities */}
            {!!data.features?.length && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('amenities') ?? 'Amenities'}</h3>
                <div className="flex flex-wrap gap-2">
                  {data.features.map((f, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Floorplans (placeholder image using first) */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('floorplans') ?? 'Floorplans'}</h3>
              <img src={data.images[0]} alt="floorplan" className="w-full aspect-video object-cover rounded-lg" />
            </div>

            {/* Location map */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('location') ?? 'Location'}</h3>
              <div className="h-80 rounded-lg overflow-hidden">
                <SinglePropertyMap
                  coordinates={data.coordinates}
                  propertyTitle={data.title}
                  propertyPrice={`$${data.price.toLocaleString()}`}
                  propertyAddress={data.location}
                  propertyImage={data.images[0]}
                />
              </div>
            </div>

            {/* Price history */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('priceHistory') ?? 'Price History'}</h3>
              <div className="flex items-baseline gap-4">
                <p className="text-3xl font-bold text-gray-900">${data.price.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">{t('last12Months') ?? 'Last 12 Months'}</p>
              </div>
              <div className="h-40 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceSeries} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#93c5fd" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} />
                    <Tooltip contentStyle={{ borderRadius: 8 }} />
                    <Area type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2} fill="url(#priceFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3D tour placeholder */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('tour3d') ?? '3D Tour'}</h3>
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                <img src={data.images[1] ?? data.images[0]} alt="3d" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                <button className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
                  ▶
                </button>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-6">
              {/* Agent card */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">{t('contactAgent') ?? 'Contact Agent'}</p>
                <p className="text-lg font-bold text-gray-900">{data.agent.name}</p>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><a className="hover:underline" href={`tel:${data.agent.phone}`}>{data.agent.phone}</a></div>
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><a className="hover:underline" href={`mailto:${data.agent.email}`}>{data.agent.email}</a></div>
                </div>
              </div>

              {/* Schedule tour */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('scheduleTour') ?? 'Schedule a Tour'}</h3>
                <p className="text-sm text-gray-500 mb-4">{t('selectPreferredTime') ?? 'Select a preferred date and time.'}</p>
                <form className="space-y-4">
                  <div>
                    <label className="sr-only" htmlFor="tour-date">Date</label>
                    <input id="tour-date" name="tour-date" type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400" />
                  </div>
                  <div>
                    <label className="sr-only" htmlFor="tour-time">Time</label>
                    <select id="tour-time" name="tour-time" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400">
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                      <option>1:00 PM</option>
                      <option>2:00 PM</option>
                      <option>3:00 PM</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full rounded-md h-10 bg-primary-400 text-white font-semibold hover:bg-primary-500 transition-colors">{t('bookTour') ?? 'Book Tour'}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
