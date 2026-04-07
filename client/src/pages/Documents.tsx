import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Eye, Lock } from "lucide-react";
import { getLoginUrl } from "@/const";
import { PageHero, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useCMSContent } from "@/hooks/useCMSContent";

const CATEGORY_LABELS = {
  stadgar: "Stadgar",
  protokoll: "Protokoll",
  informationsblad: "Informationsblad",
  arsmoten: "Årsmöten",
  ovrigt: "Övrigt",
};

export default function Documents() {
  const { getContent } = useCMSContent("documents");
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: documents, isLoading } = trpc.documents.list.useQuery();

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('sv-SE');
  };

  const getAccessLevelBadge = (level: string) => {
    if (level === 'public') return <span className="text-xs text-green-600">Publik</span>;
    if (level === 'members_only') return <span className="text-xs text-blue-600 flex items-center gap-1"><Lock className="h-3 w-3" />Endast medlemmar</span>;
    return <span className="text-xs text-red-600 flex items-center gap-1"><Lock className="h-3 w-3" />Admin</span>;
  };

  const filteredDocuments = selectedCategory
    ? documents?.filter((doc: any) => doc.category === selectedCategory)
    : documents;

  const groupedDocuments = filteredDocuments?.reduce((acc: any, doc: any) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <p className="text-center">{getContent("loading_text", "Laddar dokument...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader currentPath="/documents" />
      <PageHero
        title={getContent("hero_title", "Dokumentbibliotek")}
        description={getContent("hero_description", "Hitta stadgar, protokoll och andra viktiga dokument på samma plats.")}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!isAuthenticated && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Lock className="h-8 w-8 text-blue-600" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900">{getContent("login_notice_title", "Logga in för att se alla dokument")}</p>
                  <p className="text-sm text-blue-700">{getContent("login_notice_description", "Vissa dokument är endast tillgängliga för medlemmar.")}</p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                  <a href={getLoginUrl()}>{getContent("login_button_label", "Logga in")}</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="all" className="w-full">
          <div className="mb-6 overflow-x-auto pb-2">
            <TabsList className="inline-flex min-w-max">
            <TabsTrigger value="all" onClick={() => setSelectedCategory(null)}>
              {getContent("all_tab_label", "Alla dokument")}
            </TabsTrigger>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <TabsTrigger key={value} value={value} onClick={() => setSelectedCategory(value)}>
                {label}
              </TabsTrigger>
            ))}
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-6">
            {!documents || documents.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">{getContent("empty_state_title", "Inga dokument tillgängliga.")}</p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedDocuments || {}).map(([category, docs]: [string, any]) => (
                <div key={category}>
                  <h2 className="text-2xl font-bold mb-4">
                    {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                  </h2>
                  <div className="grid gap-4">
                    {docs.map((doc: any) => (
                      <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                {doc.title}
                                {getAccessLevelBadge(doc.accessLevel)}
                              </CardTitle>
                              {doc.description && (
                                <CardDescription className="mt-2">
                                  {doc.description}
                                </CardDescription>
                              )}
                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span>{getContent("file_size_label", "Storlek")}: {formatFileSize(doc.fileSize)}</span>
                                <span>{getContent("uploaded_label", "Uppladdad")}: {formatDate(doc.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full md:w-auto"
                                onClick={() => window.open(doc.fileUrl, '_blank')}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                {getContent("view_button_label", "Visa")}
                              </Button>
                              <Button
                                size="sm"
                                className="w-full md:w-auto"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = doc.fileUrl;
                                  link.download = doc.title + '.pdf';
                                  link.click();
                                }}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                {getContent("download_button_label", "Ladda ner")}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">{label}</h2>
              {filteredDocuments && filteredDocuments.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      {getContent("empty_category_title", "Inga dokument i denna kategori.")}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredDocuments?.map((doc: any) => (
                    <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                              {doc.title}
                              {getAccessLevelBadge(doc.accessLevel)}
                            </CardTitle>
                            {doc.description && (
                              <CardDescription className="mt-2">
                                {doc.description}
                              </CardDescription>
                            )}
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span>{getContent("file_size_label", "Storlek")}: {formatFileSize(doc.fileSize)}</span>
                              <span>{getContent("uploaded_label", "Uppladdad")}: {formatDate(doc.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full md:w-auto"
                              onClick={() => window.open(doc.fileUrl, '_blank')}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {getContent("view_button_label", "Visa")}
                            </Button>
                            <Button
                              size="sm"
                              className="w-full md:w-auto"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = doc.fileUrl;
                                link.download = doc.title + '.pdf';
                                link.click();
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {getContent("download_button_label", "Ladda ner")}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}
