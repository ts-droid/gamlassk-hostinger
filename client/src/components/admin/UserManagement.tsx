import { trpc } from "@/lib/trpc";
import { useDeferredValue, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Users, Mail, Phone, Shield } from "lucide-react";

export default function UserManagement() {
  const { data: usersData, refetch } = trpc.userManagement.list.useQuery();
  const { data: rolesData } = trpc.roles.list.useQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const assignRoleMutation = trpc.userManagement.assignRole.useMutation({
    onSuccess: () => {
      toast.success("Roll tilldelad!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte tilldela roll");
    },
  });

  const handleAssignRole = (userId: number, roleId: string) => {
    if (!roleId || roleId === "none") return;
    assignRoleMutation.mutate({
      userId,
      roleId: parseInt(roleId),
    });
  };

  const normalizedSearch = deferredSearchTerm.trim().toLowerCase();
  const users = usersData || [];
  const usersWithRoles = users.filter((user) => Boolean(user.roleId));
  const searchableUsers = users.filter((user) => {
    if (!normalizedSearch) return false;

    const haystack = [
      user.name,
      user.email,
      user.phone,
      user.membershipNumber,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  const visibleUsers = normalizedSearch
    ? searchableUsers
    : showAll
      ? users
      : usersWithRoles;

  const hiddenCount = Math.max(users.length - usersWithRoles.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Användarhantering</h2>
        <p className="text-gray-600">Tilldela roller till användare</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                Sök fram medlemmen du vill ge en roll
              </p>
              <p className="text-sm text-gray-600">
                Som standard visas bara användare som redan har en roll. Sök på namn, e-post,
                telefon eller medlemsnummer för att visa övriga medlemmar.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 lg:max-w-xl lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Sök medlem..."
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                {searchTerm ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSearchTerm("")}
                  >
                    Rensa sökning
                  </Button>
                ) : null}
                {!showAll && hiddenCount > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAll(true)}
                  >
                    Visa alla ({users.length})
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
            <span>Visar: {visibleUsers.length}</span>
            {!normalizedSearch && !showAll && hiddenCount > 0 ? (
              <span>Dolda utan sökning: {hiddenCount}</span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {visibleUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle>{user.name || "Okänd användare"}</CardTitle>
                    <div className="flex flex-col gap-1 mt-2 text-sm text-gray-600">
                      {user.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <Select
                    value={user.roleId?.toString() || "none"}
                    onValueChange={(value) => handleAssignRole(user.id, value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Välj roll" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ingen roll</SelectItem>
                      {rolesData?.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.membershipStatus === "active" ? "bg-green-100 text-green-800" :
                    user.membershipStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {user.membershipStatus === "active" ? "Aktiv" :
                     user.membershipStatus === "pending" ? "Väntande" :
                     "Inaktiv"}
                  </span>
                </div>
                {user.membershipNumber && (
                  <div>
                    <span className="font-medium">Medlemsnummer:</span> {user.membershipNumber}
                  </div>
                )}
                <div>
                  <span className="font-medium">Registrerad:</span>{" "}
                  {new Date(user.createdAt).toLocaleDateString("sv-SE")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {visibleUsers.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-gray-600">
              {normalizedSearch
                ? "Ingen medlem matchade din sökning."
                : "Inga användare med roll visas just nu. Sök fram en medlem för att tilldela en roll."}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
