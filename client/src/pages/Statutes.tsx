import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { Calendar, Users, FileText, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Statutes() {
  const { data: content, isLoading } = trpc.cms.getPageContent.useQuery({ page: 'statutes' });
  const { data: settings } = trpc.cms.getSettings.useQuery();

  const getContent = (key: string) => {
    const section = content?.find(c => c.sectionKey === key && c.published === 1);
    return section?.content || '';
  };



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[oklch(0.25_0.08_250)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Stadgar & Information"
        subtitle="Föreningen Gamla SSK-are"
        breadcrumbs={[
          { label: 'Stadgar & Information' }
        ]}
      />

      <main className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-[oklch(0.25_0.08_250)] mb-6">
            Om Föreningen Gamla SSK-are
          </h2>
          <div className="prose prose-lg max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: getContent('intro') }}
              className="text-gray-700 leading-relaxed"
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-[oklch(0.25_0.08_250)] mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Historisk tidslinje
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1936</CardTitle>
                <CardDescription>Beslut om bildande</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Beslut togs att starta en stödförening för Södertälje SK.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>25 augusti 1937</CardTitle>
                <CardDescription>Föreningen bildas officiellt</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Föreningen Gamla SSK-are bildades officiellt med Carl Abrahamsson, 
                  "Calle Aber", som förste ordförande. Hans namn lever vidare i SSK:s 
                  restaurang "Calle Aber" som öppnade hösten 2021.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>1937-idag</CardTitle>
                <CardDescription>Över 85 år av stöd</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Föreningen har under alla år stöttat moderklubben genom ideellt arbete. 
                  Idag har vi över 300 medlemmar och bidrar årligen med över 1 miljon kronor 
                  till Södertälje SK.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Organization Structure */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-[oklch(0.25_0.08_250)] mb-6 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Styrelse och organisation
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Ordförande</h3>
                  <p className="text-gray-700">Göran Söderberg</p>
                  <p className="text-sm text-gray-600">070-5661792</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Vice ordförande</h3>
                  <p className="text-gray-700">Ulf Lindström</p>
                  <p className="text-sm text-gray-600">070-6736303</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Sekreterare</h3>
                  <p className="text-gray-700">Tomas Axelsson</p>
                  <p className="text-sm text-gray-600">070-5129143</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Kassör</h3>
                  <p className="text-gray-700">Annicka Hellströmer</p>
                  <p className="text-sm text-gray-600">070-6008399</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold text-lg mb-4">Övriga styrelseledamöter</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-700">Gunnel Andersson</p>
                    <p className="text-sm text-gray-600">070-5269690</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Ulf Nordström</p>
                    <p className="text-sm text-gray-600">070-5580950</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Leif Eklund</p>
                    <p className="text-sm text-gray-600">070-3372605</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Mats Andersson</p>
                    <p className="text-sm text-gray-600">070-6672305</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold text-lg mb-4">Suppleanter</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-700">Pia Dahlberg</p>
                    <p className="text-sm text-gray-600">070-7976074</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Mats Eriksson</p>
                    <p className="text-sm text-gray-600">070-6667424</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statutes */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-[oklch(0.25_0.08_250)] mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Stadgar
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div 
                className="prose prose-lg max-w-none max-h-[600px] overflow-y-auto pr-4"
                dangerouslySetInnerHTML={{ __html: getContent('Föreningens stadgar') }}
              />
              {!getContent('Föreningens stadgar') && (
                <p className="text-gray-500 italic">Stadgar saknas i CMS. Lägg till innehåll i Admin → CMS → Statutes → "Föreningens stadgar"</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activities */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-[oklch(0.25_0.08_250)] mb-6">
            Verksamhet
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Folkspels-bingolotter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Vår huvudsakliga verksamhet är försäljning av bingolotter och sverigelotter 
                  på ICA Maxi Vasa, ICA Maxi Moraberg och Stora Coop Vasa. Alla intäkter går 
                  direkt till Södertälje SK.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Årlig vårfest</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Varje år arrangerar vi en vårfest där medlemmar, supportrar och SSK-profiler 
                  samlas för mingel, mat och underhållning. Ett tillfälle att fira föreningen 
                  och hockeyn tillsammans.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ekonomiskt stöd</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Genom medlemmarnas ideella arbete bidrar vi årligen med över 1 miljon kronor 
                  till Södertälje SK. Detta stöd är avgörande för klubbens fortsatta verksamhet.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gemenskap</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Vi skapar mötesplatser för SSK-supportrar att träffas, dela minnen och 
                  tillsammans stödja vår älskade klubb. Medlemskap är öppet för alla som 
                  brinner för SSK.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
