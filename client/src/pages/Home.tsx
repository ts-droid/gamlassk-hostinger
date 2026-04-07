import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { Calendar, Users, Trophy, Mail, Phone } from "lucide-react";
import { useCMSContent, useBoardMembers } from "@/hooks/useCMSContent";
import { BankIDErrorAlert } from "@/components/BankIDErrorAlert";
import { FolkspelSection } from "@/components/FolkspelSection";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

// Upcoming Events Component
function UpcomingEventsSection() {
  const { data: allEvents, isLoading } = trpc.events.list.useQuery();
  const upcomingEvents = allEvents?.slice(0, 3) || [];

  const formatEventDate = (eventDate: Date | string, eventTime?: string | null) => {
    const date = new Date(eventDate);

    if (Number.isNaN(date.getTime())) {
      return "Datum ej angivet";
    }

    if (eventTime) {
      const [hours, minutes] = eventTime.split(":").map(Number);
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        date.setHours(hours, minutes, 0, 0);
      }
    }

    return date.toLocaleDateString("sv-SE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      ...(eventTime
        ? {
            hour: "2-digit" as const,
            minute: "2-digit" as const,
          }
        : {}),
    });
  };

  if (isLoading || !upcomingEvents || upcomingEvents.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-bold text-[oklch(0.25_0.08_250)]">
            Kommande evenemang
          </h2>
          <Link href="/calendar">
            <Button variant="outline" className="w-full sm:w-auto">
              Se alla evenemang
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatEventDate(event.eventDate, event.eventTime)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {event.description}
                </p>
                {event.location && (
                  <p className="text-sm text-gray-500 mb-4">
                    📍 {event.location}
                  </p>
                )}
                <Link href="/calendar">
                  <Button className="w-full" size="sm">
                    Läs mer & anmäl dig
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { data: latestNews } = trpc.news.latest.useQuery();
  const { getContent } = useCMSContent("home");
  const { members, isLoading: membersLoading } = useBoardMembers();
  
  const [membershipForm, setMembershipForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const utils = trpc.useUtils();
  const submitMembership = trpc.membership.submit.useMutation({
    onSuccess: () => {
      toast.success("Tack för din ansökan! Vi återkommer snart.");
      setMembershipForm({ name: "", email: "", phone: "", message: "" });
    },
    onError: (error) => {
      toast.error("Kunde inte skicka ansökan: " + error.message);
    },
  });

  const handleMembershipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMembership.mutate(membershipForm);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader currentPath="/" />

      <BankIDErrorAlert />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#001f3f] via-[#003d73] to-[#0066a6] py-20 sm:py-28 md:py-40">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold text-white animate-fade-in-up sm:text-5xl md:text-6xl">
            {getContent("hero_title", "Välkommen till Föreningen Gamla SSK-are")}
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-white/90 animate-fade-in-up animation-delay-200 sm:text-xl">
            {getContent("hero_subtitle", "En förening för alla som varit med och byggt Södertälje SK genom åren")}
          </p>
          <div className="flex flex-col justify-center gap-4 animate-fade-in-up animation-delay-400 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto">
              <a href="#bli-medlem">Bli medlem</a>
            </Button>
            <Button size="lg" variant="outline" className="w-full border-white/60 sm:w-auto">
              <a href="#om-oss">Läs mer</a>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="om-oss" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
            <div>
              <h2 className="text-3xl font-bold text-[oklch(0.25_0.08_250)] mb-6">
                {getContent("about_title", "Om Föreningen Gamla SSK-are")}
              </h2>
              <div 
                className="space-y-4 text-gray-700 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: getContent("about_content", "<p>Föreningen Gamla SSK-are bildades den 25 augusti 1937 (1936 beslutades att starta en förening, men den bildades först året därpå). Dess förste ordförande var Carl Abrahamsson, 'Calle Aber' kallad, och som gett namnet till SSK:s restaurang fr.o.m. hösten 2021.</p><p>Föreningen, som för närvarande har drygt 300 medlemmar (bl.a. Anders Eldebrink, Mats Hallin, Kjell Svensson och Björn Borg….), är en stödförening till moderklubben SSK.</p><p>Pengarna till moderföreningen kommer främst från medlemmarnas ideella arbete med bingo. Vi säljer bingolotter och sverigelotter på ICA Maxi Vasa och Moraberg samt Stora Coop Vasa.</p>") 
                }}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-[oklch(0.85_0.12_90)] mb-2" />
                  <CardTitle>1937</CardTitle>
                  <CardDescription>Grundades</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-[oklch(0.85_0.12_90)] mb-2" />
                  <CardTitle>300+</CardTitle>
                  <CardDescription>Medlemmar</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Trophy className="h-8 w-8 text-[oklch(0.85_0.12_90)] mb-2" />
                  <CardTitle>1M+ SEK</CardTitle>
                  <CardDescription>Årligt bidrag</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <img src="/logo.gif" alt="SSK" className="h-12 w-12 mb-2" />
                  <CardTitle>SSK</CardTitle>
                  <CardDescription>Stödförening</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <UpcomingEventsSection />

      {/* News Section */}
      {latestNews && latestNews.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-[oklch(0.25_0.08_250)] mb-8 text-center">
              Senaste nyheterna
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {latestNews.map((news) => (
                <Card key={news.id}>
                  {news.imageUrl && (
                    <img 
                      src={news.imageUrl} 
                      alt={news.title} 
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <CardHeader>
                    <CardTitle>{news.title}</CardTitle>
                    <CardDescription>
                      {news.publishedAt && new Date(news.publishedAt).toLocaleDateString("sv-SE")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="text-sm text-gray-600 line-clamp-3 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: news.content }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <FolkspelSection />

      {/* Membership Form */}
      <section id="bli-medlem" className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold text-[oklch(0.25_0.08_250)] mb-4 text-center">
            {getContent('membership_form_title', 'Ansök om att bli medlem')}
          </h2>
          <p className="text-center text-gray-600 mb-8">
            {getContent('membership_form_description', 'Medlemsavgift: 150 kr/år. Namnet "Gamla SSK-are" betyder inte att man måste vara åldersmässigt gammal, utan att man varit SSK-supporter en längre tid.')}
          </p>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleMembershipSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Namn *</Label>
                  <Input
                    id="name"
                    required
                    value={membershipForm.name}
                    onChange={(e) => setMembershipForm({ ...membershipForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-postadress *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={membershipForm.email}
                    onChange={(e) => setMembershipForm({ ...membershipForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefonnummer</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={membershipForm.phone}
                    onChange={(e) => setMembershipForm({ ...membershipForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Meddelande (valfritt)</Label>
                  <Textarea
                    id="message"
                    rows={4}
                    value={membershipForm.message}
                    onChange={(e) => setMembershipForm({ ...membershipForm, message: e.target.value })}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={submitMembership.isPending}
                >
                  {submitMembership.isPending ? "Skickar..." : "Skicka ansökan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[oklch(0.25_0.08_250)] mb-8 text-center">
            {getContent("contact_title", "Kontakta styrelsen")}
          </h2>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {membersLoading ? (
              <p className="text-center col-span-3">Laddar styrelsemedlemmar...</p>
            ) : members.length > 0 ? (
              members.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    {member.photo && (
                      <img 
                        src={member.photo} 
                        alt={member.name} 
                        className="h-24 w-24 rounded-full object-cover mx-auto mb-2"
                      />
                    )}
                    <CardTitle>{member.role}</CardTitle>
                    <CardDescription>{member.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4" />
                        <span>{member.email}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback to hardcoded data if no members in database
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Ordförande</CardTitle>
                    <CardDescription>Göran Söderberg</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>070-5661792</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Sekreterare</CardTitle>
                    <CardDescription>Tomas Axelsson</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>070-5129143</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Kassör</CardTitle>
                    <CardDescription>Annicka Hellströmer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>070-6008399</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
