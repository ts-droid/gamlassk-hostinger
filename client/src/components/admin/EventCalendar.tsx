import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { sv } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './EventCalendar.css';

const locales = {
  'sv': sv,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface EventCalendarProps {
  events: Array<{
    id: number;
    title: string;
    eventDate: Date;
    description?: string | null;
    location?: string | null;
    type?: string | null;
  }>;
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
  onSelectEvent: (event: any) => void;
}

export default function EventCalendar({ events, onSelectSlot, onSelectEvent }: EventCalendarProps) {
  // Transform events for react-big-calendar
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.eventDate),
    end: new Date(event.eventDate),
    resource: event,
  }));

  return (
    <div className="h-[600px] bg-white p-4 rounded-lg border">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        culture="sv"
        messages={{
          next: "Nästa",
          previous: "Föregående",
          today: "Idag",
          month: "Månad",
          week: "Vecka",
          day: "Dag",
          agenda: "Agenda",
          date: "Datum",
          time: "Tid",
          event: "Evenemang",
          noEventsInRange: "Inga evenemang under denna period",
          showMore: (total) => `+ ${total} fler`,
        }}
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={(event) => onSelectEvent(event.resource)}
        style={{ height: '100%' }}
      />
    </div>
  );
}
