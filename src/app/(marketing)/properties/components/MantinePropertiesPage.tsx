'use client';

import React, { useState } from 'react';
import { MantineProvider, Group, Box } from '@mantine/core';
import MantineFilterSidebar from './MantineFilterSidebar';
import PropertiesGrid from './PropertiesGrid';

// Use the correct FiltersState interface that matches PropertiesGrid
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

const MantinePropertiesPage: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    priceRange: [0, 1000000],
    bedrooms: [],
    bathrooms: [],
    propertyTypes: [],
    transactionType: '',
    constructionStatus: '',
    floor: '',
    furniture: '',
    area: [0, 10000],
    amenities: [],
  });

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleFiltersChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
  };

  return (
    <MantineProvider
      theme={{
        primaryColor: 'orange',
        colors: {
          orange: [
            '#fff7ed',
            '#ffedd5',
            '#fed7aa',
            '#fdba74',
            '#fb923c',
            '#f97316',
            '#ea580c',
            '#c2410c',
            '#9a3412',
            '#7c2d12',
          ],
        },
        fontFamily: 'Inter, sans-serif',
        headings: {
          fontFamily: 'Inter, sans-serif',
        },
      }}
    >
      <Group gap={0} align="flex-start" style={{ height: '100vh' }}>
        {/* Sidebar */}
        <MantineFilterSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Main Content */}
        <Box style={{ flex: 1, height: '100vh', overflow: 'hidden' }}>
          {/* Header */}
          <Box 
            p="md" 
            style={{ 
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e9ecef'
            }}
          >
            <Group justify="space-between" align="center">
              <Box>
                <h1 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 700, 
                  color: '#1a1a1a',
                  margin: 0,
                  marginBottom: '0.25rem'
                }}>
                  Properties
                </h1>
                <p style={{ 
                  color: '#6b7280', 
                  margin: 0,
                  fontSize: '0.875rem'
                }}>
                  Find your perfect property with Mantine UI
                </p>
              </Box>
              <Box style={{ 
                fontSize: '0.75rem', 
                color: '#9ca3af'
              }}>
                Mantine Sidebar Test Implementation
              </Box>
            </Group>
          </Box>

          {/* Properties Grid */}
          <Box 
            p="md" 
            style={{ 
              height: 'calc(100vh - 80px)', 
              overflow: 'auto',
              backgroundColor: '#f8fafc'
            }}
          >
            <PropertiesGrid searchQuery="" filters={filters} />
          </Box>
        </Box>
      </Group>

      {/* AI Chat Component - Fixed Position */}
      {/* AI Chat mounted globally in layout */}
    </MantineProvider>
  );
};

export default MantinePropertiesPage; 