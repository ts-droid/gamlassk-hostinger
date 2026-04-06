import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PaymentVerification() {
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifyAction, setVerifyAction] = useState<'verified' | 'rejected'>('verified');

  const { data: payments, isLoading, refetch } = trpc.payments.listAll.useQuery();

  const verifyMutation = trpc.payments.verify.useMutation({
    onSuccess: () => {
      toast.success(verifyAction === 'verified' ? 'Betalning godkänd!' : 'Betalning nekad');
      refetch();
      setVerifyDialogOpen(false);
      setSelectedPayment(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Kunde inte verifiera betalning');
    },
  });

  const handleVerify = (id: number, action: 'verified' | 'rejected') => {
    setSelectedPayment(id);
    setVerifyAction(action);
    setVerifyDialogOpen(true);
  };

  const confirmVerify = () => {
    if (selectedPayment) {
      verifyMutation.mutate({
        id: selectedPayment,
        status: verifyAction,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" />Godkänd</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Väntar</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Nekad</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Betalningsverifiering</CardTitle>
          <CardDescription>Laddar betalningar...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingPayments = payments?.filter(p => p.status === 'pending') || [];
  const processedPayments = payments?.filter(p => p.status !== 'pending') || [];

  return (
    <>
      <div className="space-y-6">
        {/* Pending Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Väntande betalningar ({pendingPayments.length})
            </CardTitle>
            <CardDescription>
              Betalningar som väntar på verifiering
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingPayments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Inga väntande betalningar</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medlem</TableHead>
                    <TableHead>E-post</TableHead>
                    <TableHead>Belopp</TableHead>
                    <TableHead>År</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Kvitto</TableHead>
                    <TableHead>Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.userName || 'Okänd'}</TableCell>
                      <TableCell>{payment.userEmail || '-'}</TableCell>
                      <TableCell>{payment.amount} kr</TableCell>
                      <TableCell>{payment.paymentYear}</TableCell>
                      <TableCell>
                        {new Date(payment.createdAt).toLocaleDateString('sv-SE')}
                      </TableCell>
                      <TableCell>
                        {payment.receiptUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4 mr-1" />
                              Visa
                            </a>
                          </Button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleVerify(payment.id, 'verified')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Godkänn
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleVerify(payment.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Neka
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Processed Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Behandlade betalningar ({processedPayments.length})</CardTitle>
            <CardDescription>
              Historik över verifierade och nekade betalningar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processedPayments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Inga behandlade betalningar</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medlem</TableHead>
                    <TableHead>Belopp</TableHead>
                    <TableHead>År</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verifierad</TableHead>
                    <TableHead>Kvitto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.userName || 'Okänd'}</TableCell>
                      <TableCell>{payment.amount} kr</TableCell>
                      <TableCell>{payment.paymentYear}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        {payment.verifiedAt
                          ? new Date(payment.verifiedAt).toLocaleDateString('sv-SE')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {payment.receiptUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verify Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verifyAction === 'verified' ? 'Godkänn betalning' : 'Neka betalning'}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === 'verified'
                ? 'Är du säker på att du vill godkänna denna betalning? Medlemmens betalningsstatus kommer att uppdateras.'
                : 'Är du säker på att du vill neka denna betalning? Medlemmen kommer att behöva skicka in en ny bekräftelse.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
              Avbryt
            </Button>
            <Button
              variant={verifyAction === 'verified' ? 'default' : 'destructive'}
              onClick={confirmVerify}
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? 'Behandlar...' : 'Bekräfta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
