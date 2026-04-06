import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Upload, CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { useSiteBranding } from "@/hooks/useCMSContent";

export default function Payment() {
  const { siteLogo, siteName } = useSiteBranding();
  const { user, isAuthenticated, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: swishNumber } = trpc.payments.getSwishNumber.useQuery();
  const { data: myPayments, refetch } = trpc.payments.myPayments.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const submitMutation = trpc.payments.submitConfirmation.useMutation({
    onSuccess: () => {
      toast.success('Betalningsbekräftelse skickad!');
      refetch();
      setSubmitting(false);
      // Reset form
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (error) => {
      toast.error(error.message || 'Kunde inte skicka bekräftelse');
      setSubmitting(false);
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = fileInputRef.current?.files?.[0];

    setSubmitting(true);

    let receiptBase64: string | undefined;

    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Filen är för stor (max 5MB)');
        setSubmitting(false);
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      await new Promise<void>((resolve, reject) => {
        reader.onload = () => {
          receiptBase64 = reader.result?.toString().split(',')[1];
          resolve();
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    submitMutation.mutate({
      amount: formData.get('amount') as string,
      paymentYear: parseInt(formData.get('paymentYear') as string),
      receiptBase64,
      notes: formData.get('notes') as string || undefined,
    });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Logga in krävs</CardTitle>
            <CardDescription>
              Du måste vara inloggad för att betala medlemsavgift
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Logga in</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container">
          <div className="mb-4 flex items-center gap-4">
            <img src={siteLogo} alt={siteName} className="h-16 w-16 rounded-md object-cover" />
            <div>
              <h1 className="text-4xl font-bold">Betala medlemsavgift</h1>
              <p className="text-sm text-blue-100">{siteName}</p>
            </div>
          </div>
          <p className="text-xl text-blue-100">
            Betala enkelt med Swish och ladda upp kvitto för verifiering
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Payment Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-6 w-6" />
                Betala med Swish
              </CardTitle>
              <CardDescription>
                Följ instruktionerna nedan för att betala medlemsavgiften
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Swish-nummer</p>
                <p className="text-3xl font-bold text-blue-900">{swishNumber}</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Öppna Swish-appen</h3>
                    <p className="text-sm text-gray-600">
                      Starta Swish-appen på din mobil
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Betala till nummer</h3>
                    <p className="text-sm text-gray-600">
                      Ange Swish-numret ovan och belopp <strong>150 kr</strong>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Spara kvitto</h3>
                    <p className="text-sm text-gray-600">
                      Ta en skärmdump av betalningsbekräftelsen
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Ladda upp kvitto</h3>
                    <p className="text-sm text-gray-600">
                      Använd formuläret till höger för att ladda upp kvittot
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>OBS!</strong> Din betalning kommer att verifieras av en administratör innan den godkänns.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upload Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ladda upp betalningsbekräftelse</CardTitle>
                <CardDescription>
                  Fyll i uppgifterna och ladda upp kvitto från Swish
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Belopp (kr) *</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      required
                      disabled={submitting}
                      defaultValue="150"
                      min="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentYear">Betalningsår *</Label>
                    <Input
                      id="paymentYear"
                      name="paymentYear"
                      type="number"
                      required
                      disabled={submitting}
                      defaultValue={currentYear}
                      min="2020"
                      max={currentYear + 1}
                    />
                  </div>

                  <div>
                    <Label htmlFor="receipt">Kvitto (valfritt)</Label>
                    <Input
                      id="receipt"
                      name="receipt"
                      type="file"
                      accept="image/*,.pdf"
                      ref={fileInputRef}
                      disabled={submitting}
                    />
                    <p className="text-sm text-gray-500 mt-1">Max 5MB (bild eller PDF)</p>
                  </div>

                  <div>
                    <Label htmlFor="notes">Anteckningar (valfritt)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      disabled={submitting}
                      placeholder="T.ex. referensnummer från Swish"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Skickar...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Skicka bekräftelse
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Payment History */}
            {myPayments && myPayments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Mina betalningar</CardTitle>
                  <CardDescription>
                    Historik över dina inskickade betalningsbekräftelser
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{payment.amount} kr</span>
                            <span className="text-sm text-gray-500">({payment.paymentYear})</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString('sv-SE')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {payment.receiptUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
