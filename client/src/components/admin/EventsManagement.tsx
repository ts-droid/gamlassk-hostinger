import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Plus, Pencil, Trash2, MapPin, Clock } from "lucide-react";
import EventParticipants from "./EventParticipants";

export default function EventsManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    type: "",
    feeAmount: "",
    paymentInstructions: "",
  });

  const { data: eventsData, refetch } = trpc.events.listAll.useQuery();

  const createMutation = trpc.events.create.useMutation({
    onSuccess: () => {
      toast.success("Evenemang skapat!");
      setIsCreateOpen(false);
      setFormData({ title: "", description: "", eventDate: "", location: "", type: "", feeAmount: "", paymentInstructions: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte skapa evenemang");
    },
  });

  const updateMutation = trpc.events.update.useMutation({
    onSuccess: () => {
      toast.success("Evenemang uppdaterat!");
      setEditingEvent(null);
      setFormData({ title: "", description: "", eventDate: "", location: "", type: "", feeAmount: "", paymentInstructions: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte uppdatera evenemang");
    },
  });

  const deleteMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      toast.success("Evenemang borttaget!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte ta bort evenemang");
    },
  });

  const handleCreate = () => {
    if (!formData.title || !formData.eventDate) {
      toast.error("Titel och datum är obligatoriska");
      return;
    }
    createMutation.mutate({
      ...formData,
      eventDate: new Date(formData.eventDate),
      feeAmount: formData.feeAmount || undefined,
      paymentInstructions: formData.paymentInstructions || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingEvent) return;
    updateMutation.mutate({
      id: editingEvent.id,
      title: formData.title,
      description: formData.description,
      eventDate: formData.eventDate ? new Date(formData.eventDate) : undefined,
      location: formData.location,
      type: formData.type,
      feeAmount: formData.feeAmount || undefined,
      paymentInstructions: formData.paymentInstructions || undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Är du säker på att du vill ta bort detta evenemang?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      eventDate: new Date(event.eventDate).toISOString().slice(0, 16),
      location: event.location || "",
      type: event.type || "",
      feeAmount: event.feeAmount || "",
      paymentInstructions: event.paymentInstructions || "",
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("sv-SE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Evenemang</h2>
          <p className="text-gray-600">Hantera kalender och evenemang</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Skapa evenemang
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Skapa nytt evenemang</DialogTitle>
              <DialogDescription>
                Lägg till ett nytt evenemang i kalendern
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="t.ex. Vårfesten 2024"
                />
              </div>
              <div>
                <Label htmlFor="date">Datum och tid *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Plats</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="t.ex. Scaniarinken, Södertälje"
                />
              </div>
              <div>
                <Label htmlFor="type">Typ</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="t.ex. Vårfest, Bingo, Match"
                />
              </div>
              <div>
                <Label htmlFor="description">Beskrivning</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Beskriv evenemanget..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="feeAmount">Avgift</Label>
                <Input
                  id="feeAmount"
                  value={formData.feeAmount}
                  onChange={(e) => setFormData({ ...formData, feeAmount: e.target.value })}
                  placeholder="t.ex. 300 kr/person"
                />
              </div>
              <div>
                <Label htmlFor="paymentInstructions">Betalningsinfo</Label>
                <Textarea
                  id="paymentInstructions"
                  value={formData.paymentInstructions}
                  onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
                  placeholder="t.ex. Swish 123-616 52 29 eller BG 123-4567"
                  rows={3}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Den här informationen kan användas i anmälningsrutan tillsammans med CMS-texten för events-sidan.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Avbryt
              </Button>
              <Button onClick={handleCreate} disabled={!formData.title || !formData.eventDate}>
                Skapa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {eventsData?.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                  </div>
                  {event.type && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {event.type}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <EventParticipants eventId={event.id} eventTitle={event.title} />
                  <Dialog open={editingEvent?.id === event.id} onOpenChange={(open) => !open && setEditingEvent(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Redigera evenemang</DialogTitle>
                        <DialogDescription>
                          Uppdatera evenemangsinformation
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-title">Titel *</Label>
                          <Input
                            id="edit-title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-date">Datum och tid *</Label>
                          <Input
                            id="edit-date"
                            type="datetime-local"
                            value={formData.eventDate}
                            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-location">Plats</Label>
                          <Input
                            id="edit-location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-type">Typ</Label>
                          <Input
                            id="edit-type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-description">Beskrivning</Label>
                          <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-feeAmount">Avgift</Label>
                          <Input
                            id="edit-feeAmount"
                            value={formData.feeAmount}
                            onChange={(e) => setFormData({ ...formData, feeAmount: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-paymentInstructions">Betalningsinfo</Label>
                          <Textarea
                            id="edit-paymentInstructions"
                            value={formData.paymentInstructions}
                            onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingEvent(null)}>
                          Avbryt
                        </Button>
                        <Button onClick={handleUpdate}>
                          Spara ändringar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="h-4 w-4" />
                  {formatDate(event.eventDate)}
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                )}
                {event.description && (
                  <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                )}
                {event.feeAmount && (
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">Avgift:</span> {event.feeAmount}
                  </p>
                )}
                {event.paymentInstructions && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Betalning:</span> {event.paymentInstructions}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!eventsData || eventsData.length === 0) && (
        <div className="text-center py-12 text-gray-600">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p>Inga evenemang än. Skapa ditt första evenemang!</p>
        </div>
      )}
    </div>
  );
}
