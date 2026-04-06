import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string; // If no href, it's the current page (not clickable)
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <ol className="flex items-center gap-2 text-sm">
          {/* Home link */}
          <li>
            <Link href="/" className="flex items-center gap-1 text-gray-600 hover:text-[oklch(0.25_0.08_250)] transition-colors">
              <Home className="h-4 w-4" />
              <span>Hem</span>
            </Link>
          </li>

          {/* Breadcrumb items */}
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li key={index} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                {item.href && !isLast ? (
                  <Link href={item.href} className="text-gray-600 hover:text-[oklch(0.25_0.08_250)] transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-medium" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
