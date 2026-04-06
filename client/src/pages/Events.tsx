import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Home, Calendar as CalendarIcon, MapPin, Clock, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { useSiteBranding } from "@/hooks/useCMSContent";

export default function Events() {
  const { siteLogo } = useSiteBranding();
  const { data: eventsData } = trpc.events.list.useQuery();
  const { data: myEvents } = trpc.events.myEvents.useQuery();
  const { user, isAuthenticated } = useAuth();
  const [registeringEventId, setRegisteringEventId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const registerMutation = trpc.events.register.useMutation({
    onSuccess: (data) => {
      if (data.status === 'waitlist') {
        toast.success("Du har lagts till på reservlistan!");
      } else {
        toast.success("Du är nu anmäld till evenemanget!");
      }
      setRegisteringEventId(null);
      setNotes("");
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[oklch(0.25_0.08_250)] text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={siteLogo} alt="Gamla SSK Logo" className="h-16 w-16" />
              <div>
                <h1 className="text-2xl font-bold">Kalender & Evenemang</h1>
                <p className="text-sm opacity-90">Föreningen Gamla SSK-are</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Home className="mr-2 h-4 w-4" />
                Hem
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Kommande evenemang</h2>
          <p className="text-gray-600">
            Se våra kommande aktiviteter och anmäl dig direkt här!
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

                  {event.maxParticipants && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Users className="h-4 w-4" />
                      <span>Max {event.maxParticipants} deltagare</span>
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
                              {myReg?.status === 'waitlist' ? 'Du står på reservlistan' : 'Du är anmäld'}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleCancel(event.id)}
                            disabled={cancelMutation.isPending}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Avboka
                          </Button>
                        </>
                      ) : (
                        <Dialog open={registeringEventId === event.id} onOpenChange={(open) => !open && setRegisteringEventId(null)}>
                          <DialogTrigger asChild>
                            <Button
                              className="w-full"
                              onClick={() => setRegisteringEventId(event.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Anmäl dig
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Anmäl dig till {event.title}</DialogTitle>
                              <DialogDescription>
                                Bekräfta din anmälan till evenemanget
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="notes">Meddelande (valfritt)</Label>
                                <Textarea
                                  id="notes"
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder="T.ex. allergier, specialkost, etc."
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setRegisteringEventId(null)}
                              >
                                Avbryt
                              </Button>
                              <Button
                                onClick={() => handleRegister(event.id)}
                                disabled={registerMutation.isPending}
                              >
                                Bekräfta anmälan
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Logga in för att anmäla dig</span>
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
              Inga kommande evenemang
            </h3>
            <p className="text-gray-600">
              Håll utkik här för framtida aktiviteter!
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Föreningen Gamla SSK-are. Alla rättigheter förbehållna.</p>
        </div>
      </footer>
    </div>
  );
}
