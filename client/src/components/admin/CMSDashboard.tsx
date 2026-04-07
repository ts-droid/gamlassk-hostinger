import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Layout, Settings, Users, Image } from "lucide-react";
import PageEditor from "./PageEditor";
import SiteSettingsEditor from "./SiteSettingsEditor";
import BoardMembersEditor from "./BoardMembersEditor";

export default function CMSDashboard() {
  const [selectedPage, setSelectedPage] = useState("home");

  const pages = [
    { id: "site", name: "Globalt / Footer", icon: Layout },
    { id: "home", name: "Startsida", icon: Layout },
    { id: "statutes", name: "Stadgar", icon: Layout },
    { id: "documents", name: "Dokument", icon: Layout },
    { id: "calendar", name: "Kalender", icon: Layout },
    { id: "gallery", name: "Bildgalleri", icon: Image },
    { id: "events", name: "Evenemang", icon: Layout },
    { id: "folkspel", name: "Folkspel", icon: Layout },
    { id: "login", name: "Inloggning", icon: Layout },
    { id: "reset-password", name: "Återställ lösenord", icon: Layout },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Content Management System</h2>
        <p className="text-gray-600">Hantera allt innehåll på webbplatsen</p>
      </div>

      <Tabs defaultValue="pages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pages">
            <Layout className="mr-2 h-4 w-4" />
            Sidor
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Inställningar
          </TabsTrigger>
          <TabsTrigger value="board">
            <Users className="mr-2 h-4 w-4" />
            Styrelse
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="mt-6">
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5 mb-6">
            {pages.map((page) => {
              const Icon = page.icon;
              return (
                <Card
                  key={page.id}
                  className={`cursor-pointer transition-all ${
                    selectedPage === page.id
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedPage(page.id)}
                >
                  <CardHeader className="pb-3">
                    <Icon className="h-8 w-8 mb-2 text-blue-600" />
                    <CardTitle className="text-lg">{page.name}</CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <PageEditor page={selectedPage} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SiteSettingsEditor />
        </TabsContent>

        <TabsContent value="board" className="mt-6">
          <BoardMembersEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
