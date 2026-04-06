import { ExternalLink, Heart, ShoppingCart } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FOLKSPEL_URL = "https://www.folkspel.se/foreningsbutik/?s=8fbba238-adf1-ee11-844c-005056809ebc";

export default function Folkspel() {
  const openFolkspel = () => {
    window.open(FOLKSPEL_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[oklch(0.98_0.02_250)] to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[oklch(0.85_0.12_90)] to-[oklch(0.90_0.08_90)] py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-[oklch(0.65_0.15_40)]" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[oklch(0.25_0.08_250)]">
              Stöd Föreningen Gamla SSK
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Köp lotter och bingolotter - varje köp stödjer vår förening
            </p>
            <Button 
              size="lg" 
              onClick={openFolkspel}
              className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] text-white font-bold"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Öppna Folkspels Butik
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

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
                  <div className="w-12 h-12 bg-[oklch(0.90_0.08_250)] rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-[oklch(0.25_0.08_250)]">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Välj lotter</h3>
                  <p className="text-sm text-gray-600">
                    Bläddra bland BingoLotto, Sverigelotten, JOYNA och fler
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[oklch(0.90_0.08_250)] rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-[oklch(0.25_0.08_250)]">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Köp säkert</h3>
                  <p className="text-sm text-gray-600">
                    Betala tryggt via Folkspels säkra betalningslösning
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[oklch(0.90_0.08_250)] rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-[oklch(0.25_0.08_250)]">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Stöd föreningen</h3>
                  <p className="text-sm text-gray-600">
                    En del av intäkterna går direkt till Föreningen Gamla SSK
                  </p>
                </div>
              </div>

              <div className="bg-[oklch(0.95_0.05_90)] border border-[oklch(0.85_0.10_90)] rounded-lg p-4 mt-6">
                <p className="text-sm text-[oklch(0.30_0.08_90)]">
                  <strong>OBS!</strong> När du klickar på knappen ovan öppnas Folkspels butik i ett nytt fönster. 
                  Alla köp hanteras säkert av Folkspel, och föreningen får automatiskt provision.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Instruction Guide */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Steg-för-steg-guide: Skapa konto och köp lotter</CardTitle>
              <CardDescription>
                Följ denna enkla guide för att skapa konto och börja köpa lotter via vår föreningslänk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-[oklch(0.45_0.12_250)] pl-4">
                <h3 className="font-bold text-lg mb-2">Steg 1: Använd vår föreningslänk</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Viktigt!</strong> Du måste använda vår speciella föreningslänk för att föreningen ska få provision.
                </p>
                <Button 
                  size="sm" 
                  onClick={openFolkspel}
                  className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)]"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Öppna vår föreningslänk
                </Button>
              </div>

              {/* Step 2 */}
              <div className="border-l-4 border-[oklch(0.45_0.12_250)] pl-4">
                <h3 className="font-bold text-lg mb-2">Steg 2: Skapa konto med BankID</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Klicka på "Logga in" uppe i högra hörnet</li>
                  <li>Klicka på "Skapa konto"</li>
                  <li>Välj "Mobilt BankID" och följ instruktionerna</li>
                  <li>Bekräfta din identitet i BankID-appen</li>
                </ol>
              </div>

              {/* Step 3 */}
              <div className="border-l-4 border-[oklch(0.45_0.12_250)] pl-4">
                <h3 className="font-bold text-lg mb-2">Steg 3: Sätt insättningsgränser</h3>
                <p className="text-gray-700 mb-2">
                  Enligt svensk lag måste du sätta gränser för hur mycket du kan spela för:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Daggräns (minst 25 kr)</li>
                  <li>Veckogräns</li>
                  <li>Månadsgräns</li>
                </ul>
                <p className="text-sm text-gray-600 mt-2">
                  💡 <strong>Tips:</strong> Höjningar träder i kraft efter 72 timmar, sänkningar omedelbart.
                </p>
              </div>

              {/* Step 4 */}
              <div className="border-l-4 border-[oklch(0.45_0.12_250)] pl-4">
                <h3 className="font-bold text-lg mb-2">Steg 4: Köp din första lott</h3>
                <p className="text-gray-700 mb-2">
                  Välj bland:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>BingoLotto</li>
                  <li>Sverigelotten</li>
                  <li>JOYNA</li>
                  <li>Skraplotter</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  Betala med kort, Swish eller Trustly.
                </p>
              </div>

              {/* Step 5 */}
              <div className="border-l-4 border-[oklch(0.45_0.12_250)] pl-4">
                <h3 className="font-bold text-lg mb-2">Steg 5: Rätta din lott</h3>
                <p className="text-gray-700 mb-2">
                  Efter dragningen:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Logga in på Folkspel.se</li>
                  <li>Gå till "Mina sidor" → "Spel och lotter"</li>
                  <li>Se resultatet under "Avgjorda spel"</li>
                  <li>Vinster sätts in automatiskt på ditt spelkonto</li>
                </ol>
              </div>

              {/* Important Note */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>✓ Bra att veta:</strong> När du har skapat ditt konto via vår föreningslänk är alla framtida köp automatiskt kopplade till föreningen. Du behöver inte använda länken igen!
                </p>
              </div>

              {/* FAQ */}
              <div className="mt-6">
                <h3 className="font-bold text-lg mb-3">Vanliga frågor</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-800">Kostar det mig något extra?</p>
                    <p className="text-sm text-gray-600">Nej! Priset är exakt detsamma. Föreningen får provision utan extra kostnad för dig.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Måste jag använda länken varje gång?</p>
                    <p className="text-sm text-gray-600">Nej! Efter att du skapat kontot via vår länk är alla framtida köp automatiskt kopplade till oss.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Kan jag dela min lott med någon?</p>
                    <p className="text-sm text-gray-600">Ja! Under "Mina sidor" kan du välja "Dela lott". Vinster kommer fortfarande till ditt konto.</p>
                  </div>
                </div>
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
      <Footer />
    </div>
  );
}
