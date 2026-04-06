import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Phone, MapPin, Calendar } from "lucide-react";

export default function MemberList() {
  const { data: membersData } = trpc.userManagement.list.useQuery();

  const activeMembers = membersData?.filter(m => m.membershipStatus === "active") || [];
  const pendingMembers = membersData?.filter(m => m.membershipStatus === "pending") || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Medlemsregister</h2>
        <p className="text-gray-600">
          {activeMembers.length} aktiva medlemmar, {pendingMembers.length} väntande
        </p>
      </div>

      {/* Active Members */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Aktiva medlemmar</h3>
        <div className="grid gap-4">
          {activeMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-green-600" />
                    <div>
                      <CardTitle>{member.name || "Okänd"}</CardTitle>
                      {member.membershipNumber && (
                        <p className="text-sm text-gray-600">
                          Medlemsnummer: {member.membershipNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Aktiv
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {member.email && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${member.email}`} className="hover:underline">
                        {member.email}
                      </a>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${member.phone}`} className="hover:underline">
                        {member.phone}
                      </a>
                    </div>
                  )}
                  {(member.streetAddress || member.city) && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4" />
                      {[member.streetAddress, member.postalCode, member.city].filter(Boolean).join(', ')}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    Medlem sedan: {new Date(member.createdAt).toLocaleDateString("sv-SE")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pending Members */}
      {pendingMembers.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Väntande medlemmar</h3>
          <div className="grid gap-4">
            {pendingMembers.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-yellow-600" />
                      <div>
                        <CardTitle>{member.name || "Okänd"}</CardTitle>
                      </div>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Väntande
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {member.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${member.email}`} className="hover:underline">
                          {member.email}
                        </a>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${member.phone}`} className="hover:underline">
                          {member.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4" />
                      Registrerad: {new Date(member.createdAt).toLocaleDateString("sv-SE")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
