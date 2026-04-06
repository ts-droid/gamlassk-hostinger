import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Home, Calendar, Users, FileText, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useSiteBranding } from "@/hooks/useCMSContent";

export default function Statutes() {
  const { data: content, isLoading } = trpc.cms.getPageContent.useQuery({ page: 'statutes' });
  const { siteLogo, siteName } = useSiteBranding();

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
      {/* Header */}
      <header className="bg-[oklch(0.25_0.08_250)] text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={siteLogo} alt="Gamla SSK Logo" className="h-16 w-16" />
              <div>
                <h1 className="text-2xl font-bold">Stadgar & Information</h1>
                <p className="text-sm opacity-90">{siteName}</p>
              </div>
            </div>
            <Link href="/" className="flex items-center gap-2 hover:text-[oklch(0.85_0.12_90)]">
              <Home className="h-5 w-5" />
              <span>Tillbaka till startsidan</span>
            </Link>
          </div>
        </div>
      </header>

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
              <div className="space-y-6">
                <section>
                  <h3 className="font-semibold text-lg mb-2">§ 1 Namn och säte</h3>
                  <p className="text-gray-700">
                    Föreningens namn är Föreningen Gamla SSK-are. Föreningen har sitt säte i Södertälje kommun.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">§ 2 Ändamål</h3>
                  <p className="text-gray-700">
                    Föreningen har till ändamål att stödja Södertälje SK ekonomiskt och socialt samt 
                    att främja gemenskap bland föreningens medlemmar och supportrar till SSK.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">§ 3 Medlemskap</h3>
                  <p className="text-gray-700 mb-2">
                    Medlem i föreningen kan vara den som:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Är supporter till Södertälje SK</li>
                    <li>Betalar fastställd medlemsavgift (för närvarande 150 kr/år)</li>
                    <li>Godkänner föreningens stadgar</li>
                  </ul>
                  <p className="text-gray-700 mt-2">
                    Namnet "Gamla SSK-are" betyder inte att man måste vara åldersmässigt gammal, 
                    utan att man varit SSK-supporter en längre tid.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">§ 4 Medlemsavgift</h3>
                  <p className="text-gray-700">
                    Medlemsavgiftens storlek fastställs årligen av årsmötet.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">§ 5 Styrelse</h3>
                  <p className="text-gray-700 mb-2">
                    Föreningens styrelse består av:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Ordförande</li>
                    <li>Vice ordförande</li>
                    <li>Sekreterare</li>
                    <li>Kassör</li>
                    <li>Minst 3 övriga ledamöter</li>
                    <li>2 suppleanter</li>
                  </ul>
                  <p className="text-gray-700 mt-2">
                    Styrelsen väljs på årsmötet för en mandatperiod om ett år.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">§ 6 Årsmöte</h3>
                  <p className="text-gray-700">
                    Årsmöte hålls senast i mars månad varje år. Kallelse till årsmötet ska skickas 
                    ut senast två veckor före mötet.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">§ 7 Verksamhetsår</h3>
                  <p className="text-gray-700">
                    Föreningens verksamhetsår och räkenskapsår omfattar kalenderår.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">§ 8 Stadgeändring</h3>
                  <p className="text-gray-700">
                    För ändring av dessa stadgar krävs beslut av årsmötet med minst 2/3 majoritet.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">§ 9 Upplösning</h3>
                  <p className="text-gray-700">
                    För upplösning av föreningen krävs beslut vid två på varandra följande årsmöten 
                    med minst 2/3 majoritet. Vid upplösning ska föreningens tillgångar tillfalla 
                    Södertälje SK.
                  </p>
                </section>
              </div>

              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-gray-600 italic">
                  Dessa stadgar antogs vid årsmötet 1937 och har därefter reviderats vid årsmöten.
                </p>
              </div>
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
      <footer className="bg-[oklch(0.25_0.08_250)] text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">© 2024 Föreningen Gamla SSK-are. Alla rättigheter förbehållna.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="hover:text-[oklch(0.85_0.12_90)]">
              Startsida
            </Link>
            <Link href="/statutes" className="hover:text-[oklch(0.85_0.12_90)]">
              Stadgar
            </Link>
            <a href="#" className="hover:text-[oklch(0.85_0.12_90)]">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
