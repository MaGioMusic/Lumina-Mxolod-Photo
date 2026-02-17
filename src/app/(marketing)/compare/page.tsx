'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getMockPropertyById } from '@/lib/mockProperties';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompare } from '@/contexts/CompareContext';

export default function ComparePage() {
  const params = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { remove } = useCompare();

  const ids = useMemo(() => {
    const raw = params?.get('id') || '';
    return raw
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n));
  }, [params]);

  const items = ids
    .map((id) => getMockPropertyById(id))
    .filter(Boolean);

  const [showDiffOnly, setShowDiffOnly] = useState(false);

  // Helpers
  const pricePerSqm = (p: any) => {
    const area = Math.max(1, Number(p.sqft || 0));
    return Math.round(Number(p.price || 0) / area);
  };

  const estimatedMonthly = (p: any) => {
    if (p.status === 'for-rent') {
      return Math.round(Number(p.price || 0));
    }
    const price = Number(p.price || 0);
    const down = price * 0.2;
    const loan = price - down;
    const annual = 0.06;
    const months = 20 * 12;
    const r = annual / 12;
    const m = loan * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    return Math.round(m);
  };

  const energyClass = (p: any) => {
    const y = Number(p.year || 2000);
    if (y >= 2018) return 'A';
    if (y >= 2013) return 'B';
    if (y >= 2008) return 'C';
    if (y >= 2003) return 'D';
    if (y >= 1998) return 'E';
    if (y >= 1993) return 'F';
    return 'G';
  };

  const amenityChips = (p: any) => {
    const chips: string[] = [];
    if (p.amenities?.includes('parking')) chips.push('Parking');
    if (p.amenities?.includes('balcony')) chips.push('Balcony');
    if (p.amenities?.includes('swimming_pool')) chips.push('Pool');
    if ((p.floor || 0) > 5) chips.push('Elevator');
    if ((p.id || 0) % 5 === 0) chips.push('Storage');
    return chips;
  };

  type Row = {
    key: string;
    label: string;
    always?: boolean;
    value: (p: any) => string | number | undefined | null;
    render: (p: any) => React.ReactNode;
  };

  const rows: Row[] = [
    {
      key: 'photo',
      label: t('photo'),
      always: true,
      value: (p) => String(p.image),
      render: (p) => (
        <div className="relative w-full h-24 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
          <Image src={p.image} alt={String(p.id)} fill className="object-cover" />
        </div>
      )
    },
    {
      key: 'price',
      label: t('price'),
      value: (p) => `$${p.price?.toLocaleString?.()}`,
      render: (p) => <span>{'$'}{p.price.toLocaleString()}</span>
    },
    {
      key: 'ppsqm',
      label: t('pricePerSqm'),
      value: (p) => pricePerSqm(p),
      render: (p) => <span>{'$'}{pricePerSqm(p).toLocaleString()}</span>
    },
    {
      key: 'monthly',
      label: t('estimatedMonthly'),
      value: (p) => estimatedMonthly(p),
      render: (p) => <span>{'$'}{estimatedMonthly(p).toLocaleString()} {t('perMonth')}</span>
    },
    {
      key: 'sqft',
      label: t('area'),
      value: (p) => p.sqft,
      render: (p) => <span>{p.sqft} m²</span>
    },
    { key: 'bedrooms', label: t('bedrooms'), value: (p) => p.bedrooms, render: (p) => <span>{p.bedrooms}</span> },
    { key: 'bathrooms', label: t('bathrooms'), value: (p) => p.bathrooms, render: (p) => <span>{p.bathrooms}</span> },
    { key: 'floor', label: t('floor'), value: (p) => p.floor ?? '-', render: (p) => <span>{p.floor ?? '-'}</span> },
    { key: 'year', label: t('year'), value: (p) => p.year ?? '-', render: (p) => <span>{p.year ?? '-'}</span> },
    { key: 'address', label: t('address'), value: (p) => p.address, render: (p) => <span>{p.address}</span> },
    {
      key: 'energy',
      label: t('energyClass'),
      value: (p) => energyClass(p),
      render: (p) => {
        const ec = energyClass(p);
        const color = ec === 'A' ? 'bg-green-100 text-green-700 border-green-300' : ec === 'B' ? 'bg-lime-100 text-lime-700 border-lime-300' : ec === 'C' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : ec === 'D' ? 'bg-amber-100 text-amber-700 border-amber-300' : ec === 'E' ? 'bg-orange-100 text-orange-700 border-orange-300' : ec === 'F' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-gray-100 text-gray-700 border-gray-300';
        return <span className={`px-2 py-0.5 text-xs rounded-full border ${color}`}>{ec}</span>;
      }
    },
    {
      key: 'amenities',
      label: t('amenities'),
      value: (p) => amenityChips(p).join(','),
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {amenityChips(p).map((am: string) => (
            <span key={am} className="px-2 py-0.5 text-xs rounded-full bg-orange-50 text-orange-700 border border-orange-200">{am}</span>
          ))}
        </div>
      )
    },
    { key: 'status', label: t('status'), value: (p) => p.status, render: (p) => <span>{p.status === 'for-sale' ? (t('forSale')) : (t('forRent'))}</span> },
  ];

  // Calculate identical vs different row counts to inform the UI.
  // Keep this as a plain calculation (not a Hook) to avoid conditional-hook issues.
  const sameCount = (() => {
    if (items.length <= 1) return 0;
    let same = 0;
    for (const row of rows) {
      if (row.always) continue;
      const values = items.map((it) => String(row.value(it)));
      const isDifferent = values.some((v) => v !== values[0]);
      if (!isDifferent) same += 1;
    }
    return same;
  })();

  if (ids.length === 0 || items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-2">{t('compare')}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{t('compareEmptyState')}</p>
        <button onClick={() => router.push('/properties')} className="px-4 py-2 bg-[#F08336] text-white rounded-md">
          {t('browseProperties')}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 lg:px-8 py-6">
      <div className="sticky top-20 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="text-sm font-medium text-gray-600">{t('compare')}</div>
          <label className="flex items-center gap-3 text-sm text-gray-600">
            <input type="checkbox" checked={showDiffOnly} onChange={(e) => setShowDiffOnly(e.target.checked)} />
            {t('showDifferences')}
            <span className="text-xs text-gray-500">{sameCount > 0 ? `${t('hiding')} ${sameCount}` : t('noIdenticalRows')}</span>
          </label>
        </div>
        <div className="grid" style={{ gridTemplateColumns: `200px repeat(${items.length}, minmax(160px, 1fr))` }}>
          <div className="p-3 font-medium text-gray-500">{t('attribute')}</div>
          {items.map((it) => (
            <div key={it!.id} className="p-3 font-semibold">
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                  <Image src={it!.image} alt={`${t('photo')} ${it!.id}`} fill className="object-cover" />
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-100">{'$'}{it!.price.toLocaleString()}</div>
                <button onClick={() => remove(it!.id)} className="ml-auto text-xs text-red-500 hover:underline">
                  {t('remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: `200px repeat(${items.length}, minmax(160px, 1fr))` }}>
        {rows.filter((row) => {
          if (row.always || !showDiffOnly) return true;
          const values = items.map((it) => String(row.value(it)));
          return values.some((v) => v !== values[0]);
        }).map((row) => {
          const values = items.map((it) => String(row.value(it)));
          const isDifferent = values.some((v) => v !== values[0]);
          // When showing only differences, keep neutral background. Otherwise, subtly highlight rows that differ.
          const highlightClass = !showDiffOnly && isDifferent ? 'bg-orange-50/60 dark:bg-orange-900/20' : '';
          return (
            <React.Fragment key={row.key}>
              <div className={`p-3 border-b border-gray-100 dark:border-gray-800 text-sm font-medium text-gray-600 sticky left-0 bg-white dark:bg-gray-900 ${highlightClass}`}>{row.label}</div>
              {items.map((it) => (
                <div key={it!.id + '-' + row.key} className={`p-3 border-b border-gray-100 dark:border-gray-800 text-sm ${highlightClass}`}>
                  {row.render(it)}
                </div>
              ))}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}


