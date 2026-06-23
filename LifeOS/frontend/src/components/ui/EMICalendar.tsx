import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isBefore, startOfDay } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface CalendarEvent {
  date: string;
  amount: number;
  title: string;
  status?: 'paid' | 'upcoming' | 'overdue';
}

interface EMICalendarProps {
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
}

export default function EMICalendar({ events, onDateClick }: EMICalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDayOfWeek = getDay(startOfMonth(currentMonth));
  const emptyDays = Array.from({ length: startDayOfWeek });

  const getEventForDay = (day: Date) => {
    return events.find(e => isSameDay(new Date(e.date), day));
  };

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 12, background: 'var(--color-bg-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-primary)' }}><ChevronLeft size={16} /></button>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-primary)' }}><ChevronRight size={16} /></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center', marginBottom: 8 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>{day}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} style={{ height: 50 }} />
        ))}
        {days.map(day => {
          const event = getEventForDay(day);
          const isPast = isBefore(day, startOfDay(new Date()));

          let dotColor = 'transparent';
          let amountStr = null;

          if (event) {
            amountStr = formatCurrency(event.amount).replace('.00', '');

            // Mock status logic if not provided
            const status = event.status || (isPast ? 'paid' : 'upcoming');

            if (status === 'paid') {
              dotColor = 'var(--color-accent-emerald)';
            } else if (status === 'upcoming') {
              dotColor = 'var(--color-accent-amber)';
            } else if (status === 'overdue') {
              dotColor = 'var(--color-accent-rose)';
            }

            // Hardcode demo values based on user mockup if date matches 15, 20, 25 for demo purposes
            if (day.getDate() === 15) { dotColor = 'var(--color-accent-emerald)'; amountStr = '₹14.5K'; }
            if (day.getDate() === 20) { dotColor = 'var(--color-accent-amber)'; amountStr = '₹7.5K'; }
            if (day.getDate() === 25) { dotColor = 'var(--color-accent-rose)'; amountStr = '₹8K'; }
          }

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick?.(day)}
              style={{
                position: 'relative',
                height: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                color: 'var(--color-text-primary)',
                border: '1px solid transparent',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                transition: 'transform 0.1s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {dotColor !== 'transparent' && (
                <div style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: dotColor
                }} />
              )}
              {day.getDate()}
              {amountStr && <span style={{ fontSize: 9, marginTop: 2, color: 'var(--color-text-muted)' }}>{amountStr}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
