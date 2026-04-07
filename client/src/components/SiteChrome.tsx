import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useSiteBranding } from "@/hooks/useCMSContent";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  FileText,
  GalleryVerticalEnd,
  Home,
  LayoutDashboard,
  LogIn,
  Menu,
  Newspaper,
  Search,
  UserRound,
} from "lucide-react";
import { Link } from "wouter";

const headerClass = "bg-[#002653] text-white";
const accentClass = "text-[#e4c46a]";
const ctaClass = "bg-[#0064b0] text-white hover:bg-[#0b78cf]";

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
    <header className={cn(headerClass, "border-b border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.18)]")}>
      <div className="h-1 w-full bg-[#0f3f77]" />
      <div className="container mx-auto px-4">
        <div className="flex min-h-[96px] flex-col justify-center gap-5 py-4 xl:min-h-[110px] xl:flex-row xl:items-center xl:justify-between xl:py-0">
          <Link href="/" className="flex min-w-0 items-center gap-4">
            <img
              src={siteLogo}
              alt={siteName}
              className="h-[74px] w-[74px] rounded-none object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)]"
            />
            <div className="min-w-0">
              <p className="truncate text-[1.9rem] font-extrabold leading-none tracking-tight text-white">
                {siteName}
              </p>
              <p className="mt-1 text-[0.98rem] font-semibold text-white/75">
                Sveriges äldsta stödförening sedan 1937
              </p>
            </div>
          </Link>

          <div className="flex flex-col gap-4 xl:min-w-0 xl:flex-1 xl:items-end">
            <div className="flex flex-wrap items-center gap-2">
              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Button
                      asChild
                      variant="secondary"
                      className="border border-white/15 bg-white text-[#002653] hover:bg-white/90"
                    >
                      <Link href="/admin">
                        <LayoutDashboard className="h-4 w-4" />
                        Admin / CMS
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild className={ctaClass}>
                    <Link href="/payment">
                      <CreditCard className="h-4 w-4" />
                      Betala medlemsavgift
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    className="border border-white/15 bg-white text-[#002653] hover:bg-white/90"
                  >
                    <Link href="/profile">
                      <UserRound className="h-4 w-4" />
                      Min sida
                    </Link>
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  variant="secondary"
                  className="border border-white/15 bg-white text-[#002653] hover:bg-white/90"
                >
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    Logga in
                  </Link>
                </Button>
              )}
            </div>

            <div className="flex w-full items-center justify-between gap-4 xl:w-auto xl:justify-end">
              <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[1.08rem] font-bold text-white/92">
                {publicNavItems.map((item) => {
                  const active = isActivePath(currentPath, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "inline-flex items-center gap-2 transition-colors hover:text-white",
                        active ? accentClass : "text-white/88",
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 xl:hidden", active ? accentClass : "text-white/70")} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden items-center gap-4 pl-4 text-white/85 xl:flex">
                <button type="button" aria-label="Sök" className="transition-colors hover:text-white">
                  <Search className="h-5 w-5" />
                </button>
                <button type="button" aria-label="Meny" className="transition-colors hover:text-white">
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
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
    <section className="bg-gradient-to-b from-[#113769] via-[#24548b] to-[#2f67a1] text-white">
      <div
        className={cn(
          "container mx-auto px-4 py-14 md:py-16",
          centered ? "text-center" : "text-left",
        )}
      >
        <div className={cn("max-w-4xl", centered && "mx-auto")}>
          <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.28em] text-white/68">
            Föreningen Gamla SSK-are
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">{title}</h1>
          {description ? (
            <p className="mt-4 max-w-3xl text-lg font-semibold text-white/82">{description}</p>
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
    <footer className="mt-auto bg-[#002653] text-white">
      <div className="container mx-auto px-4 py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-12">
          <div>
            <p className="text-[1.7rem] font-extrabold uppercase tracking-tight">SSK i sociala medier</p>
            <div className="mt-4 space-y-2 text-xl font-semibold text-white/90">
              <p>Facebook</p>
              <p>Instagram</p>
              <p>X</p>
              <p>YouTube</p>
            </div>
          </div>

          <div>
            <p className="text-[1.7rem] font-extrabold uppercase tracking-tight">Kontakt</p>
            <div className="mt-4 space-y-2 text-xl font-semibold text-white/90">
              <p>Föreningen Gamla SSK-are</p>
              <p>Stöd, historia och gemenskap</p>
              <p>Södertälje</p>
            </div>
          </div>

          <div>
            <p className="text-[1.7rem] font-extrabold uppercase tracking-tight">Snabblänkar</p>
            <div className="mt-4 flex flex-col gap-2 text-xl font-semibold">
              {publicNavItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-white/90 transition-colors hover:text-white">
                  {item.label}
                </Link>
              ))}
              <Link href="/" className={cn("mt-2 transition-colors hover:text-white", accentClass)}>
                Till startsidan
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-center gap-4 border-t border-white/10 pt-10 text-center">
          <img
            src={siteLogo}
            alt={siteName}
            className="h-24 w-24 object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.25)]"
          />
          <p className="text-xl font-bold text-white">{siteName}</p>
          <p className="text-lg font-semibold text-white/75">Powered by Gamla SSK</p>
        </div>
      </div>
    </footer>
  );
}
