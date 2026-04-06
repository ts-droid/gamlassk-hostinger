import { Link } from "wouter";
import { useCMSContent } from "@/hooks/useCMSContent";

export function FolkspelSection() {
  const { getContent, isLoading } = useCMSContent("home");

  const folkspelVisible = getContent("folkspel_visible", "true") === "true";
  const title = getContent("folkspel_title", "Stöd SSK genom Folkspels lotter!");
  const description = getContent(
    "folkspel_description",
    "Köp lotter online - en del av intäkterna går direkt till föreningen. Varje lott du köper hjälper oss att bevara SSK:s historia och stödja våra aktiviteter.",
  );
  const feature1Title = getContent("folkspel_feature1_title", "Flera paket");
  const feature1Desc = getContent("folkspel_feature1_description", "BingoLotto, Sverigelotten, JOYNA och fler");
  const feature2Title = getContent("folkspel_feature2_title", "Säker betalning");
  const feature2Desc = getContent("folkspel_feature2_description", "Betala tryggt via Folkspels system");
  const feature3Title = getContent("folkspel_feature3_title", "Stöd föreningen");
  const feature3Desc = getContent("folkspel_feature3_description", "Varje köp hjälper Gamla SSK-are");
  const footerText = getContent(
    "folkspel_footer_text",
    "Du kan också köpa lotter på ICA Maxi Vasa, Moraberg eller Stora Coop Vasa.",
  );

  if (isLoading || !folkspelVisible) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-[oklch(0.85_0.12_90)] to-[oklch(0.90_0.08_90)]">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="mb-6 text-center text-4xl font-bold text-[oklch(0.25_0.08_250)] md:text-5xl">
            <span dangerouslySetInnerHTML={{ __html: title }} />
          </h2>
          <div className="mx-auto mb-8 max-w-3xl text-center text-xl text-gray-700 prose prose-lg">
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </div>

          <Link href="/folkspel">
            <div className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
              <img
                src="/folkspel-banner.png"
                alt="Folkspels Supporterpaket - Köp lotter och stöd SSK"
                className="h-auto w-full"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/10">
                <div className="rounded-full bg-white/95 px-8 py-4 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
                  <span className="text-2xl font-bold text-[oklch(0.25_0.08_250)]">
                    Klicka för att köpa lotter →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <div className="mt-8 grid gap-6 text-center md:grid-cols-3">
            <div className="rounded-xl bg-white/60 p-6 backdrop-blur-sm">
              <div className="mb-2 text-3xl">🎁</div>
              <h3 className="mb-2 text-lg font-bold">
                <span dangerouslySetInnerHTML={{ __html: feature1Title }} />
              </h3>
              <div className="text-sm text-gray-600 prose prose-sm">
                <div dangerouslySetInnerHTML={{ __html: feature1Desc }} />
              </div>
            </div>
            <div className="rounded-xl bg-white/60 p-6 backdrop-blur-sm">
              <div className="mb-2 text-3xl">💳</div>
              <h3 className="mb-2 text-lg font-bold">
                <span dangerouslySetInnerHTML={{ __html: feature2Title }} />
              </h3>
              <div className="text-sm text-gray-600 prose prose-sm">
                <div dangerouslySetInnerHTML={{ __html: feature2Desc }} />
              </div>
            </div>
            <div className="rounded-xl bg-white/60 p-6 backdrop-blur-sm">
              <div className="mb-2 text-3xl">❤️</div>
              <h3 className="mb-2 text-lg font-bold">
                <span dangerouslySetInnerHTML={{ __html: feature3Title }} />
              </h3>
              <div className="text-sm text-gray-600 prose prose-sm">
                <div dangerouslySetInnerHTML={{ __html: feature3Desc }} />
              </div>
            </div>
          </div>

          <div className="mx-auto mt-6 text-center text-sm text-gray-600 prose prose-sm">
            <div dangerouslySetInnerHTML={{ __html: footerText }} />
          </div>
        </div>
      </div>
    </section>
  );
}
