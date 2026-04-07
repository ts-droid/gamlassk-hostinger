import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, FileText, Loader2 } from "lucide-react";
import { PageHero, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useBoardMembers, useCMSContent } from "@/hooks/useCMSContent";

type BoardMember = {
  id: number;
  name: string;
  role: string;
  phone?: string | null;
  email?: string | null;
};

const defaultStatutesHtml = `
  <section>
    <h3>§ 1 Namn och säte</h3>
    <p>Föreningens namn är Föreningen Gamla SSK-are. Föreningen har sitt säte i Södertälje kommun.</p>
  </section>
  <section>
    <h3>§ 2 Ändamål</h3>
    <p>Föreningen har till ändamål att stödja Södertälje SK ekonomiskt och socialt samt att främja gemenskap bland föreningens medlemmar och supportrar till SSK.</p>
  </section>
  <section>
    <h3>§ 3 Medlemskap</h3>
    <p>Medlem i föreningen kan vara den som:</p>
    <ul>
      <li>Är supporter till Södertälje SK</li>
      <li>Betalar fastställd medlemsavgift (för närvarande 150 kr/år)</li>
      <li>Godkänner föreningens stadgar</li>
    </ul>
    <p>Namnet "Gamla SSK-are" betyder inte att man måste vara åldersmässigt gammal, utan att man varit SSK-supporter en längre tid.</p>
  </section>
  <section>
    <h3>§ 4 Medlemsavgift</h3>
    <p>Medlemsavgiftens storlek fastställs årligen av årsmötet.</p>
  </section>
  <section>
    <h3>§ 5 Styrelse</h3>
    <p>Föreningens styrelse består av:</p>
    <ul>
      <li>Ordförande</li>
      <li>Vice ordförande</li>
      <li>Sekreterare</li>
      <li>Kassör</li>
      <li>Minst 3 övriga ledamöter</li>
      <li>2 suppleanter</li>
    </ul>
    <p>Styrelsen väljs på årsmötet för en mandatperiod om ett år.</p>
  </section>
  <section>
    <h3>§ 6 Årsmöte</h3>
    <p>Årsmöte hålls senast i mars månad varje år. Kallelse till årsmötet ska skickas ut senast två veckor före mötet.</p>
  </section>
  <section>
    <h3>§ 7 Verksamhetsår</h3>
    <p>Föreningens verksamhetsår och räkenskapsår omfattar kalenderår.</p>
  </section>
  <section>
    <h3>§ 8 Stadgeändring</h3>
    <p>För ändring av dessa stadgar krävs beslut av årsmötet med minst 2/3 majoritet.</p>
  </section>
  <section>
    <h3>§ 9 Upplösning</h3>
    <p>För upplösning av föreningen krävs beslut vid två på varandra följande årsmöten med minst 2/3 majoritet. Vid upplösning ska föreningens tillgångar tillfalla Södertälje SK.</p>
  </section>
`;

function categorizeBoardMembers(members: BoardMember[]) {
  const keyRoles = {
    chair: ["ordförande"],
    viceChair: ["vice ordförande"],
    secretary: ["sekreterare"],
    treasurer: ["kassör"],
  } as const;

  const assignedIds = new Set<number>();

  const findByRole = (patterns: readonly string[]) => {
    const match = members.find((member) => {
      const normalizedRole = member.role.toLowerCase();
      return patterns.some((pattern) => normalizedRole.includes(pattern));
    });

    if (match) {
      assignedIds.add(match.id);
    }

    return match;
  };

  const chair = findByRole(keyRoles.chair);
  const viceChair = findByRole(keyRoles.viceChair);
  const secretary = findByRole(keyRoles.secretary);
  const treasurer = findByRole(keyRoles.treasurer);

  const deputies = members.filter((member) => member.role.toLowerCase().includes("suppleant"));
  deputies.forEach((member) => assignedIds.add(member.id));

  const otherMembers = members.filter((member) => !assignedIds.has(member.id));

  return { chair, viceChair, secretary, treasurer, deputies, otherMembers };
}

function BoardMemberCard({ member }: { member: BoardMember }) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">{member.role}</h3>
      <p className="text-gray-700">{member.name}</p>
      {member.phone ? <p className="text-sm text-gray-600">{member.phone}</p> : null}
      {member.email ? <p className="text-sm text-gray-600">{member.email}</p> : null}
    </div>
  );
}

export default function Statutes() {
  const { getContent, isLoading } = useCMSContent("statutes");
  const { members, isLoading: boardLoading } = useBoardMembers();

  const timelineItems = [
    {
      title: getContent("timeline_1_title", "1936"),
      description: getContent("timeline_1_description", "Beslut om bildande"),
      content: getContent("timeline_1_content", "Beslut togs att starta en stödförening för Södertälje SK."),
    },
    {
      title: getContent("timeline_2_title", "25 augusti 1937"),
      description: getContent("timeline_2_description", "Föreningen bildas officiellt"),
      content: getContent(
        "timeline_2_content",
        'Föreningen Gamla SSK-are bildades officiellt med Carl Abrahamsson, "Calle Aber", som förste ordförande. Hans namn lever vidare i SSK:s restaurang "Calle Aber" som öppnade hösten 2021.',
      ),
    },
    {
      title: getContent("timeline_3_title", "1937-idag"),
      description: getContent("timeline_3_description", "Över 85 år av stöd"),
      content: getContent(
        "timeline_3_content",
        "Föreningen har under alla år stöttat moderklubben genom ideellt arbete. Idag har vi över 300 medlemmar och bidrar årligen med över 1 miljon kronor till Södertälje SK.",
      ),
    },
  ];

  const activities = [
    {
      title: getContent("activity_1_title", "Folkspels-bingolotter"),
      content: getContent(
        "activity_1_content",
        "Vår huvudsakliga verksamhet är försäljning av bingolotter och sverigelotter på ICA Maxi Vasa, ICA Maxi Moraberg och Stora Coop Vasa. Alla intäkter går direkt till Södertälje SK.",
      ),
    },
    {
      title: getContent("activity_2_title", "Årlig vårfest"),
      content: getContent(
        "activity_2_content",
        "Varje år arrangerar vi en vårfest där medlemmar, supportrar och SSK-profiler samlas för mingel, mat och underhållning. Ett tillfälle att fira föreningen och hockeyn tillsammans.",
      ),
    },
    {
      title: getContent("activity_3_title", "Ekonomiskt stöd"),
      content: getContent(
        "activity_3_content",
        "Genom medlemmarnas ideella arbete bidrar vi årligen med över 1 miljon kronor till Södertälje SK. Detta stöd är avgörande för klubbens fortsatta verksamhet.",
      ),
    },
    {
      title: getContent("activity_4_title", "Gemenskap"),
      content: getContent(
        "activity_4_content",
        "Vi skapar mötesplatser för SSK-supportrar att träffas, dela minnen och tillsammans stödja vår älskade klubb. Medlemskap är öppet för alla som brinner för SSK.",
      ),
    },
  ];

  const board = categorizeBoardMembers((members || []) as BoardMember[]);

  if (isLoading || boardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[oklch(0.25_0.08_250)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader currentPath="/statutes" />
      <PageHero
        title={getContent("hero_title", "Stadgar och information")}
        description={getContent("hero_description", "Föreningens bakgrund, verksamhet och aktuella stadgar samlade på ett ställe.")}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-[oklch(0.25_0.08_250)] mb-6">
            {getContent("intro_title", "Om Föreningen Gamla SSK-are")}
          </h2>
          <div
            dangerouslySetInnerHTML={{ __html: getContent("intro") }}
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          />
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-[oklch(0.25_0.08_250)] mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            {getContent("timeline_title", "Historisk tidslinje")}
          </h2>
          <div className="space-y-6">
            {timelineItems.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-[oklch(0.25_0.08_250)] mb-6 flex items-center gap-2">
            <Users className="h-6 w-6" />
            {getContent("organization_title", "Styrelse och organisation")}
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[board.chair, board.viceChair, board.secretary, board.treasurer]
                  .filter(Boolean)
                  .map((member) => (
                    <BoardMemberCard key={member!.id} member={member!} />
                  ))}
              </div>

              {board.otherMembers.length > 0 ? (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-semibold text-lg mb-4">{getContent("other_members_title", "Övriga styrelseledamöter")}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {board.otherMembers.map((member) => (
                      <div key={member.id}>
                        <p className="text-gray-700">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        {member.phone ? <p className="text-sm text-gray-600">{member.phone}</p> : null}
                        {member.email ? <p className="text-sm text-gray-600">{member.email}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {board.deputies.length > 0 ? (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-semibold text-lg mb-4">{getContent("deputies_title", "Suppleanter")}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {board.deputies.map((member) => (
                      <div key={member.id}>
                        <p className="text-gray-700">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        {member.phone ? <p className="text-sm text-gray-600">{member.phone}</p> : null}
                        {member.email ? <p className="text-sm text-gray-600">{member.email}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-[oklch(0.25_0.08_250)] mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {getContent("statutes_title", "Stadgar")}
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div
                className="prose prose-lg max-w-none text-gray-700 [&_section]:space-y-2 [&_section]:mb-6 [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{
                  __html: getContent("statutes_body_html", defaultStatutesHtml),
                }}
              />

              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-gray-600 italic">
                  {getContent("statutes_footer_note", "Dessa stadgar antogs vid årsmötet 1937 och har därefter reviderats vid årsmöten.")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-[oklch(0.25_0.08_250)] mb-6">
            {getContent("activities_title", "Verksamhet")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {activities.map((activity) => (
              <Card key={activity.title}>
                <CardHeader>
                  <CardTitle>{activity.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{activity.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
