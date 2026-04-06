import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, UserPlus, ArrowUpDown, ArrowUp, ArrowDown, Mail } from "lucide-react";
import { MemberImportExportDialog } from "@/components/admin/MemberImportExportDialog";
import { toast } from "sonner";

type SortField = 'membershipNumber' | 'name' | 'email' | 'phone' | 'memberType' | 'membershipStatus' | 'paymentStatus';
type SortDirection = 'asc' | 'desc' | null;

export default function MemberRegistry() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Debounce search input for live search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [search]);

  const { data: members, isLoading, refetch } = trpc.members.list.useQuery({
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  const updateMutation = trpc.members.update.useMutation({
    onSuccess: () => {
      toast.success("Medlem uppdaterad!");
      refetch();
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Kunde inte uppdatera medlem: " + error.message);
    },
  });

  const generateMemberNumberMutation = trpc.members.generateMemberNumber.useMutation({
    onSuccess: (data) => {
      if (selectedMember) {
        setSelectedMember({ ...selectedMember, membershipNumber: data.memberNumber });
        toast.success("Medlemsnummer genererat: " + data.memberNumber);
      }
    },
  });

  const sendPaymentReminderMutation = trpc.members.sendPaymentReminder.useMutation({
    onSuccess: () => {
      toast.success("Betalningspåminnelse skickad!");
    },
    onError: (error: any) => {
      toast.error("Kunde inte skicka påminnelse: " + error.message);
    },
  });

  const setPasswordMutation = trpc.members.setPassword.useMutation({
    onSuccess: () => {
      toast.success("Lösenord skapat!");
      refetch();
      if (selectedMember) {
        setSelectedMember({ ...selectedMember, password: '******' });
      }
    },
    onError: (error: any) => {
      toast.error("Kunde inte skapa lösenord: " + error.message);
    },
  });

  const resetPasswordMutation = trpc.members.resetPassword.useMutation({
    onSuccess: (data) => {
      toast.success(
        <div>
          <p>Lösenord återställt!</p>
          <p className="font-mono text-sm mt-2">Temporärt lösenord: {data.tempPassword}</p>
          <p className="text-xs mt-1">Kopiera detta och ge till användaren</p>
        </div>,
        { duration: 10000 }
      );
      refetch();
    },
    onError: (error: any) => {
      toast.error("Återställning misslyckades: " + error.message);
    },
  });

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const handleSaveMember = () => {
    if (!selectedMember) return;
    updateMutation.mutate(selectedMember);
  };

  const handleSendPaymentReminder = (memberId: number, email: string) => {
    if (!email) {
      toast.error("Medlem saknar e-postadress");
      return;
    }
    sendPaymentReminderMutation.mutate({ memberId });
  };

  const handleCreatePassword = () => {
    if (!selectedMember) return;
    const password = prompt("Ange nytt lösenord för användaren (minst 6 tecken):");
    if (!password) return;
    if (password.length < 6) {
      toast.error("Lösenordet måste vara minst 6 tecken långt");
      return;
    }
    setPasswordMutation.mutate({ memberId: selectedMember.id, password });
  };

  const handleResetPassword = () => {
    if (!selectedMember) return;
    if (!confirm("Är du säker på att du vill återställa lösenordet? Ett temporärt lösenord kommer att genereras.")) {
      return;
    }
    resetPasswordMutation.mutate({ memberId: selectedMember.id });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 inline opacity-50" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4 inline" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 inline" />;
  };

  const sortedMembers = useMemo(() => {
    if (!members || !sortField || !sortDirection) return members;

    return [...members].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null/undefined values
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Convert to lowercase for string comparison
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [members, sortField, sortDirection]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      pending: "secondary",
      inactive: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      paid: "default",
      unpaid: "destructive",
      exempt: "secondary",
    };
    const labels: Record<string, string> = {
      paid: "Betald",
      unpaid: "Obetald",
      exempt: "Befriad",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Medlemsregister</h2>
        <MemberImportExportDialog />
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Label htmlFor="search">Sök medlem</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Sök efter namn, e-post eller medlemsnummer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-48">
          <Label htmlFor="status">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="pending">Väntande</SelectItem>
              <SelectItem value="inactive">Inaktiv</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Members Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('membershipNumber')}
              >
                Medlemsnr{getSortIcon('membershipNumber')}
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('name')}
              >
                Namn{getSortIcon('name')}
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('email')}
              >
                E-post{getSortIcon('email')}
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('phone')}
              >
                Telefon{getSortIcon('phone')}
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('memberType')}
              >
                Typ{getSortIcon('memberType')}
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('membershipStatus')}
              >
                Status{getSortIcon('membershipStatus')}
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('paymentStatus')}
              >
                Betalning{getSortIcon('paymentStatus')}
              </TableHead>
              <TableHead>Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMembers && sortedMembers.length > 0 ? (
              sortedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-mono text-sm">
                    {member.membershipNumber || "-"}
                  </TableCell>
                  <TableCell className="font-medium">{member.name || "-"}</TableCell>
                  <TableCell>{member.email || "-"}</TableCell>
                  <TableCell>{member.phone || "-"}</TableCell>
                  <TableCell className="capitalize">{member.memberType || "-"}</TableCell>
                  <TableCell>{getStatusBadge(member.membershipStatus || "pending")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPaymentBadge(member.paymentStatus || "unpaid")}
                      {member.paymentStatus === 'unpaid' && member.email && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendPaymentReminder(member.id, member.email || '')}
                          disabled={sendPaymentReminderMutation.isPending}
                          title="Skicka betalningspåminnelse"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMember(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  Inga medlemmar hittades
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Redigera medlem</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Namn</Label>
                  <Input
                    id="name"
                    value={selectedMember.name || ""}
                    onChange={(e) =>
                      setSelectedMember({ ...selectedMember, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    id="email"
                    type="email"
                    value={selectedMember.email || ""}
                    onChange={(e) =>
                      setSelectedMember({ ...selectedMember, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={selectedMember.phone || ""}
                    onChange={(e) =>
                      setSelectedMember({ ...selectedMember, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="personnummer">Personnummer</Label>
                  <Input
                    id="personnummer"
                    value={selectedMember.personnummer || ""}
                    onChange={(e) =>
                      setSelectedMember({ ...selectedMember, personnummer: e.target.value })
                    }
                    placeholder="YYYYMMDD-XXXX"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="streetAddress">Gatuadress</Label>
                <Input
                  id="streetAddress"
                  value={selectedMember.streetAddress || ""}
                  onChange={(e) =>
                    setSelectedMember({ ...selectedMember, streetAddress: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Postnummer</Label>
                  <Input
                    id="postalCode"
                    value={selectedMember.postalCode || ""}
                    onChange={(e) =>
                      setSelectedMember({ ...selectedMember, postalCode: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="city">Stad</Label>
                  <Input
                    id="city"
                    value={selectedMember.city || ""}
                    onChange={(e) =>
                      setSelectedMember({ ...selectedMember, city: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="membershipNumber">Medlemsnummer</Label>
                  <div className="flex gap-2">
                    <Input
                      id="membershipNumber"
                      value={selectedMember.membershipNumber || ""}
                      onChange={(e) =>
                        setSelectedMember({
                          ...selectedMember,
                          membershipNumber: e.target.value,
                        })
                      }
                      placeholder="SSK-YYYY-XXXX"
                    />
                    <Button
                      variant="outline"
                      onClick={() => generateMemberNumberMutation.mutate()}
                      disabled={generateMemberNumberMutation.isPending}
                    >
                      Generera
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="joinYear">Inträdesår</Label>
                  <Input
                    id="joinYear"
                    type="number"
                    value={selectedMember.joinYear || ""}
                    onChange={(e) =>
                      setSelectedMember({
                        ...selectedMember,
                        joinYear: parseInt(e.target.value) || null,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="memberType">Medlemstyp</Label>
                  <Select
                    value={selectedMember.memberType || "ordinarie"}
                    onValueChange={(value) =>
                      setSelectedMember({ ...selectedMember, memberType: value })
                    }
                  >
                    <SelectTrigger id="memberType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ordinarie">Ordinarie</SelectItem>
                      <SelectItem value="hedersmedlem">Hedersmedlem</SelectItem>
                      <SelectItem value="stodmedlem">Stödmedlem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="membershipStatus">Medlemsstatus</Label>
                  <Select
                    value={selectedMember.membershipStatus || "pending"}
                    onValueChange={(value) =>
                      setSelectedMember({ ...selectedMember, membershipStatus: value })
                    }
                  >
                    <SelectTrigger id="membershipStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktiv</SelectItem>
                      <SelectItem value="pending">Väntande</SelectItem>
                      <SelectItem value="inactive">Inaktiv</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentStatus">Betalningsstatus</Label>
                  <Select
                    value={selectedMember.paymentStatus || "unpaid"}
                    onValueChange={(value) =>
                      setSelectedMember({ ...selectedMember, paymentStatus: value })
                    }
                  >
                    <SelectTrigger id="paymentStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Betald</SelectItem>
                      <SelectItem value="unpaid">Obetald</SelectItem>
                      <SelectItem value="exempt">Befriad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentYear">Betalningsår</Label>
                  <Input
                    id="paymentYear"
                    type="number"
                    value={selectedMember.paymentYear || ""}
                    onChange={(e) =>
                      setSelectedMember({
                        ...selectedMember,
                        paymentYear: parseInt(e.target.value) || null,
                      })
                    }
                  />
                </div>
              </div>

              {/* Password Management Section */}
              <div className="border-t pt-4 mt-4">
                <Label className="text-base font-semibold">Lösenordshantering</Label>
                <div className="mt-2 space-y-2">
                  {selectedMember.password ? (
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label>Lösenord</Label>
                        <Input value="*******" disabled className="bg-muted" />
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleResetPassword}
                        disabled={resetPasswordMutation.isPending}
                        className="mt-6"
                      >
                        {resetPasswordMutation.isPending ? "Återställer..." : "Återställ lösenord"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label>Lösenord</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Användaren har inget lösenord ännu
                        </p>
                      </div>
                      <Button
                        variant="default"
                        onClick={handleCreatePassword}
                        disabled={setPasswordMutation.isPending}
                        className="mt-6"
                      >
                        {setPasswordMutation.isPending ? "Skapar..." : "Skapa lösenord"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button onClick={handleSaveMember} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Sparar..." : "Spara"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
