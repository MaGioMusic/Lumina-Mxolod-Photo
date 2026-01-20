'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  House, Buildings, Briefcase, Users, Handshake, FileText, Calendar,
  Pulse, AddressBook, Storefront, Megaphone, Folder, Gear, Question
} from '@phosphor-icons/react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

type Item = { key: string; label: string; icon: any; tab?: string; href?: string };

export default function AgentSideNav({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const sp = useSearchParams();
  const activeTab = sp.get('tab') || 'dashboard';

  const items: Item[] = useMemo(() => ([
    { key: 'dashboard', label: 'Dashboard', icon: House, tab: 'dashboard' },
    { key: 'crm', label: 'CRM', icon: Pulse, tab: 'crm' },
    { key: 'properties', label: 'Properties', icon: Buildings, tab: 'properties' },
    { key: 'projects', label: 'Projects', icon: Briefcase, tab: 'projects' },
    { key: 'clients', label: 'Leads', icon: Users, tab: 'clients' },
    { key: 'offers', label: 'Offers', icon: Handshake, tab: 'offers' },
    { key: 'agreements', label: 'Agreements', icon: FileText, tab: 'agreements' },
    { key: 'calendar', label: 'Calendar', icon: Calendar, tab: 'calendar' },
    { key: 'analytics', label: 'Analytics', icon: Pulse, tab: 'analytics' },
    { key: 'contacts', label: 'Contacts & Orgs', icon: AddressBook, tab: 'contacts' },
    { key: 'brokers', label: 'Brokers & Agents', icon: Storefront, tab: 'brokers' },
    { key: 'campaigns', label: 'Campaigns', icon: Megaphone, tab: 'campaigns' },
    { key: 'documents', label: 'Documents', icon: Folder, tab: 'documents' },
    { key: 'settings', label: 'Settings', icon: Gear, tab: 'settings' },
    { key: 'help', label: 'Help', icon: Question, tab: 'help' },
  ]), []);

  const go = (it: Item) => {
    if (it.href) router.push(it.href);
    else if (it.tab) router.push(`/agents?tab=${it.tab}`);
  };
  const mainItems = items.filter((it) => !['settings', 'help'].includes(it.key));
  const supportItems = items.filter((it) => ['settings', 'help'].includes(it.key));

  return (
    <Sidebar collapsible="offcanvas" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <button type="button" onClick={() => router.push('/agents?tab=dashboard')}>
                <House className="h-5 w-5" weight="fill" />
                <span className="text-base font-semibold">Lumina Estate</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {mainItems.map((it) => {
              const Icon = it.icon;
              const active = activeTab === it.tab;
              return (
                <SidebarMenuItem key={it.key}>
                  <SidebarMenuButton
                    onClick={() => go(it)}
                    isActive={active}
                    tooltip={it.label}
                  >
                    <Icon weight={active ? 'fill' : 'regular'} />
                    <span>{it.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarMenu>
            {supportItems.map((it) => {
              const Icon = it.icon;
              const active = activeTab === it.tab;
              return (
                <SidebarMenuItem key={it.key}>
                  <SidebarMenuButton
                    onClick={() => go(it)}
                    isActive={active}
                    tooltip={it.label}
                  >
                    <Icon weight={active ? 'fill' : 'regular'} />
                    <span>{it.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}


