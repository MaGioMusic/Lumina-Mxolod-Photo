'use client';

import { useMemo } from 'react';

interface UsePropertiesGridDerivedStateArgs<TProperty> {
  properties: TProperty[];
  apiTotal: number | null;
  currentPage: number;
  propertiesPerPage: number;
}

export default function usePropertiesGridDerivedState<TProperty>({
  properties,
  apiTotal,
  currentPage,
  propertiesPerPage,
}: UsePropertiesGridDerivedStateArgs<TProperty>) {
  const filteredProperties = useMemo(() => properties, [properties]);

  const totalProperties = useMemo(
    () => apiTotal ?? filteredProperties.length,
    [apiTotal, filteredProperties.length],
  );

  const totalPages = useMemo(
    () => Math.ceil(totalProperties / propertiesPerPage),
    [propertiesPerPage, totalProperties],
  );

  const startIndex = useMemo(
    () => (currentPage - 1) * propertiesPerPage,
    [currentPage, propertiesPerPage],
  );

  const endIndex = useMemo(() => startIndex + propertiesPerPage, [startIndex, propertiesPerPage]);

  const currentProperties = useMemo(
    () => filteredProperties.slice(startIndex, endIndex),
    [endIndex, filteredProperties, startIndex],
  );

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(page);
      }
      return pages;
    }

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);
    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [currentPage, totalPages]);

  return {
    filteredProperties,
    totalProperties,
    totalPages,
    startIndex,
    endIndex,
    currentProperties,
    pageNumbers,
  };
}
