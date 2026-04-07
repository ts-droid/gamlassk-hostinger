import { ExternalLink, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useCMSContent } from "@/hooks/useCMSContent";

const FOLKSPEL_URL = "https://www.folkspel.se/foreningsbutik/?s=8fbba238-adf1-ee11-844c-005056809ebc";

export default function Folkspel() {
  const { getContent } = useCMSContent("folkspel");
  const openFolkspel = () => {
    window.open(FOLKSPEL_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <SiteHeader currentPath="/folkspel" />
      <PageHero
        title={getContent("hero_title", "Stöd Föreningen Gamla SSK")}
        description={getContent("hero_description", "Köp lotter och bingolotter. Varje köp stödjer vår förening.")}
        centered
        actions={
          <Button
            size="lg"
            onClick={openFolkspel}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Öppna Folkspels butik
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        }
      />

      {/* Info Section */}
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Så fungerar det</CardTitle>
              <CardDescription>
                Enkelt sätt att stödja föreningen genom att köpa lotter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-blue-900">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Välj lotter</h3>
                  <p className="text-sm text-gray-600">
                    Bläddra bland BingoLotto, Sverigelotten, JOYNA och fler
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-blue-900">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Köp säkert</h3>
                  <p className="text-sm text-gray-600">
                    Betala tryggt via Folkspels säkra betalningslösning
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-blue-900">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Stöd föreningen</h3>
                  <p className="text-sm text-gray-600">
                    En del av intäkterna går direkt till Föreningen Gamla SSK
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-yellow-900">
                  <strong>OBS!</strong> När du klickar på knappen ovan öppnas Folkspels butik i ett nytt fönster. 
                  Alla köp hanteras säkert av Folkspel, och föreningen får automatiskt provision.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Iframe Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Förhandsvisning av butiken</CardTitle>
              <CardDescription>
                Se vilka produkter som finns tillgängliga (klicka på knappen ovan för att köpa)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full" style={{ height: "800px" }}>
                <iframe
                  src={FOLKSPEL_URL}
                  className="w-full h-full border-2 border-gray-200 rounded-lg"
                  title="Folkspel Föreningsbutik - Förhandsvisning"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  loading="lazy"
                />
                {/* Overlay to prevent interaction in iframe */}
                <div 
                  className="absolute inset-0 bg-transparent cursor-pointer"
                  onClick={openFolkspel}
                  title="Klicka för att öppna butiken i nytt fönster"
                />
              </div>
              <div className="mt-4 text-center">
                <Button onClick={openFolkspel} variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Öppna butiken för att köpa
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center text-gray-600">
            <p className="text-sm">
              Har du frågor om lotteriet? Kontakta oss på{" "}
              <a href="mailto:info@gamlassk.se" className="text-blue-600 hover:underline">
                info@gamlassk.se
              </a>
            </p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
