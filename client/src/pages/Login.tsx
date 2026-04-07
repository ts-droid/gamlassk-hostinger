import { UnifiedLoginDialog } from "@/components/UnifiedLoginDialog";
import { APP_TITLE } from "@/const";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Link, Redirect } from "wouter";
import { PageHero, SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function Login() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [open, setOpen] = useState(true);

  const redirectTarget =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("redirect") || "/profile"
      : "/profile";

  useEffect(() => {
    setOpen(true);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Laddar...</div>;
  }

  if (isAuthenticated) {
    return <Redirect to={user?.role === "admin" ? "/admin" : redirectTarget} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <SiteHeader currentPath="/login" />
      <PageHero
        title="Logga in"
        description="Använd din e-postadress och ditt lösenord för att komma vidare."
      />
      <main className="flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold tracking-tight">{APP_TITLE}</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Logga in för att fortsätta.
          </p>

          <div className="mt-6 flex items-center justify-center">
            <UnifiedLoginDialog open={open} onOpenChange={setOpen} />
          </div>

          <div className="mt-6 text-xs text-muted-foreground">
            <Link href="/" className="underline hover:text-foreground">
              Tillbaka till startsidan
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
