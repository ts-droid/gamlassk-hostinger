import { useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { sv } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, MapPin, Clock, Users, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import { useSiteBranding } from '@/hooks/useCMSContent';

const locales = {
  sv: sv,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: sv }),
  getDay,
  locales,
});

export default function Calendar() {
  const { siteLogo, siteName } = useSiteBranding();
  const { user, isAuthenticated } = useAuth();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);

  const { data: events, isLoading } = trpc.events.list.useQuery();
  const [isRegistered, setIsRegistered] = useState(false);
  
  // Check registration status when event is selected
  const checkRegistration = async (eventId: number) => {
    if (!isAuthenticated) {
      setIsRegistered(false);
      return;
    }
    // This will be checked via the event details
    // For now, set to false and let user try to register
    setIsRegistered(false);
  };

  const registerMutation = trpc.events.register.useMutation({
    onSuccess: () => {
      toast.success('Du är nu anmäld till eventet!');
      setShowEventDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Kunde inte anmäla dig');
    },
  });

  const cancelMutation = trpc.events.cancelRegistration.useMutation({
    onSuccess: () => {
      toast.success('Din anmälan är avbokad');
      setShowEventDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Kunde inte avboka');
    },
  });

  // Transform events for react-big-calendar
  const calendarEvents = events?.map((event) => {
    const startDate = new Date(event.eventDate);
    
    if (event.eventTime) {
      const [hours, minutes] = event.eventTime.split(':').map(Number);
      startDate.setHours(hours, minutes, 0, 0);
    }

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    return {
      id: event.id,
      title: event.title,
      start: startDate,
      end: endDate,
      resource: event,
    };
  }) || [];

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
    setShowEventDialog(true);
  };

  const handleRegister = () => {
    if (!selectedEvent) return;
    registerMutation.mutate({ eventId: selectedEvent.id });
  };

  const handleCancel = () => {
    if (!selectedEvent) return;
    cancelMutation.mutate({ eventId: selectedEvent.id });
  };

  const downloadICS = (eventId: number, title: string) => {
    const link = document.createElement('a');
    link.href = `/api/calendar/event/${eventId}.ics`;
    link.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addToGoogleCalendar = (event: any) => {
    const startDate = new Date(event.eventDate);
    if (event.eventTime) {
      const [hours, minutes] = event.eventTime.split(':').map(Number);
      startDate.setHours(hours, minutes, 0, 0);
    }
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: event.description || '',
      location: event.location || '',
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container">
          <div className="mb-4 flex items-center gap-4">
            <img src={siteLogo} alt={siteName} className="h-16 w-16 rounded-md object-cover" />
            <div>
              <h1 className="text-4xl font-bold">Evenemangskalender</h1>
              <p className="text-sm text-blue-100">{siteName}</p>
            </div>
          </div>
          <p className="text-xl text-blue-100">
            Se alla kommande evenemang och anmäl dig direkt
          </p>
        </div>
      </div>

      {/* Calendar Subscription */}
      <div className="container py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Prenumerera på kalendern</CardTitle>
            <CardDescription>
              Lägg till alla evenemang i din egen kalender och få automatiska uppdateringar
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/api/calendar/feed.ics';
                link.download = 'gamla-ssk-events.ics';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Ladda ner iCal-feed
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const webcalUrl = window.location.origin.replace('http://', 'webcal://').replace('https://', 'webcal://') + '/api/calendar/feed.ics';
                navigator.clipboard.writeText(webcalUrl);
                toast.success('Prenumerationslänk kopierad!');
              }}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Kopiera prenumerationslänk
            </Button>
          </CardContent>
        </Card>

        {/* Calendar View */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">Laddar kalender...</div>
              </div>
            ) : (
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                onSelectEvent={handleSelectEvent}
                messages={{
                  next: 'Nästa',
                  previous: 'Föregående',
                  today: 'Idag',
                  month: 'Månad',
                  week: 'Vecka',
                  day: 'Dag',
                  agenda: 'Agenda',
                  date: 'Datum',
                  time: 'Tid',
                  event: 'Evenemang',
                  noEventsInRange: 'Inga evenemang i detta intervall',
                  showMore: (total: number) => `+ ${total} fler`,
                }}
                culture="sv"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  {selectedEvent.type && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mt-2">
                      {selectedEvent.type}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedEvent.description && (
                  <p className="text-gray-700">{selectedEvent.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">Datum</div>
                      <div className="text-gray-600">
                        {format(new Date(selectedEvent.eventDate), 'PPP', { locale: sv })}
                      </div>
                    </div>
                  </div>

                  {selectedEvent.eventTime && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">Tid</div>
                        <div className="text-gray-600">{selectedEvent.eventTime}</div>
                      </div>
                    </div>
                  )}

                  {selectedEvent.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">Plats</div>
                        <div className="text-gray-600">{selectedEvent.location}</div>
                      </div>
                    </div>
                  )}

                  {selectedEvent.maxParticipants && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">Max deltagare</div>
                        <div className="text-gray-600">{selectedEvent.maxParticipants}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Add to Calendar Buttons */}
                <div className="border-t pt-4">
                  <div className="font-medium mb-3">Lägg till i kalender</div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToGoogleCalendar(selectedEvent)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Google Calendar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadICS(selectedEvent.id, selectedEvent.title)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Ladda ner (.ics)
                    </Button>
                  </div>
                </div>

                {/* Registration */}
                {isAuthenticated && (
                  <div className="border-t pt-4">
                    {isRegistered ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-600">
                          <div className="h-2 w-2 bg-green-600 rounded-full" />
                          <span className="font-medium">Du är anmäld till detta event</span>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={cancelMutation.isPending}
                        >
                          Avboka anmälan
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleRegister}
                        disabled={registerMutation.isPending}
                        className="w-full"
                      >
                        Anmäl dig till eventet
                      </Button>
                    )}
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="border-t pt-4">
                    <p className="text-gray-600 text-sm">
                      Logga in för att anmäla dig till eventet
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
