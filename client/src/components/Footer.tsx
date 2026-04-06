import { Link } from "wouter";
import { useCMSContent } from "@/hooks/useCMSContent";

export function Footer() {
  const { getContent, isLoading } = useCMSContent("global");

  if (isLoading) {
    return null;
  }

  const copyrightText = getContent("footer_copyright") || "© 2024 Föreningen Gamla SSK-are. Alla rättigheter förbehållna.";
  
  // Footer links - can be made CMS-editable in the future
  const links = [
    { label: getContent("footer_link1_label") || "Startsida", href: getContent("footer_link1_href") || "/" },
    { label: getContent("footer_link2_label") || "Stadgar", href: getContent("footer_link2_href") || "/statutes" },
    { label: getContent("footer_link3_label") || "Bildgalleri", href: getContent("footer_link3_href") || "/gallery" },
    { label: getContent("footer_link4_label") || "Evenemang", href: getContent("footer_link4_href") || "/calendar" },
    { label: getContent("footer_link5_label") || "Kontakt", href: getContent("footer_link5_href") || "/#kontakt" },
  ];

  return (
    <footer className="bg-[oklch(0.25_0.08_250)] text-white py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-4" dangerouslySetInnerHTML={{ __html: copyrightText }} />
        <div className="flex gap-4 justify-center flex-wrap">
          {links.map((link, index) => (
            <Link 
              key={index} 
              href={link.href} 
              className="hover:text-[oklch(0.85_0.12_90)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
