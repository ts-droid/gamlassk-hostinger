import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Mail, Phone, Shield } from "lucide-react";

export default function UserManagement() {
  const { data: usersData, refetch } = trpc.userManagement.list.useQuery();
  const { data: rolesData } = trpc.roles.list.useQuery();

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Användarhantering</h2>
        <p className="text-gray-600">Tilldela roller till användare</p>
      </div>

      <div className="grid gap-4">
        {usersData?.map((user) => (
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
      </div>
    </div>
  );
}
