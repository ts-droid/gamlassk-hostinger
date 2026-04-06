import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { Calendar, Users, Trophy, Mail, Phone, FileText, CreditCard } from "lucide-react";
import { useCMSContent, useSiteSettings, useBoardMembers, useSiteBranding } from "@/hooks/useCMSContent";
import { UnifiedLoginDialog } from "@/components/UnifiedLoginDialog";
import { BankIDErrorAlert } from "@/components/BankIDErrorAlert";
import { FolkspelSection } from "@/components/FolkspelSection";

// Upcoming Events Component
function UpcomingEventsSection() {
  const { data: allEvents, isLoading } = trpc.events.list.useQuery();
  const upcomingEvents = allEvents?.slice(0, 3) || [];

  if (isLoading || !upcomingEvents || upcomingEvents.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[oklch(0.25_0.08_250)]">
            Kommande evenemang
          </h2>
          <Link href="/calendar">
            <Button variant="outline">
              Se alla evenemang
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {event.eventTime ? new Date(event.eventTime).toLocaleDateString('sv-SE', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Datum ej angivet'}
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
  const { user } = useAuth();
  const { data: latestNews } = trpc.news.latest.useQuery();
  const { getContent, isLoading: contentLoading } = useCMSContent("home");
  const { getSetting, isLoading: settingsLoading } = useSiteSettings();
  const { siteLogo } = useSiteBranding();
  const { members, isLoading: membersLoading } = useBoardMembers();
  
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  
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
      {/* Header */}
      <header className="bg-[oklch(0.25_0.08_250)] text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={siteLogo}
                alt="Gamla SSK Logo" 
                className="h-20 w-20 md:h-24 md:w-24" 
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{getSetting("site_name", "Föreningen Gamla SSK-are")}</h1>
                <p className="text-sm opacity-90">Sveriges äldsta stödförening - Sedan 1937</p>
              </div>
            </div>
            <nav className="flex gap-2 md:gap-4">
              {user ? (
                <>
                  <Link href="/documents">
                    <Button variant="ghost" className="text-white hover:bg-white/10 hidden md:flex">
                      <FileText className="h-4 w-4 mr-2" />
                      Dokument
                    </Button>
                  </Link>
                  <Link href="/members">
                    <Button variant="ghost" className="text-white hover:bg-white/10 hidden md:flex">
                      <Users className="h-4 w-4 mr-2" />
                      Medlemmar
                    </Button>
                  </Link>
                  <Link href="/payment">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Betala medlemsavgift</span>
                      <span className="sm:hidden">Betala</span>
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="secondary">Min sida</Button>
                  </Link>
                </>
              ) : (
                <Button 
                  variant="secondary"
                  onClick={() => setLoginDialogOpen(true)}
                >
                  Logga in
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <BankIDErrorAlert />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#001f3f] via-[#003d73] to-[#0066a6] py-32 md:py-40">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
            {getContent("hero_title", "Välkommen till Föreningen Gamla SSK-are")}
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 animate-fade-in-up animation-delay-200">
            {getContent("hero_subtitle", "En förening för alla som varit med och byggt Södertälje SK genom åren")}
          </p>
          <div className="flex gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Button size="lg" className="bg-[oklch(0.85_0.12_90)] text-[oklch(0.25_0.08_250)] hover:bg-[oklch(0.80_0.12_90)]">
              <a href="#bli-medlem">Bli medlem</a>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              <a href="#om-oss">Läs mer</a>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="om-oss" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid md:grid-cols-3 gap-6">
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
                  className="w-full bg-[oklch(0.85_0.12_90)] text-[oklch(0.25_0.08_250)] hover:bg-[oklch(0.80_0.12_90)]"
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
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
      <footer className="bg-[oklch(0.25_0.08_250)] text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">© 2024 Föreningen Gamla SSK-are. Alla rättigheter förbehållna.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="hover:text-[oklch(0.85_0.12_90)]">
              Startsida
            </Link>
            <Link href="/statutes" className="hover:text-[oklch(0.85_0.12_90)]">
              Stadgar
            </Link>
            <Link href="/gallery" className="hover:text-[oklch(0.85_0.12_90)]">
              Bildgalleri
            </Link>
            <Link href="/events" className="hover:text-[oklch(0.85_0.12_90)]">
              Evenemang
            </Link>
            <a href="#" className="hover:text-[oklch(0.85_0.12_90)]">Kontakt</a>
          </div>
        </div>
      </footer>
      
      {/* Unified Login Dialog */}
      <UnifiedLoginDialog 
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen} 
      />
    </div>
  );
}
