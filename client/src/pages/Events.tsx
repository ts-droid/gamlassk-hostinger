import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Calendar as CalendarIcon, MapPin, Clock, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { PageHero, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useCMSContent } from "@/hooks/useCMSContent";
import { renderEventRegistrationNotice } from "@/lib/eventRegistration";

export default function Events() {
  const { data: eventsData } = trpc.events.list.useQuery();
  const { isAuthenticated } = useAuth();
  const { data: myEvents } = trpc.events.myEvents.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { getContent } = useCMSContent("events");
  const [registeringEventId, setRegisteringEventId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [hasAcceptedNotice, setHasAcceptedNotice] = useState(false);

  const registerMutation = trpc.events.register.useMutation({
    onSuccess: (data) => {
      if (data.status === 'waitlist') {
        toast.success("Du har lagts till på reservlistan!");
      } else {
        toast.success("Du är nu anmäld till evenemanget!");
      }
      setRegisteringEventId(null);
      setNotes("");
      setHasAcceptedNotice(false);
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte anmäla dig");
    },
  });

  const cancelMutation = trpc.events.cancelRegistration.useMutation({
    onSuccess: () => {
      toast.success("Din anmälan har avbokats");
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte avboka");
    },
  });

  const handleRegister = (eventId: number) => {
    registerMutation.mutate({ eventId, notes });
  };

  const closeRegistrationDialog = () => {
    setRegisteringEventId(null);
    setNotes("");
    setHasAcceptedNotice(false);
  };

  const handleCancel = (eventId: number) => {
    if (confirm("Är du säker på att du vill avboka din anmälan?")) {
      cancelMutation.mutate({ eventId });
    }
  };

  const getMyRegistration = (eventId: number) => {
    return myEvents?.find(e => e.event?.id === eventId)?.registration;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("sv-SE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "vårfest":
        return "bg-pink-100 text-pink-800";
      case "bingo":
        return "bg-yellow-100 text-yellow-800";
      case "match":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const registrationNoticeTemplate = getContent("registration_notice");

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader currentPath="/calendar" />
      <PageHero
        title={getContent("hero_title", "Kalender och evenemang")}
        description={getContent("hero_description", "Se våra kommande aktiviteter och anmäl dig direkt här.")}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{getContent("intro_title", "Kommande evenemang")}</h2>
          <p className="text-gray-600">
            {getContent("intro_description", "Se våra kommande aktiviteter och anmäl dig direkt här!")}
          </p>
        </div>

        {/* Events List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eventsData?.map((event) => {
            const myReg = getMyRegistration(event.id);
            const isRegistered = myReg !== undefined && myReg !== null;
            
            return (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CalendarIcon className="h-8 w-8 text-blue-600" />
                    {event.type && (
                      <span className={`text-xs px-2 py-1 rounded ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-semibold">{formatDate(event.eventDate)}</div>
                        <div className="text-sm text-gray-600">{formatTime(event.eventDate)}</div>
                      </div>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                  )}

                  {(event.feeAmount || event.paymentInstructions) && (
                    <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                      {event.feeAmount && (
                        <div>
                          <span className="font-medium">{getContent("fee_label", "Avgift")}:</span> {event.feeAmount}
                        </div>
                      )}
                      {event.paymentInstructions && (
                        <div>
                          <span className="font-medium">{getContent("payment_label", "Betalning")}:</span> {event.paymentInstructions}
                        </div>
                      )}
                    </div>
                  )}

                  {event.maxParticipants && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Users className="h-4 w-4" />
                      <span>{getContent("max_participants_prefix", "Max")} {event.maxParticipants} {getContent("max_participants_suffix", "deltagare")}</span>
                    </div>
                  )}

                  {/* Registration Status & Actions */}
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      {isRegistered ? (
                        <>
                          <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {myReg?.status === 'waitlist'
                                ? getContent("waitlist_status_label", "Du står på reservlistan")
                                : getContent("registered_status_label", "Du är anmäld")}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleCancel(event.id)}
                            disabled={cancelMutation.isPending}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            {getContent("cancel_button_label", "Avboka")}
                          </Button>
                        </>
                      ) : (
                        <Dialog open={registeringEventId === event.id} onOpenChange={(open) => !open && closeRegistrationDialog()}>
                          <DialogTrigger asChild>
                            <Button
                              className="w-full"
                              onClick={() => {
                                setRegisteringEventId(event.id);
                                setNotes("");
                                setHasAcceptedNotice(false);
                              }}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {getContent("register_button_label", "Anmäl dig")}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Anmäl dig till {event.title}</DialogTitle>
                              <DialogDescription>
                                {getContent("registration_dialog_description", "Bekräfta din anmälan till evenemanget")}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                                <div className="mb-2 font-medium">{getContent("registration_notice_title", "Viktig information före anmälan")}</div>
                                <div
                                  className="prose prose-sm max-w-none text-blue-900 prose-p:my-2"
                                  dangerouslySetInnerHTML={{
                                    __html: renderEventRegistrationNotice(registrationNoticeTemplate, event),
                                  }}
                                />
                              </div>

                              <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                                <Checkbox
                                  id={`event-accept-${event.id}`}
                                  checked={hasAcceptedNotice}
                                  onCheckedChange={(checked) => setHasAcceptedNotice(checked === true)}
                                />
                                <Label
                                  htmlFor={`event-accept-${event.id}`}
                                  className="text-sm font-normal leading-6"
                                >
                                  {getContent("registration_accept_label", "Jag har läst informationen ovan och förstår att min anmälan registreras i systemet.")}
                                </Label>
                              </div>

                              <div>
                                <Label htmlFor="notes">{getContent("registration_notes_label", "Meddelande (valfritt)")}</Label>
                                <Textarea
                                  id="notes"
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder={getContent("registration_notes_placeholder", "T.ex. allergier, specialkost, etc.")}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={closeRegistrationDialog}
                              >
                                {getContent("registration_cancel_label", "Avbryt")}
                              </Button>
                              <Button
                                onClick={() => handleRegister(event.id)}
                                disabled={registerMutation.isPending || !hasAcceptedNotice}
                              >
                                {getContent("registration_confirm_label", "Bekräfta anmälan")}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{getContent("login_prompt_label", "Logga in för att anmäla dig")}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {(!eventsData || eventsData.length === 0) && (
          <div className="text-center py-16">
            <CalendarIcon className="h-24 w-24 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {getContent("empty_state_title", "Inga kommande evenemang")}
            </h3>
            <p className="text-gray-600">
              {getContent("empty_state_description", "Håll utkik här för framtida aktiviteter!")}
            </p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
