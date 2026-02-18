'use client';

import { useCallback, useMemo, type CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';

import AppliedFiltersChips from './AppliedFiltersChips';
import PropertyDetailsMap from './PropertyDetailsMap';
import PropertiesGrid from './PropertiesGrid';
import ProSidebarFilter from './ProSidebarFilter';
import usePropertiesPageEffects from './hooks/usePropertiesPageEffects';
import usePropertiesPageState from './hooks/usePropertiesPageState';

export default function ProSidebarPropertiesPage() {
  const searchParams = useSearchParams();
  const allowAiToolSideEffects = process.env.NEXT_PUBLIC_AI_TOOL_SIDEEFFECTS === '1';
  const handleToggleSidebarCollapse = useCallback(() => {}, []);
  const sidebarScrollerStyle = useMemo<CSSProperties>(
    () => ({ scrollbarGutter: 'stable' } as CSSProperties),
    [],
  );

  const {
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    highlightedPropertyId,
    setHighlightedPropertyId,
    filters,
    setFilters,
    handleFiltersChange,
    handleRemoveChip,
    handleClearAll,
    hasActiveFilters,
    resetFiltersForMapView,
  } = usePropertiesPageState();

  usePropertiesPageEffects({
    searchParams,
    allowAiToolSideEffects,
    currentView,
    setCurrentView,
    setSearchQuery,
    setFilters,
    resetFiltersForMapView,
  });
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#111111]">
        {/* Sidebar (sticky) */}
        <div className="flex-shrink-0 bg-white dark:bg-[#111111]">
          <div
            className="sticky top-16 h-[calc(100vh-4rem)] relative group overflow-y-auto overflow-x-hidden pr-2 bg-white dark:bg-[#111111]"
            style={sidebarScrollerStyle}
          >
            <ProSidebarFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isCollapsed={false}
              onToggleCollapse={handleToggleSidebarCollapse}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Applied Filters (compact) */}
          {hasActiveFilters && (
            <div className="sticky top-16 z-10 p-2 bg-white/80 dark:bg-[#111111]/90 backdrop-blur border-b border-black/5 dark:border-white/10 relative">
              <AppliedFiltersChips 
                searchQuery={searchQuery}
                filters={filters}
                onRemove={handleRemoveChip}
                onClearAll={handleClearAll}
              />
            </div>
          )}

          {/* Content - Grid or Map */}
          <div className="flex-1">
            {currentView === 'grid' ? (
              <div className="p-3">
                <PropertiesGrid 
                  searchQuery={searchQuery} 
                  filters={filters}
                  highlightedPropertyId={highlightedPropertyId}
                  onPropertyHighlight={setHighlightedPropertyId}
                />
              </div>
            ) : (
              <div className="h-[calc(100vh-6rem)]">
                <PropertyDetailsMap filters={filters} searchQuery={searchQuery} />
              </div>
            )}
          </div>
        </div>
      {/* AI Chat mounted globally in layout */}
    </div>
  );
}
