import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export default function EventInvitations() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [recipientGroups, setRecipientGroups] = useState<string[]>([]);

  const { data: eventsData } = trpc.events.listAll.useQuery();
  
  const sendInvitationsMutation = trpc.events.sendInvitations.useMutation({
    onSuccess: (data: { sentCount: number }) => {
      toast.success("Inbjudningar skickade till " + data.sentCount + " medlemmar!");
      setIsOpen(false);
      setSelectedEvent("");
      setRecipientGroups([]);
    },
    onError: (error: any) => {
      toast.error(error.message || "Kunde inte skicka inbjudningar");
    },
  });

  const handleSendInvitations = () => {
    if (!selectedEvent) {
      toast.error("Välj ett evenemang");
      return;
    }
    if (recipientGroups.length === 0) {
      toast.error("Välj minst en mottagargrupp");
      return;
    }

    sendInvitationsMutation.mutate({
      eventId: parseInt(selectedEvent),
      recipientGroups,
    });
  };

  const toggleRecipientGroup = (group: string) => {
    setRecipientGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const recipientGroupOptions = [
    { value: "all_active", label: "Alla aktiva medlemmar" },
    { value: "board", label: "Styrelsen" },
    { value: "paid_current_year", label: "Betalat innevarande år" },
    { value: "unpaid", label: "Ej betalat" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Mail className="mr-2 h-4 w-4" />
          Bjud in till evenemang
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bjud in medlemmar</DialogTitle>
          <DialogDescription>
            Välj evenemang och vilka medlemmar som ska få inbjudan
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="event">Välj evenemang *</Label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger id="event">
                <SelectValue placeholder="Välj ett evenemang..." />
              </SelectTrigger>
              <SelectContent>
                {eventsData?.map((event) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.title} - {new Date(event.eventDate).toLocaleDateString("sv-SE")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Mottagare *</Label>
            <div className="space-y-2 mt-2">
              {recipientGroupOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={recipientGroups.includes(option.value)}
                    onCheckedChange={() => toggleRecipientGroup(option.value)}
                  />
                  <label
                    htmlFor={option.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {recipientGroups.length > 0 && (
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              <strong>Valda grupper:</strong> {recipientGroups.map(g => 
                recipientGroupOptions.find(o => o.value === g)?.label
              ).join(", ")}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Avbryt
          </Button>
          <Button 
            onClick={handleSendInvitations}
            disabled={!selectedEvent || recipientGroups.length === 0 || sendInvitationsMutation.isPending}
          >
            {sendInvitationsMutation.isPending ? "Skickar..." : "Skicka inbjudningar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
