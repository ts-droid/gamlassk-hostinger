import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Eye, Lock } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useSiteBranding } from "@/hooks/useCMSContent";

const CATEGORY_LABELS = {
  stadgar: "Stadgar",
  protokoll: "Protokoll",
  informationsblad: "Informationsblad",
  arsmoten: "Årsmöten",
  ovrigt: "Övrigt",
};

export default function Documents() {
  const { siteLogo, siteName } = useSiteBranding();
  const { user, isAuthenticated } = useAuth();
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
          <p className="text-center">Laddar dokument...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-4 flex items-center gap-4">
            <img src={siteLogo} alt={siteName} className="h-16 w-16 rounded-md object-cover" />
            <div>
              <h1 className="text-4xl font-bold">Dokumentbibliotek</h1>
              <p className="text-sm text-blue-100">{siteName}</p>
            </div>
          </div>
          <p className="text-xl text-blue-100">
            Hitta stadgar, protokoll och andra viktiga dokument
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!isAuthenticated && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Lock className="h-8 w-8 text-blue-600" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900">Logga in för att se alla dokument</p>
                  <p className="text-sm text-blue-700">Vissa dokument är endast tillgängliga för medlemmar.</p>
                </div>
                <Button asChild>
                  <a href={getLoginUrl()}>Logga in</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all" onClick={() => setSelectedCategory(null)}>
              Alla dokument
            </TabsTrigger>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <TabsTrigger key={value} value={value} onClick={() => setSelectedCategory(value)}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {!documents || documents.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Inga dokument tillgängliga.</p>
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
                          <div className="flex items-start justify-between">
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
                              <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                                <span>Storlek: {formatFileSize(doc.fileSize)}</span>
                                <span>Uppladdad: {formatDate(doc.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(doc.fileUrl, '_blank')}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Visa
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = doc.fileUrl;
                                  link.download = doc.title + '.pdf';
                                  link.click();
                                }}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Ladda ner
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
                      Inga dokument i denna kategori.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredDocuments?.map((doc: any) => (
                    <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
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
                            <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                              <span>Storlek: {formatFileSize(doc.fileSize)}</span>
                              <span>Uppladdad: {formatDate(doc.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.fileUrl, '_blank')}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Visa
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = doc.fileUrl;
                                link.download = doc.title + '.pdf';
                                link.click();
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Ladda ner
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
    </div>
  );
}
