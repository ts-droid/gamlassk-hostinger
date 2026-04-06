import { trpc } from "@/lib/trpc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, AlertTriangle, CheckCircle, Calendar, Megaphone, X } from "lucide-react";
import { useState } from "react";

type BannerPosition = "top" | "hero" | "sidebar";

interface BannerDisplayProps {
  position: BannerPosition;
  className?: string;
}

const BANNER_ICONS = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  event: Calendar,
  announcement: Megaphone,
};

const BANNER_STYLES = {
  info: "bg-blue-50 border-blue-200 text-blue-900",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
  success: "bg-green-50 border-green-200 text-green-900",
  event: "bg-purple-50 border-purple-200 text-purple-900",
  announcement: "bg-gray-50 border-gray-200 text-gray-900",
};

export function BannerDisplay({ position, className = "" }: BannerDisplayProps) {
  const { data: banners } = trpc.banners.list.useQuery();
  const [dismissedBanners, setDismissedBanners] = useState<number[]>([]);

  if (!banners || banners.length === 0) return null;

  const filteredBanners = banners
    .filter((banner: any) => banner.position === position)
    .filter((banner: any) => !dismissedBanners.includes(banner.id));

  if (filteredBanners.length === 0) return null;

  const handleDismiss = (bannerId: number) => {
    setDismissedBanners([...dismissedBanners, bannerId]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {filteredBanners.map((banner: any) => {
        const Icon = BANNER_ICONS[banner.type as keyof typeof BANNER_ICONS] || Info;
        const style = BANNER_STYLES[banner.type as keyof typeof BANNER_STYLES] || BANNER_STYLES.info;

        return (
          <Alert key={banner.id} className={`${style} relative`}>
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <AlertTitle className="font-semibold mb-1">{banner.title}</AlertTitle>
                <AlertDescription className="text-sm whitespace-pre-wrap">
                  {banner.content}
                </AlertDescription>
                {banner.linkUrl && banner.linkText && (
                  <Button
                    variant="link"
                    className="p-0 h-auto mt-2 text-current hover:underline"
                    onClick={() => window.open(banner.linkUrl, '_blank')}
                  >
                    {banner.linkText} →
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-black/10"
                onClick={() => handleDismiss(banner.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        );
      })}
    </div>
  );
}
