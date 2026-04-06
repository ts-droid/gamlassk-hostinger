import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ChangePassword() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== newPassword2) {
      toast.error("De nya lösenorden matchar inte");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Nytt lösenord måste vara minst 8 tecken");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Lösenordsbyte misslyckades");
      } else {
        toast.success("Lösenordet har ändrats!");
        setCurrentPassword("");
        setNewPassword("");
        setNewPassword2("");
        setLocation("/profile");
      }
    } catch {
      toast.error("Nätverksfel – försök igen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/profile">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Tillbaka till profil
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Byt lösenord</CardTitle>
            <CardDescription>
              Inloggad som: <strong>{user?.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Nuvarande lösenord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nytt lösenord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Minst 8 tecken"
                    className="pl-9"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password2">Bekräfta nytt lösenord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="new-password2"
                    type="password"
                    placeholder="Upprepa nytt lösenord"
                    className="pl-9"
                    value={newPassword2}
                    onChange={e => setNewPassword2(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sparar...</>
                ) : "Byt lösenord"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
