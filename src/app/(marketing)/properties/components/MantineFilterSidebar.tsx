'use client';

import React from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Button,
  NumberInput,
  MultiSelect,
  Badge,
  Divider,
  Collapse,
  ActionIcon,
  Box,
  RangeSlider,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

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

interface MantineFilterSidebarProps {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const MantineFilterSidebar: React.FC<MantineFilterSidebarProps> = ({
  filters,
  onFiltersChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [priceOpened, { toggle: togglePrice }] = useDisclosure(true);
  const [typeOpened, { toggle: toggleType }] = useDisclosure(true);
  const [roomsOpened, { toggle: toggleRooms }] = useDisclosure(true);
  const [areaOpened, { toggle: toggleArea }] = useDisclosure(true);
  const [amenitiesOpened, { toggle: toggleAmenities }] = useDisclosure(true);

  const handlePriceChange = (value: [number, number]) => {
    onFiltersChange({
      ...filters,
      priceRange: value,
    });
  };

  const handlePropertyTypeChange = (types: string[]) => {
    onFiltersChange({
      ...filters,
      propertyTypes: types,
    });
  };

  const handleBedroomsChange = (bedrooms: string[]) => {
    onFiltersChange({
      ...filters,
      bedrooms,
    });
  };

  const handleBathroomsChange = (bathrooms: string[]) => {
    onFiltersChange({
      ...filters,
      bathrooms,
    });
  };

  const handleAreaChange = (value: [number, number]) => {
    onFiltersChange({
      ...filters,
      area: value,
    });
  };

  const handleAmenityChange = (amenities: string[]) => {
    onFiltersChange({
      ...filters,
      amenities,
    });
  };

  const propertyTypeOptions = [
    { value: 'Apartment', label: 'Apartment' },
    { value: 'House', label: 'House' },
    { value: 'Villa', label: 'Villa' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Land', label: 'Land' },
  ];

  const bedroomOptions = [
    { value: '1', label: '1+ Bedroom' },
    { value: '2', label: '2+ Bedrooms' },
    { value: '3', label: '3+ Bedrooms' },
    { value: '4', label: '4+ Bedrooms' },
  ];

  const bathroomOptions = [
    { value: '1', label: '1+ Bathroom' },
    { value: '2', label: '2+ Bathrooms' },
    { value: '3', label: '3+ Bathrooms' },
    { value: '4', label: '4+ Bathrooms' },
  ];

  const amenityOptions = [
    { value: 'Parking', label: 'Parking' },
    { value: 'Balcony', label: 'Balcony' },
    { value: 'Garden', label: 'Garden' },
    { value: 'Pool', label: 'Swimming Pool' },
    { value: 'Gym', label: 'Gym' },
    { value: 'Security', label: '24/7 Security' },
    { value: 'Elevator', label: 'Elevator' },
    { value: 'Furnished', label: 'Furnished' },
  ];

  const activeFiltersCount = [
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000 ? 1 : 0,
    filters.propertyTypes.length,
    filters.bedrooms.length,
    filters.bathrooms.length,
    filters.area[0] > 0 || filters.area[1] < 10000 ? 1 : 0,
    filters.amenities.length,
  ].reduce((sum, count) => sum + count, 0);

  const clearAllFilters = () => {
    onFiltersChange({
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
  };

  if (isCollapsed) {
    return (
      <Paper 
        shadow="sm" 
        p="md" 
        h="100vh" 
        w={60}
        style={{ 
          borderRadius: 0,
          borderRight: '1px solid #e9ecef',
          backgroundColor: '#ffffff'
        }}
      >
        <Stack align="center" gap="md">
          <ActionIcon
            variant="subtle"
            color="orange"
            size="lg"
            onClick={onToggleCollapse}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </ActionIcon>
          
          {activeFiltersCount > 0 && (
            <Badge color="orange" variant="filled" size="sm">
              {activeFiltersCount}
            </Badge>
          )}

          <ActionIcon variant="subtle" color="gray" size="lg">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </ActionIcon>

          <ActionIcon variant="subtle" color="gray" size="lg">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </ActionIcon>

          <ActionIcon variant="subtle" color="gray" size="lg">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </ActionIcon>

          <ActionIcon variant="subtle" color="gray" size="lg">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </ActionIcon>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper 
      shadow="sm" 
      h="100vh" 
      w={340}
      style={{ 
        borderRadius: 0,
        borderRight: '1px solid #e9ecef',
        backgroundColor: '#ffffff',
        overflow: 'auto'
      }}
    >
      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <Text size="lg" fw={600} c="dark">
              Filters
            </Text>
            {activeFiltersCount > 0 && (
              <Badge color="orange" variant="filled" size="sm">
                {activeFiltersCount}
              </Badge>
            )}
          </Group>
          <Group gap="xs">
            {activeFiltersCount > 0 && (
              <Button
                variant="subtle"
                color="gray"
                size="xs"
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
            )}
            <ActionIcon
              variant="subtle"
              color="orange"
              onClick={onToggleCollapse}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      <Stack gap={0} p="md">
        {/* Price Range */}
        <Box>
          <Group justify="space-between" onClick={togglePrice} style={{ cursor: 'pointer' }} mb="sm">
            <Text fw={500} c="dark">Price Range</Text>
            <ActionIcon variant="subtle" size="sm">
              <svg 
                width="14" 
                height="14" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ transform: priceOpened ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </ActionIcon>
          </Group>
          
          <Collapse in={priceOpened}>
            <Stack gap="sm" mb="md">
              <RangeSlider
                value={filters.priceRange}
                onChange={handlePriceChange}
                min={0}
                max={1000000}
                step={10000}
                color="orange"
                marks={[
                  { value: 0, label: '0' },
                  { value: 250000, label: '250K' },
                  { value: 500000, label: '500K' },
                  { value: 750000, label: '750K' },
                  { value: 1000000, label: '1M' },
                ]}
              />
              <Group grow>
                <NumberInput
                  label="Min Price"
                  value={filters.priceRange[0]}
                  onChange={(value) => handlePriceChange([Number(value) || 0, filters.priceRange[1]])}
                  min={0}
                  max={filters.priceRange[1]}
                  thousandSeparator=","
                  prefix="$"
                />
                <NumberInput
                  label="Max Price"
                  value={filters.priceRange[1]}
                  onChange={(value) => handlePriceChange([filters.priceRange[0], Number(value) || 1000000])}
                  min={filters.priceRange[0]}
                  max={1000000}
                  thousandSeparator=","
                  prefix="$"
                />
              </Group>
            </Stack>
          </Collapse>
          <Divider my="md" />
        </Box>

        {/* Property Type */}
        <Box>
          <Group justify="space-between" onClick={toggleType} style={{ cursor: 'pointer' }} mb="sm">
            <Text fw={500} c="dark">Property Type</Text>
            <ActionIcon variant="subtle" size="sm">
              <svg 
                width="14" 
                height="14" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ transform: typeOpened ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </ActionIcon>
          </Group>
          
          <Collapse in={typeOpened}>
            <MultiSelect
              data={propertyTypeOptions}
              value={filters.propertyTypes}
              onChange={handlePropertyTypeChange}
              placeholder="Select property types"
              clearable
              searchable
              mb="md"
            />
          </Collapse>
          <Divider my="md" />
        </Box>

        {/* Bedrooms & Bathrooms */}
        <Box>
          <Group justify="space-between" onClick={toggleRooms} style={{ cursor: 'pointer' }} mb="sm">
            <Text fw={500} c="dark">Bedrooms & Bathrooms</Text>
            <ActionIcon variant="subtle" size="sm">
              <svg 
                width="14" 
                height="14" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ transform: roomsOpened ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </ActionIcon>
          </Group>
          
          <Collapse in={roomsOpened}>
            <Stack gap="sm" mb="md">
              <MultiSelect
                label="Bedrooms"
                data={bedroomOptions}
                value={filters.bedrooms}
                onChange={handleBedroomsChange}
                placeholder="Select bedrooms"
                clearable
              />
              <MultiSelect
                label="Bathrooms"
                data={bathroomOptions}
                value={filters.bathrooms}
                onChange={handleBathroomsChange}
                placeholder="Select bathrooms"
                clearable
              />
            </Stack>
          </Collapse>
          <Divider my="md" />
        </Box>

        {/* Area */}
        <Box>
          <Group justify="space-between" onClick={toggleArea} style={{ cursor: 'pointer' }} mb="sm">
            <Text fw={500} c="dark">Area (m²)</Text>
            <ActionIcon variant="subtle" size="sm">
              <svg 
                width="14" 
                height="14" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ transform: areaOpened ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </ActionIcon>
          </Group>
          
          <Collapse in={areaOpened}>
            <Stack gap="sm" mb="md">
              <RangeSlider
                value={filters.area}
                onChange={handleAreaChange}
                min={0}
                max={10000}
                step={50}
                color="orange"
                marks={[
                  { value: 0, label: '0' },
                  { value: 2500, label: '2.5K' },
                  { value: 5000, label: '5K' },
                  { value: 7500, label: '7.5K' },
                  { value: 10000, label: '10K' },
                ]}
              />
              <Group grow>
                <NumberInput
                  label="Min Area"
                  value={filters.area[0]}
                  onChange={(value) => handleAreaChange([Number(value) || 0, filters.area[1]])}
                  min={0}
                  max={filters.area[1]}
                  suffix=" m²"
                />
                <NumberInput
                  label="Max Area"
                  value={filters.area[1]}
                  onChange={(value) => handleAreaChange([filters.area[0], Number(value) || 10000])}
                  min={filters.area[0]}
                  max={10000}
                  suffix=" m²"
                />
              </Group>
            </Stack>
          </Collapse>
          <Divider my="md" />
        </Box>

        {/* Amenities */}
        <Box>
          <Group justify="space-between" onClick={toggleAmenities} style={{ cursor: 'pointer' }} mb="sm">
            <Text fw={500} c="dark">Amenities</Text>
            <ActionIcon variant="subtle" size="sm">
              <svg 
                width="14" 
                height="14" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ transform: amenitiesOpened ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </ActionIcon>
          </Group>
          
          <Collapse in={amenitiesOpened}>
            <MultiSelect
              data={amenityOptions}
              value={filters.amenities}
              onChange={handleAmenityChange}
              placeholder="Select amenities"
              clearable
              searchable
              mb="md"
            />
          </Collapse>
        </Box>
      </Stack>
    </Paper>
  );
};

export default MantineFilterSidebar; 