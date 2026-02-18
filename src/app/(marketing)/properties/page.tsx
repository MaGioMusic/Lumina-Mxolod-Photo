'use client';

import ProSidebarPropertiesPage from './components/ProSidebarPropertiesPage';
import { ProfiledSection } from '@/lib/perf/reactProfiler';

export default function PropertiesPage() {
  return (
    <ProfiledSection id="PropertiesPageRoute">
      <ProSidebarPropertiesPage />
    </ProfiledSection>
  );
} 