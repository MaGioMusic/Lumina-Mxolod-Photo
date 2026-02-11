'use client';

import { useMemo } from 'react';

import { EventManager, type Event } from '@/components/event-manager';

export default function AgentCalendar() {
  const initialEvents = useMemo<Event[]>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    return [
      {
        id: 'event-modern-space',
        title: 'Modern space',
        description: 'Client walkthrough for renovated loft space.',
        startTime: new Date(year, month, 6, 10, 0),
        endTime: new Date(year, month, 6, 11, 30),
        color: 'purple',
        category: 'Meeting',
        tags: ['Client', 'On-site'],
      },
      {
        id: 'event-8-chairs',
        title: '8 Chairs delivery',
        description: 'Furniture delivery for Riverside Residence staging.',
        startTime: new Date(year, month, 8, 14, 0),
        endTime: new Date(year, month, 8, 15, 0),
        color: 'green',
        category: 'Logistics',
        tags: ['Staging'],
      },
      {
        id: 'event-quote-12-tab',
        title: 'Quote for 12 Tab',
        description: 'Budget review for Tabuk Avenue development.',
        startTime: new Date(year, month, 15, 9, 30),
        endTime: new Date(year, month, 15, 10, 30),
        color: 'orange',
        category: 'Finance',
        tags: ['Internal'],
      },
      {
        id: 'event-weekly-meeting',
        title: 'Weekly pipeline meeting',
        description: 'Team sync for upcoming listings.',
        startTime: new Date(year, month, 22, 11, 0),
        endTime: new Date(year, month, 22, 12, 0),
        color: 'blue',
        category: 'Meeting',
        tags: ['Team'],
      },
      {
        id: 'event-ready-mat',
        title: 'Ready Mat check-in',
        description: 'Vendor progress update call.',
        startTime: new Date(year, month, 19, 16, 0),
        endTime: new Date(year, month, 19, 16, 45),
        color: 'pink',
        category: 'Reminder',
        tags: ['Vendor'],
      },
    ];
  }, []);

  return (
    <div className="rounded-3xl border border-border bg-background/60 p-6 shadow-sm backdrop-blur-sm">
      <EventManager events={initialEvents} />
    </div>
  );
}


