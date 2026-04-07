import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHero, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useCMSContent } from "@/hooks/useCMSContent";

function getResetToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get("token") ?? "";
}

export default function ResetPassword() {
  const { getContent } = useCMSContent("reset-password");
  const token = useMemo(() => getResetToken(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsComplete(true);
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte återställa lösenordet");
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      toast.error("Återställningslänken saknar token");
      return;
    }

    if (password.length < 8) {
      toast.error("Lösenordet måste vara minst 8 tecken");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Lösenorden matchar inte");
      return;
    }

    resetPasswordMutation.mutate({
      token,
      newPassword: password,
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <PageHero
        title={getContent("hero_title", "Återställ lösenord")}
        description={getContent("hero_description", "Välj ett nytt lösenord och slutför återställningen på ett tryggt sätt.")}
      />
      <main className="flex items-center justify-center p-6 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">{APP_TITLE}</CardTitle>
            <CardDescription>
              {isComplete
                ? getContent("complete_description", "Ditt lösenord har uppdaterats.")
                : getContent("form_description", "Ange ditt nya lösenord för att slutföra återställningen.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isComplete ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {getContent("success_helper_text", "Du kan nu logga in med ditt nya lösenord.")}
                </p>
                <Button asChild className="w-full">
                  <Link href="/login">{getContent("login_button_label", "Till inloggningen")}</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{getContent("new_password_label", "Nytt lösenord")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    disabled={resetPasswordMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{getContent("confirm_password_label", "Bekräfta lösenord")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    disabled={resetPasswordMutation.isPending}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={resetPasswordMutation.isPending || !token}
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {getContent("saving_label", "Sparar...")}
                    </>
                  ) : (
                    getContent("submit_button_label", "Spara nytt lösenord")
                  )}
                </Button>

                {!token && (
                  <p className="text-sm text-destructive">
                    {getContent("invalid_token_text", "Den här länken är ogiltig. Begär en ny återställningslänk från inloggningssidan.")}
                  </p>
                )}

                <div className="text-center text-xs text-muted-foreground">
                  <Link href="/login" className="underline hover:text-foreground">
                    {getContent("back_link_label", "Tillbaka till inloggningen")}
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
