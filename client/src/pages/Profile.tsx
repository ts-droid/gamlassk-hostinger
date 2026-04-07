import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/LogoutButton";
import { MemberVerificationBanner } from "@/components/MemberVerificationBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHero, SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    personnummer: "",
    streetAddress: "",
    postalCode: "",
    city: "",
  });

  const utils = trpc.useUtils();
  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Din profil har uppdaterats!");
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error("Kunde inte uppdatera profil: " + error.message);
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        personnummer: user.personnummer || "",
        streetAddress: user.streetAddress || "",
        postalCode: user.postalCode || "",
        city: user.city || "",
      });
    }
  }, [user]);

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Laddar...</div>;
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const getMembershipStatusBadge = () => {
    switch (user.membershipStatus) {
      case "active":
        return <Badge variant="default">Aktiv medlem</Badge>;
      case "pending":
        return <Badge variant="outline">Väntande</Badge>;
      case "inactive":
        return <Badge variant="destructive">Inaktiv</Badge>;
      default:
        return <Badge variant="outline">Ej medlem</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader currentPath="/profile" />
      <PageHero
        title="Min sida"
        description="Hantera din medlemsprofil, uppdatera dina uppgifter och följ din medlemsstatus."
      />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <MemberVerificationBanner />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Medlemsstatus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                {getMembershipStatusBadge()}
                {user.membershipNumber && (
                  <p className="text-sm text-gray-600 mt-2">
                    Medlemsnummer: {user.membershipNumber}
                  </p>
                )}
              </div>
              
              {/* Payment Status */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Medlemsavgift</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Betalningsstatus:</span>
                    <div>
                      {user.paymentStatus === 'paid' && (
                        <Badge variant="default">Betald</Badge>
                      )}
                      {user.paymentStatus === 'unpaid' && (
                        <Badge variant="destructive">Obetald</Badge>
                      )}
                      {user.paymentStatus === 'exempt' && (
                        <Badge variant="secondary">Befriad</Badge>
                      )}
                      {!user.paymentStatus && (
                        <Badge variant="outline">Ej angiven</Badge>
                      )}
                    </div>
                  </div>
                  {user.paymentYear && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Betalningsår:</span>
                      <span className="text-sm font-medium">{user.paymentYear}</span>
                    </div>
                  )}
                  {user.paymentStatus === 'unpaid' && (
                    <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800 mb-3">
                        <strong>OBS!</strong> Din medlemsavgift är obetald.
                      </p>
                      <div className="bg-white p-4 rounded-md border border-yellow-300">
                        <h4 className="font-semibold text-gray-900 mb-3 text-center">Betala med Swish</h4>
                        <div className="flex flex-col items-center gap-3">
                          <img 
                            src="/swish-qr.png" 
                            alt="Swish QR-kod för medlemsavgift" 
                            className="w-48 h-auto"
                          />
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Swish-nummer:</p>
                            <p className="text-xl font-bold text-gray-900">123-616 52 29</p>
                            <p className="text-xs text-gray-500 mt-2">Ange ditt medlemsnummer i meddelandet</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personlig information</CardTitle>
            <CardDescription>
              Uppdatera din kontaktinformation här
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Namn</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">E-postadress</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefonnummer</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+46 70 123 45 67"
                />
              </div>

              <div>
                <Label htmlFor="personnummer">Personnummer</Label>
                <Input
                  id="personnummer"
                  value={formData.personnummer}
                  onChange={(e) => setFormData({ ...formData, personnummer: e.target.value })}
                  placeholder="YYYYMMDD-XXXX"
                />
              </div>

              <div>
                <Label htmlFor="streetAddress">Gatuadress</Label>
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  placeholder="Exempelgatan 123"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Postnummer</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="123 45"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Stad</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Stockholm"
                  />
                </div>
              </div>

              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Sparar..." : "Spara ändringar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Kontoinställningar</CardTitle>
          </CardHeader>
          <CardContent>
            <LogoutButton />
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
