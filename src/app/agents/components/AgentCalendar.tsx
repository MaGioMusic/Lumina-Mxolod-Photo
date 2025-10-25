'use client';

import { useMemo, useState, Suspense } from 'react';
import { CaretLeft, CaretRight, Calendar as CalendarIcon } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';

const MiniCalendarGlass = dynamic(() => import('@/components/DayPickerGlass').then(m => m.MiniCalendarGlass), { ssr: false });

type EventItem = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  color?: 'green' | 'purple' | 'orange' | 'blue';
};

function formatKey(y: number, m: number, d: number) {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${y}-${pad(m)}-${pad(d)}`;
}

export default function AgentCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-index

  const events: EventItem[] = useMemo(() => ([
    { id: 'e1', date: `${year}-${String(month + 1).padStart(2, '0')}-06`, title: 'Modern space', color: 'purple' },
    { id: 'e2', date: `${year}-${String(month + 1).padStart(2, '0')}-08`, title: '8 Chairs', color: 'green' },
    { id: 'e3', date: `${year}-${String(month + 1).padStart(2, '0')}-15`, title: 'Quote for 12 Tab', color: 'orange' },
    { id: 'e4', date: `${year}-${String(month + 1).padStart(2, '0')}-22`, title: 'Meeting', color: 'purple' },
    { id: 'e5', date: `${year}-${String(month + 1).padStart(2, '0')}-19`, title: 'Ready Mat', color: 'blue' },
  ]), [year, month]);

  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const grid: { key: string; day: number; muted: boolean }[] = [];
  const lead = (firstWeekday + 7) % 7; // ensure 0..6
  for (let i = lead - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const dateKey = formatKey(year, month, d);
    grid.push({ key: dateKey + '-prev', day: d, muted: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push({ key: formatKey(year, month + 1, d), day: d, muted: false });
  }
  while (grid.length % 7 !== 0) {
    const d = grid.length - (lead + daysInMonth) + 1;
    grid.push({ key: formatKey(year, month + 2, d), day: d, muted: true });
  }

  const perDayEvents = new Map<string, EventItem[]>();
  events.forEach((ev) => {
    const arr = perDayEvents.get(ev.date) || [];
    arr.push(ev);
    perDayEvents.set(ev.date, arr);
  });

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const goPrevMonth = () => {
    const d = new Date(year, month - 1, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };
  const goNextMonth = () => {
    const d = new Date(year, month + 1, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const colorClass = (c?: EventItem['color']) => {
    switch (c) {
      case 'green': return 'bg-green-100 text-green-700';
      case 'purple': return 'bg-purple-100 text-purple-700';
      case 'orange': return 'bg-amber-100 text-amber-700';
      case 'blue': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded border border-gray-300 text-sm">Today</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goPrevMonth} className="p-2 rounded border border-gray-300"><CaretLeft className="w-4 h-4" /></button>
            <div className="font-semibold">{monthNames[month]}, {year}</div>
            <button onClick={goNextMonth} className="p-2 rounded border border-gray-300"><CaretRight className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded border border-gray-300 text-sm">Event</button>
            <button className="px-3 py-1.5 rounded border border-gray-300 text-sm">Select dates</button>
            <button className="px-3 py-1.5 rounded border border-gray-300 text-sm">Favorites</button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-sm mb-2">
          {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((d) => (
            <div key={d} className="px-2 py-2 text-gray-500">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded overflow-hidden">
          {grid.map((g, idx) => {
            const dateISO = formatKey(year, month + (g.muted && idx < 7 ? 0 : 1), g.day);
            const list = perDayEvents.get(dateISO) || [];
            return (
              <div key={g.key} className={`min-h-[120px] bg-white p-2 ${g.muted ? 'opacity-40' : ''}`}>
                <div className="text-xs text-gray-500">{g.day}</div>
                <div className="mt-2 space-y-1">
                  {list.slice(0,3).map(ev => (
                    <div key={ev.id} className={`text-[11px] px-2 py-1 rounded ${colorClass(ev.color)} truncate`}>
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="col-span-1">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-4">
          <div className="flex items-center gap-2 font-medium mb-3"><CalendarIcon className="w-4 h-4" />Mini calendar</div>
          <Suspense fallback={<div className="h-[280px] rounded-2xl bg-gray-50" />}>
            <MiniCalendarGlass className="max-w-full" mode="single" />
          </Suspense>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="font-semibold mb-2">Activity</div>
          <div className="text-sm text-gray-600">Recent events and stats coming soon…</div>
        </div>
      </div>
    </div>
  );
}


