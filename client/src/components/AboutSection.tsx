import { useCMSContent } from "@/hooks/useCMSContent";
import { Users, Heart, Calendar, Trophy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AboutSection() {
  const { getContent, isLoading } = useCMSContent("home");

  if (isLoading) {
    return null;
  }

  const title = getContent("about_title") || "Om Föreningen Gamla SSK";
  const content = getContent("about_content") || "";
  const visible = getContent("about_visible") === "true";

  // Stats cards
  const stat1Value = getContent("about_stat1_value") || "1937";
  const stat1Label = getContent("about_stat1_label") || "Grundades";
  const stat2Value = getContent("about_stat2_value") || "300+";
  const stat2Label = getContent("about_stat2_label") || "Medlemmar";
  const stat3Value = getContent("about_stat3_value") || "1M+ SEK";
  const stat3Label = getContent("about_stat3_label") || "Årligt bidrag";
  const stat4Value = getContent("about_stat4_value") || "SSK";
  const stat4Label = getContent("about_stat4_label") || "Stödförening";

  if (!visible) {
    return null;
  }

  return (
    <section id="om-oss" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-[oklch(0.25_0.08_250)] mb-6">
              <span dangerouslySetInnerHTML={{ __html: title }} />
            </h2>
            <div 
              className="space-y-4 text-gray-700 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-[oklch(0.85_0.12_90)] mb-2" />
                <CardTitle dangerouslySetInnerHTML={{ __html: stat1Value }} />
                <CardDescription dangerouslySetInnerHTML={{ __html: stat1Label }} />
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-[oklch(0.85_0.12_90)] mb-2" />
                <CardTitle dangerouslySetInnerHTML={{ __html: stat2Value }} />
                <CardDescription dangerouslySetInnerHTML={{ __html: stat2Label }} />
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Trophy className="h-8 w-8 text-[oklch(0.85_0.12_90)] mb-2" />
                <CardTitle dangerouslySetInnerHTML={{ __html: stat3Value }} />
                <CardDescription dangerouslySetInnerHTML={{ __html: stat3Label }} />
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <img src="/logo.gif" alt="SSK" className="h-12 w-12 mb-2" />
                <CardTitle dangerouslySetInnerHTML={{ __html: stat4Value }} />
                <CardDescription dangerouslySetInnerHTML={{ __html: stat4Label }} />
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
