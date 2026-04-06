import { Link } from "wouter";
import { Home } from "lucide-react";
import { useSiteSettings } from "@/hooks/useCMSContent";
import { Breadcrumbs, BreadcrumbItem } from "./Breadcrumbs";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showBackButton?: boolean;
  breadcrumbs?: BreadcrumbItem[];
}

export function PageHeader({ title, subtitle, icon, showBackButton = true, breadcrumbs }: PageHeaderProps) {
  const { getSetting } = useSiteSettings();
  
  const logo = getSetting('site_logo', '/logo.png');
  const siteName = getSetting('site_name', 'Föreningen Gamla SSK-are');

  return (
    <>
    <header className="bg-[oklch(0.25_0.08_250)] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt={`${siteName} Logo`} className="h-16 w-16 object-contain" />
            <div>
              <div className="flex items-center gap-3 mb-1">
                {icon && <div className="flex-shrink-0">{icon}</div>}
                <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
              </div>
              {subtitle && (
                <p className="text-base md:text-lg opacity-90">{subtitle}</p>
              )}
            </div>
          </div>
          {showBackButton && (
            <Link href="/" className="flex items-center gap-2 hover:text-[oklch(0.85_0.12_90)] transition-colors">
              <Home className="h-5 w-5" />
              <span className="hidden sm:inline">Tillbaka till startsidan</span>
            </Link>
          )}
        </div>
      </div>
    </header>
    {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
    </>
  );
}
