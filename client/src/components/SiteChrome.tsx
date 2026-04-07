import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  UserRound,
  X,
} from "lucide-react";
import { Link } from "wouter";

const headerClass = "bg-[#002653] text-white";
const accentClass = "text-[#e4c46a]";
const ctaClass =
  "border-[#0d5a98] bg-linear-to-b from-[#0a5c9f] to-[#1c70b8] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] hover:from-[#1b70b8] hover:to-[#3a89cc]";

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className={cn(headerClass, "border-b border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.18)]")}>
      <div className="h-1 w-full bg-[#0f3f77]" />
      <div className="container mx-auto px-4">
        <div className="flex min-h-[78px] items-center justify-between gap-3 py-3 lg:grid lg:min-h-[104px] lg:grid-cols-[110px_minmax(0,1fr)_auto] lg:items-center lg:gap-8 lg:py-0">
          <Link href="/" className="flex items-center">
            <img
              src={siteLogo}
              alt={siteName}
              className="h-[52px] w-[52px] shrink-0 rounded-none object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)] sm:h-[64px] sm:w-[64px] lg:h-[74px] lg:w-[74px]"
            />
          </Link>

          <nav className="hidden lg:flex lg:min-w-0 lg:flex-wrap lg:items-center lg:justify-center lg:gap-x-5 lg:gap-y-2 lg:justify-self-center xl:gap-x-8">
            {publicNavItems.map((item) => {
              const active = isActivePath(currentPath, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center justify-center px-2 py-2 text-[0.92rem] font-semibold transition-colors hover:text-white xl:text-[0.98rem]",
                    active ? accentClass : "text-white",
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex lg:items-center lg:justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-12 rounded-none border border-white/30 bg-white/6 px-5 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
                >
                  Mer
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="min-w-[240px] rounded-none border-white/10 bg-[#002653] p-2 text-white shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
              >
                {isAuthenticated ? (
                  <>
                    {isAdmin ? (
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer rounded-none px-3 py-3 text-sm font-semibold text-white focus:bg-white/10 focus:text-white"
                      >
                        <Link href="/admin">
                          <LayoutDashboard className="h-4 w-4" />
                          Admin / CMS
                        </Link>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-none px-3 py-3 text-sm font-semibold text-white focus:bg-white/10 focus:text-white"
                    >
                      <Link href="/payment">
                        <CreditCard className="h-4 w-4" />
                        Betala medlemsavgift
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-none px-3 py-3 text-sm font-semibold text-white focus:bg-white/10 focus:text-white"
                    >
                      <Link href="/profile">
                        <UserRound className="h-4 w-4" />
                        Min sida
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-none px-3 py-3 text-sm font-semibold text-white focus:bg-white/10 focus:text-white"
                  >
                    <Link href="/login">
                      <LogIn className="h-4 w-4" />
                      Logga in
                    </Link>
                  </DropdownMenuItem>
                )}

              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <button
            type="button"
            aria-label={mobileNavOpen ? "Stäng meny" : "Öppna meny"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 lg:hidden"
            onClick={() => setMobileNavOpen((value) => !value)}
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className={cn("pb-4 lg:hidden", mobileNavOpen ? "block" : "hidden")}>
          <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
            <nav className="grid gap-2">
              {publicNavItems.map((item) => {
                const active = isActivePath(currentPath, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-3 rounded-xl px-3 py-3 text-base font-bold transition-colors",
                      active ? "bg-white/12 text-[#e4c46a]" : "text-white/90 hover:bg-white/8",
                    )}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 grid gap-2">
              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Button
                      asChild
                      variant="secondary"
                      className="justify-start border border-white/15 bg-white text-[#002653] hover:bg-white/90"
                    >
                      <Link href="/admin" onClick={() => setMobileNavOpen(false)}>
                        <LayoutDashboard className="h-4 w-4" />
                        Admin / CMS
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild className={cn(ctaClass, "justify-start")}>
                    <Link href="/payment" onClick={() => setMobileNavOpen(false)}>
                      <CreditCard className="h-4 w-4" />
                      Betala medlemsavgift
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    className="justify-start border border-white/15 bg-white text-[#002653] hover:bg-white/90"
                  >
                    <Link href="/profile" onClick={() => setMobileNavOpen(false)}>
                      <UserRound className="h-4 w-4" />
                      Min sida
                    </Link>
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  variant="secondary"
                  className="justify-start border border-white/15 bg-white text-[#002653] hover:bg-white/90"
                >
                  <Link href="/login" onClick={() => setMobileNavOpen(false)}>
                    <LogIn className="h-4 w-4" />
                    Logga in
                  </Link>
                </Button>
              )}
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
          "container mx-auto px-4 py-10 md:py-16",
          centered ? "text-center" : "text-left",
        )}
      >
        <div className={cn("max-w-4xl", centered && "mx-auto")}>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.22em] text-white/68 sm:text-sm sm:tracking-[0.28em]">
            Föreningen Gamla SSK-are
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
          {description ? (
            <p className="mt-4 max-w-3xl text-base font-semibold text-white/82 sm:text-lg">{description}</p>
          ) : null}
          {actions ? (
            <div
              className={cn(
                "mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap",
                centered && "justify-center",
              )}
            >
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
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-12">
          <div>
            <p className="text-[1.15rem] font-extrabold uppercase tracking-tight sm:text-[1.7rem]">SSK i sociala medier</p>
            <div className="mt-4 space-y-2 text-base font-semibold text-white/90 sm:text-xl">
              <p>Facebook</p>
              <p>Instagram</p>
              <p>X</p>
              <p>YouTube</p>
            </div>
          </div>

          <div>
            <p className="text-[1.15rem] font-extrabold uppercase tracking-tight sm:text-[1.7rem]">Kontakt</p>
            <div className="mt-4 space-y-2 text-base font-semibold text-white/90 sm:text-xl">
              <p>Föreningen Gamla SSK-are</p>
              <p>Stöd, historia och gemenskap</p>
              <p>Södertälje</p>
            </div>
          </div>

          <div>
            <p className="text-[1.15rem] font-extrabold uppercase tracking-tight sm:text-[1.7rem]">Snabblänkar</p>
            <div className="mt-4 flex flex-col gap-2 text-base font-semibold sm:text-xl">
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

        <div className="mt-12 flex flex-col items-center justify-center gap-4 border-t border-white/10 pt-8 text-center sm:mt-14 sm:pt-10">
          <img
            src={siteLogo}
            alt={siteName}
            className="h-20 w-20 object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.25)] sm:h-24 sm:w-24"
          />
          <p className="text-lg font-bold text-white sm:text-xl">{siteName}</p>
          <p className="text-base font-semibold text-white/75 sm:text-lg">Powered by Gamla SSK</p>
        </div>
      </div>
    </footer>
  );
}
