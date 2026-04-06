import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, Phone, User } from "lucide-react";
import { Redirect } from "wouter";
import { useSiteBranding } from "@/hooks/useCMSContent";

export default function MemberDirectory() {
  const { siteLogo, siteName } = useSiteBranding();
  const { user, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");

  const { data: members, isLoading } = trpc.members.directory.useQuery();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  const filteredMembers = members?.filter((member) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      member.name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.membershipNumber?.toLowerCase().includes(searchLower)
    );
  });

  const getMemberTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ordinarie: "Ordinarie",
      hedersmedlem: "Hedersmedlem",
      stodmedlem: "Stödmedlem",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <img src={siteLogo} alt={siteName} className="h-16 w-16 rounded-md object-cover" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Medlemskatalog</h1>
              <p className="mt-2 text-gray-600">
                Kontaktuppgifter till våra medlemmar
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6 max-w-md">
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

        {/* Members Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredMembers && filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{member.name || "Okänd"}</CardTitle>
                        {member.membershipNumber && (
                          <p className="text-sm text-gray-500 font-mono">
                            {member.membershipNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    {member.memberType && (
                      <Badge variant="secondary" className="capitalize">
                        {getMemberTypeLabel(member.memberType)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {member.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a
                        href={`mailto:${member.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {member.email}
                      </a>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a
                        href={`tel:${member.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {member.phone}
                      </a>
                    </div>
                  )}
                  {member.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => window.location.href = `mailto:${member.email}`}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Skicka e-post
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Inga medlemmar hittades</p>
            {search && (
              <p className="text-gray-500 text-sm mt-2">
                Prova att söka med andra sökord
              </p>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 max-w-2xl mx-auto">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-700">
                <strong>Observera:</strong> Endast medlemmar som har valt att vara synliga i
                katalogen visas här. Om du vill ändra dina inställningar, gå till din profil
                under "Min sida".
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
