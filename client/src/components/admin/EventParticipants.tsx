import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Mail, Phone, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

interface EventParticipantsProps {
  eventId: number;
  eventTitle: string;
}

export default function EventParticipants({ eventId, eventTitle }: EventParticipantsProps) {
  const { data: eventData, refetch } = trpc.events.getWithRegistrations.useQuery({ id: eventId });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "registered":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Anmäld</Badge>;
      case "waitlist":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Reserv</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Avbokad</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!eventData) {
    return <div>Laddar...</div>;
  }

  const registeredParticipants = eventData.registrations.filter(r => r.status === "registered");
  const waitlistParticipants = eventData.registrations.filter(r => r.status === "waitlist");
  const cancelledParticipants = eventData.registrations.filter(r => r.status === "cancelled");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Deltagare ({eventData.registeredCount})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deltagare - {eventTitle}</DialogTitle>
          <DialogDescription>
            {eventData.registeredCount} anmälda
            {eventData.maxParticipants && ` av ${eventData.maxParticipants} platser`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Registered Participants */}
          {registeredParticipants.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Anmälda ({registeredParticipants.length})
              </h3>
              <div className="space-y-2">
                {registeredParticipants.map((reg) => (
                  <Card key={reg.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{reg.user?.name || "Okänd"}</span>
                            {getStatusBadge(reg.status)}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            {reg.user?.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                <a href={`mailto:${reg.user?.email}`} className="hover:underline">
                                  {reg.user?.email}
                                </a>
                              </div>
                            )}
                            {reg.user?.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <a href={`tel:${reg.user?.phone}`} className="hover:underline">
                                  {reg.user?.phone}
                                </a>
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              Anmäld: {formatDate(reg.registeredAt)}
                            </div>
                            {reg.notes && (
                              <div className="text-sm mt-2 p-2 bg-gray-50 rounded">
                                <strong>Anteckning:</strong> {reg.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Waitlist Participants */}
          {waitlistParticipants.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Reservlista ({waitlistParticipants.length})
              </h3>
              <div className="space-y-2">
                {waitlistParticipants.map((reg) => (
                  <Card key={reg.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{reg.user?.name || "Okänd"}</span>
                            {getStatusBadge(reg.status)}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            {reg.user?.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                <a href={`mailto:${reg.user?.email}`} className="hover:underline">
                                  {reg.user?.email}
                                </a>
                              </div>
                            )}
                            {reg.user?.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <a href={`tel:${reg.user?.phone}`} className="hover:underline">
                                  {reg.user?.phone}
                                </a>
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              Anmäld: {formatDate(reg.registeredAt)}
                            </div>
                            {reg.notes && (
                              <div className="text-sm mt-2 p-2 bg-gray-50 rounded">
                                <strong>Anteckning:</strong> {reg.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled Participants */}
          {cancelledParticipants.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold text-sm text-gray-600 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Avbokade ({cancelledParticipants.length})
              </summary>
              <div className="space-y-2 mt-2">
                {cancelledParticipants.map((reg) => (
                  <Card key={reg.id} className="opacity-60">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{reg.user?.name || "Okänd"}</span>
                        <span className="text-xs text-gray-500">
                          Avbokad: {formatDate(reg.registeredAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </details>
          )}

          {eventData.registrations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Inga anmälningar än</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
