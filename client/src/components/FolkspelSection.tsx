import { Link } from "wouter";
import { useCMSContent } from "@/hooks/useCMSContent";

export function FolkspelSection() {
  const { getContent, isLoading } = useCMSContent("home");

  // Get CMS content with fallback values
  const folkspelVisible = getContent("folkspel_visible", "true") === "true";
  const title = getContent("folkspel_title", "Stöd SSK genom Folkspels lotter!");
  const description = getContent("folkspel_description", "Köp lotter online - en del av intäkterna går direkt till föreningen. Varje lott du köper hjälper oss att bevara SSK:s historia och stödja våra aktiviteter.");
  
  const feature1Title = getContent("folkspel_feature1_title", "Flera paket");
  const feature1Desc = getContent("folkspel_feature1_description", "BingoLotto, Sverigelotten, JOYNA och fler");
  
  const feature2Title = getContent("folkspel_feature2_title", "Säker betalning");
  const feature2Desc = getContent("folkspel_feature2_description", "Betala tryggt via Folkspels system");
  
  const feature3Title = getContent("folkspel_feature3_title", "Stöd föreningen");
  const feature3Desc = getContent("folkspel_feature3_description", "Varje köp hjälper Gamla SSK-are");
  
  const footerText = getContent("folkspel_footer_text", "Du kan också köpa lotter på ICA Maxi Vasa, Moraberg eller Stora Coop Vasa.");

  // Don't render if not visible or still loading
  if (isLoading || !folkspelVisible) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-[oklch(0.85_0.12_90)] to-[oklch(0.90_0.08_90)]">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[oklch(0.25_0.08_250)] mb-6 text-center">
            <span dangerouslySetInnerHTML={{ __html: title }} />
          </h2>
          <div className="text-xl text-gray-700 mb-8 text-center max-w-3xl mx-auto prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </div>
          
          {/* Clickable Image Banner */}
          <Link href="/folkspel">
            <div className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02] hover:shadow-3xl">
              <img 
                src="/folkspel-banner.png" 
                alt="Folkspels Supporterpaket - Köp lotter och stöd SSK" 
                className="w-full h-auto"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 px-8 py-4 rounded-full shadow-lg">
                  <span className="text-2xl font-bold text-[oklch(0.25_0.08_250)]">
                    Klicka för att köpa lotter →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Additional Info */}
          <div className="mt-8 grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="font-bold text-lg mb-2">
                <span dangerouslySetInnerHTML={{ __html: feature1Title }} />
              </h3>
              <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: feature1Desc }} />
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl">
              <div className="text-3xl mb-2">💳</div>
              <h3 className="font-bold text-lg mb-2">
                <span dangerouslySetInnerHTML={{ __html: feature2Title }} />
              </h3>
              <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: feature2Desc }} />
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl">
              <div className="text-3xl mb-2">❤️</div>
              <h3 className="font-bold text-lg mb-2">
                <span dangerouslySetInnerHTML={{ __html: feature3Title }} />
              </h3>
              <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: feature3Desc }} />
              </div>
            </div>
          </div>

          <div className="text-center text-gray-600 mt-6 text-sm prose prose-sm max-w-none mx-auto">
            <div dangerouslySetInnerHTML={{ __html: footerText }} />
          </div>
        </div>
      </div>
    </section>
  );
}
