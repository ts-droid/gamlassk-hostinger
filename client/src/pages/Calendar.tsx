import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { sv } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, MapPin, Clock, Users, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import { PageHero, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useCMSContent } from '@/hooks/useCMSContent';
import { renderEventRegistrationNotice } from '@/lib/eventRegistration';

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
  const { getContent: getCalendarContent } = useCMSContent('calendar');
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [isMobileCalendar, setIsMobileCalendar] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [registrationNotes, setRegistrationNotes] = useState('');
  const [hasAcceptedNotice, setHasAcceptedNotice] = useState(false);

  const { data: events, isLoading } = trpc.events.list.useQuery();
  const { data: myEvents } = trpc.events.myEvents.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { getContent: getEventContent } = useCMSContent('events');

  const registerMutation = trpc.events.register.useMutation({
    onSuccess: () => {
      toast.success('Du är nu anmäld till eventet!');
      setShowRegistrationDialog(false);
      setShowEventDialog(false);
      setRegistrationNotes('');
      setHasAcceptedNotice(false);
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

  const getMyRegistration = (eventId: number) => {
    return myEvents?.find((entry) => entry.event?.id === eventId)?.registration;
  };

  const selectedRegistration = selectedEvent ? getMyRegistration(selectedEvent.id) : null;
  const isRegistered = Boolean(selectedRegistration && selectedRegistration.status !== 'cancelled');
  const registrationNoticeTemplate = getEventContent('registration_notice');

  const handleRegister = () => {
    if (!selectedEvent) return;
    registerMutation.mutate({ eventId: selectedEvent.id, notes: registrationNotes });
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

  const closeRegistrationDialog = () => {
    setShowRegistrationDialog(false);
    setRegistrationNotes('');
    setHasAcceptedNotice(false);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileCalendar(mobile);
      setView((currentView) => {
        if (mobile && currentView === 'month') {
          return 'agenda';
        }

        if (!mobile && currentView === 'agenda') {
          return 'month';
        }

        return currentView;
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <SiteHeader currentPath="/calendar" />
      <PageHero
        title={getCalendarContent('hero_title', 'Evenemangskalender')}
        description={getCalendarContent('hero_description', 'Se alla kommande evenemang, prenumerera på kalendern och anmäl dig direkt.')}
      />

      {/* Calendar Subscription */}
      <div className="container py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{getCalendarContent('subscription_title', 'Prenumerera på kalendern')}</CardTitle>
            <CardDescription>
              {getCalendarContent(
                'subscription_description',
                'Lägg till alla evenemang i din egen kalender och få automatiska uppdateringar',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
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
              {getCalendarContent('download_feed_label', 'Ladda ner iCal-feed')}
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                const webcalUrl = window.location.origin.replace('http://', 'webcal://').replace('https://', 'webcal://') + '/api/calendar/feed.ics';
                navigator.clipboard.writeText(webcalUrl);
                toast.success(getCalendarContent('copy_feed_success', 'Prenumerationslänk kopierad!'));
              }}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getCalendarContent('copy_feed_label', 'Kopiera prenumerationslänk')}
            </Button>
          </CardContent>
        </Card>

        {/* Calendar View */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">{getCalendarContent('loading_text', 'Laddar kalender...')}</div>
              </div>
            ) : (
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: isMobileCalendar ? 520 : 600 }}
                view={view}
                onView={setView}
                views={isMobileCalendar ? ['agenda', 'day'] : ['month', 'week', 'day', 'agenda']}
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

                  {(selectedEvent.feeAmount || selectedEvent.paymentInstructions) && (
                    <div className="md:col-span-2 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                      {selectedEvent.feeAmount && (
                        <div>
                          <span className="font-medium">Avgift:</span> {selectedEvent.feeAmount}
                        </div>
                      )}
                      {selectedEvent.paymentInstructions && (
                        <div className="mt-1">
                          <span className="font-medium">Betalning:</span> {selectedEvent.paymentInstructions}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Add to Calendar Buttons */}
                <div className="border-t pt-4">
                  <div className="font-medium mb-3">{getCalendarContent('event_add_to_calendar_title', 'Lägg till i kalender')}</div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToGoogleCalendar(selectedEvent)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {getCalendarContent('google_calendar_label', 'Google Calendar')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadICS(selectedEvent.id, selectedEvent.title)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {getCalendarContent('download_ics_label', 'Ladda ner (.ics)')}
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
                          <span className="font-medium">{getEventContent('calendar_registered_status_label', 'Du är anmäld till detta event')}</span>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={cancelMutation.isPending}
                        >
                          {getEventContent('calendar_cancel_registration_label', 'Avboka anmälan')}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setShowRegistrationDialog(true)}
                        disabled={registerMutation.isPending}
                        className="w-full"
                      >
                        {getEventContent('calendar_register_button_label', 'Anmäl dig till eventet')}
                      </Button>
                    )}
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="border-t pt-4">
                    <p className="text-gray-600 text-sm">
                      {getEventContent('calendar_login_prompt_label', 'Logga in för att anmäla dig till eventet')}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRegistrationDialog} onOpenChange={(open) => !open && closeRegistrationDialog()}>
        <DialogContent className="max-w-xl">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>Anmäl dig till {selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  {getEventContent('calendar_registration_dialog_description', 'Bekräfta din anmälan. Uppgifterna sparas i evenemangets deltagarlista i adminpanelen.')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                  <div className="mb-2 font-medium">{getEventContent('registration_notice_title', 'Viktig information före anmälan')}</div>
                  <div
                    className="prose prose-sm max-w-none text-blue-900 prose-p:my-2"
                    dangerouslySetInnerHTML={{
                      __html: renderEventRegistrationNotice(registrationNoticeTemplate, selectedEvent),
                    }}
                  />
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                  <Checkbox
                    id="calendar-event-accept"
                    checked={hasAcceptedNotice}
                    onCheckedChange={(checked) => setHasAcceptedNotice(checked === true)}
                  />
                  <Label htmlFor="calendar-event-accept" className="text-sm font-normal leading-6">
                    {getEventContent('calendar_registration_accept_label', 'Jag har läst informationen ovan och vill registrera min anmälan till eventet.')}
                  </Label>
                </div>

                <div>
                  <Label htmlFor="calendar-event-notes">{getEventContent('registration_notes_label', 'Meddelande (valfritt)')}</Label>
                  <Textarea
                    id="calendar-event-notes"
                    value={registrationNotes}
                    onChange={(e) => setRegistrationNotes(e.target.value)}
                    placeholder={getEventContent('calendar_registration_notes_placeholder', 'T.ex. allergier, specialkost eller annan viktig information')}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeRegistrationDialog}>
                  {getEventContent('registration_cancel_label', 'Avbryt')}
                </Button>
                <Button
                  onClick={handleRegister}
                  disabled={registerMutation.isPending || !hasAcceptedNotice}
                >
                  {getEventContent('registration_confirm_label', 'Bekräfta anmälan')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <SiteFooter />
    </div>
  );
}
