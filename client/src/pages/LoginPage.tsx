import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Loader2, Lock, Mail, User } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPassword2, setRegPassword2] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Inloggning misslyckades");
      } else {
        await utils.auth.me.invalidate();
        toast.success("Välkommen!");
        setLocation("/");
      }
    } catch {
      toast.error("Nätverksfel – försök igen");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (regPassword !== regPassword2) {
      toast.error("Lösenorden matchar inte");
      return;
    }
    setRegLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, password: regPassword, name: regName }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registrering misslyckades");
      } else {
        await utils.auth.me.invalidate();
        toast.success("Konto skapat! Välkommen!");
        setLocation("/");
      }
    } catch {
      toast.error("Nätverksfel – försök igen");
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.25_0.08_250)] to-[oklch(0.35_0.12_250)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <img
            src={APP_LOGO}
            alt={APP_TITLE}
            className="h-20 w-20 mx-auto mb-4 rounded-full shadow-lg"
          />
          <h1 className="text-2xl font-bold text-white">{APP_TITLE}</h1>
          <p className="text-white/70 text-sm mt-1">Sveriges äldsta stödförening – Sedan 1937</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Logga in</TabsTrigger>
            <TabsTrigger value="register">Skapa konto</TabsTrigger>
          </TabsList>

          {/* LOGIN TAB */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Logga in</CardTitle>
                <CardDescription>Ange din e-post och ditt lösenord</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-post</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="din@epost.se"
                        className="pl-9"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Lösenord</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loginLoading}>
                    {loginLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loggar in...</>
                    ) : "Logga in"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REGISTER TAB */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Skapa konto</CardTitle>
                <CardDescription>Registrera dig för att komma åt föreningens sidor</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Namn</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="Förnamn Efternamn"
                        className="pl-9"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        required
                        autoComplete="name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">E-post</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="din@epost.se"
                        className="pl-9"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Lösenord</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Minst 8 tecken"
                        className="pl-9"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password2">Bekräfta lösenord</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-password2"
                        type="password"
                        placeholder="Upprepa lösenordet"
                        className="pl-9"
                        value={regPassword2}
                        onChange={e => setRegPassword2(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={regLoading}>
                    {regLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Skapar konto...</>
                    ) : "Skapa konto"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-center text-white/50 text-xs mt-6">
          Föreningen Gamla SSK-are · Södertälje
        </p>
      </div>
    </div>
  );
}
