import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { MapView } from "@/components/Map";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Meddelande skickat!", {
        description: "Vi återkommer till dig så snart som möjligt.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    },
    onError: (error: any) => {
      toast.error("Kunde inte skicka meddelande", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Fyll i alla obligatoriska fält");
      return;
    }

    submitMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Organization address - Södertälje Sportklubb arena
  const organizationAddress = "Scaniarinken, Turingegatan 1, 151 38 Södertälje";
  const coordinates = { lat: 59.1953, lng: 17.6256 }; // Scaniarinken coordinates

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Kontakta Oss"
        subtitle="Har du frågor eller vill komma i kontakt med oss? Fyll i formuläret nedan."
        icon={<Mail className="h-10 w-10" />}
        breadcrumbs={[
          { label: 'Kontakta Oss' }
        ]}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-6 w-6" />
                Skicka meddelande
              </CardTitle>
              <CardDescription>
                Fyll i formuläret så återkommer vi till dig så snart som möjligt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Namn *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ditt namn"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-post *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="din.epost@exempel.se"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Ämne</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Vad gäller ditt meddelande?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Meddelande *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Skriv ditt meddelande här..."
                    rows={6}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Skickar..." : "Skicka meddelande"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kontaktinformation</CardTitle>
                <CardDescription>
                  Här hittar du våra kontaktuppgifter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-[oklch(0.25_0.08_250)] mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Telefon</h3>
                    <p className="text-sm text-gray-600">Ordförande: 070-5661792</p>
                    <p className="text-sm text-gray-600">Kassör: 070-6008399</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[oklch(0.25_0.08_250)] mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">E-post</h3>
                    <p className="text-sm text-gray-600">info@gamlassk.se</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[oklch(0.25_0.08_250)] mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Adress</h3>
                    <p className="text-sm text-gray-600">{organizationAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Hitta hit</CardTitle>
                <CardDescription>
                  Vi finns på Scaniarinken i Södertälje
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] w-full">
                  <MapView
                    initialCenter={coordinates}
                    initialZoom={15}
                    onMapReady={(map) => {
                      // Add marker for organization location
                      new google.maps.marker.AdvancedMarkerElement({
                        map: map,
                        position: coordinates,
                        title: "Föreningen Gamla SSK-are",
                      });
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
