import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useSiteBranding } from "@/hooks/useCMSContent";
import { cn } from "@/lib/utils";
import { CreditCard, FileText, GalleryVerticalEnd, Home, LayoutDashboard, LogIn, Newspaper, UserRound } from "lucide-react";
import { Link } from "wouter";

const primaryClass = "bg-[oklch(0.25_0.08_250)]";
const accentTextClass = "text-[oklch(0.85_0.12_90)]";

const publicNavItems = [
  { href: "/", label: "Startsida", icon: Home },
  { href: "/statutes", label: "Stadgar", icon: FileText },
  { href: "/documents", label: "Dokument", icon: FileText },
  { href: "/calendar", label: "Kalender", icon: Newspaper },
  { href: "/gallery", label: "Galleri", icon: GalleryVerticalEnd },
  { href: "/folkspel", label: "Folkspel", icon: CreditCard },
] as const;

function isActivePath(currentPath: string | undefined, href: string) {
  if (!currentPath) return false;
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function SiteHeader({ currentPath }: { currentPath?: string }) {
  const { siteLogo, siteName } = useSiteBranding();
  const { isAdmin, isAuthenticated } = useAuth();

  return (
    <header className={cn(primaryClass, "border-b border-white/10 text-white")}>
      <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <Link href="/" className="flex items-center gap-4 min-w-0">
            <img
              src={siteLogo}
              alt={siteName}
              className="h-16 w-16 rounded-lg bg-white/10 p-1 object-contain ring-1 ring-white/15"
            />
            <div className="min-w-0">
              <p className="truncate text-2xl font-bold leading-tight">{siteName}</p>
              <p className="text-sm text-white/80">Sveriges äldsta stödförening sedan 1937</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Button asChild variant="secondary">
                    <Link href="/admin">
                      <LayoutDashboard className="h-4 w-4" />
                      Admin / CMS
                    </Link>
                  </Button>
                ) : null}
                <Button
                  asChild
                  className="bg-[oklch(0.85_0.12_90)] text-[oklch(0.25_0.08_250)] hover:bg-[oklch(0.8_0.12_90)]"
                >
                  <Link href="/payment">
                    <CreditCard className="h-4 w-4" />
                    Betala medlemsavgift
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/profile">
                    <UserRound className="h-4 w-4" />
                    Min sida
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild variant="secondary">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  Logga in
                </Link>
              </Button>
            )}
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {publicNavItems.map((item) => {
            const active = isActivePath(currentPath, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "border-[oklch(0.85_0.12_90)] bg-white/10 text-white"
                    : "border-white/15 text-white/85 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className={cn("h-4 w-4", active ? accentTextClass : "")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function PageHero({
  title,
  description,
  actions,
  centered = false,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <section className="bg-gradient-to-b from-[#0d2d53] via-[#184879] to-[#2d679d] text-white">
      <div
        className={cn(
          "container mx-auto px-4 py-14 md:py-16",
          centered ? "text-center" : "text-left"
        )}
      >
        <div className={cn("max-w-4xl", centered && "mx-auto")}>
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-white/70">
            Föreningen Gamla SSK-are
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
          {description ? (
            <p className="mt-4 max-w-3xl text-lg text-white/85">{description}</p>
          ) : null}
          {actions ? (
            <div className={cn("mt-8 flex flex-wrap gap-3", centered && "justify-center")}>
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const { siteLogo, siteName } = useSiteBranding();

  return (
    <footer className={cn(primaryClass, "mt-auto border-t border-white/10 text-white")}>
      <div className="container mx-auto flex flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={siteLogo}
            alt={siteName}
            className="h-12 w-12 rounded-lg bg-white/10 p-1 object-contain ring-1 ring-white/15"
          />
          <div>
            <p className="font-semibold">{siteName}</p>
            <p className="text-sm text-white/75">Stöd, historia och gemenskap kring Södertälje SK.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          {publicNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-white/85 hover:text-white">
              {item.label}
            </Link>
          ))}
          <Link href="/" className={cn("font-medium hover:text-white", accentTextClass)}>
            Till startsidan
          </Link>
        </div>
      </div>
    </footer>
  );
}
