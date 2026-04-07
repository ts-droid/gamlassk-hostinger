import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { GripVertical, Plus, Pencil, Trash2, Eye, EyeOff, Monitor } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RichTextEditor } from "@/components/RichTextEditor";
import { VersionHistory } from "@/components/admin/VersionHistory";

interface PageEditorProps {
  page: string;
}

interface ContentSection {
  id: number;
  page: string;
  sectionKey: string;
  type: string;
  content: string | null;
  order: number;
  published: number;
}

const PAGE_SECTION_TEMPLATES: Record<
  string,
  Array<{
    sectionKey: string;
    type: string;
    content: string;
    label: string;
    description: string;
  }>
> = {
  home: [
    {
      sectionKey: "news_section_title",
      type: "text",
      content: "Senaste nyheterna",
      label: "Nyhetsrubrik",
      description: "Rubriken ovanför nyhetskorten på startsidan.",
    },
    {
      sectionKey: "news_section_description",
      type: "text",
      content: "Här hittar du de senaste uppdateringarna, nyheterna och händelserna från föreningen.",
      label: "Nyhetsbeskrivning",
      description: "Ingressen under nyhetsrubriken på startsidan.",
    },
  ],
};

function SortableItem({ section, onEdit, onDelete, onTogglePublish }: {
  section: ContentSection;
  onEdit: (section: ContentSection) => void;
  onDelete: (id: number) => void;
  onTogglePublish: (id: number, published: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className={section.published === 0 ? "opacity-60" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <button
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="h-5 w-5 text-gray-400" />
              </button>
              <div>
                <CardTitle className="text-base">{section.sectionKey}</CardTitle>
                <p className="text-xs text-gray-500">{section.type}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onTogglePublish(section.id, section.published === 1 ? 0 : 1)}
                title={section.published === 1 ? "Dölj" : "Publicera"}
              >
                {section.published === 1 ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(section)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(section.id)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-700 line-clamp-3">
            {section.content || <span className="text-gray-400 italic">Inget innehåll</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PageEditor({ page }: PageEditorProps) {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [formData, setFormData] = useState({ sectionKey: "", type: "text", content: "" });
  const [showPreview, setShowPreview] = useState(false);

  const { data: contentData, refetch } = trpc.cms.getPageContent.useQuery({ page });

  const updateContentMutation = trpc.cms.updateContent.useMutation({
    onSuccess: () => {
      toast.success("Innehåll uppdaterat!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte uppdatera innehåll");
    },
  });

  const createContentMutation = trpc.cms.createContent.useMutation({
    onSuccess: () => {
      toast.success("Sektion skapad!");
      setIsCreateOpen(false);
      setFormData({ sectionKey: "", type: "text", content: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte skapa sektion");
    },
  });

  const deleteContentMutation = trpc.cms.deleteContent.useMutation({
    onSuccess: () => {
      toast.success("Sektion borttagen!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte ta bort sektion");
    },
  });

  useEffect(() => {
    if (contentData) {
      setSections(contentData as ContentSection[]);
    }
  }, [contentData]);

  const recommendedSections = PAGE_SECTION_TEMPLATES[page] || [];
  const missingRecommendedSections = recommendedSections.filter(
    (template) => !sections.some((section) => section.sectionKey === template.sectionKey),
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update order in database
        newItems.forEach((item, index) => {
          if (item.order !== index) {
            updateContentMutation.mutate({ id: item.id, order: index });
          }
        });

        return newItems;
      });
    }
  };

  const handleEdit = (section: ContentSection) => {
    setEditingSection(section);
    setFormData({
      sectionKey: section.sectionKey,
      type: section.type,
      content: section.content || "",
    });
  };

  const handleUpdate = () => {
    if (!editingSection) return;
    updateContentMutation.mutate({
      id: editingSection.id,
      content: formData.content,
    });
    setEditingSection(null);
  };

  const handleCreate = () => {
    if (!formData.sectionKey || !formData.content) {
      toast.error("Sektionsnyckel och innehåll är obligatoriska");
      return;
    }
    createContentMutation.mutate({
      page,
      sectionKey: formData.sectionKey,
      type: formData.type,
      content: formData.content,
      order: sections.length,
    });
  };

  const handleCreateRecommended = (template: (typeof recommendedSections)[number]) => {
    createContentMutation.mutate({
      page,
      sectionKey: template.sectionKey,
      type: template.type,
      content: template.content,
      order: sections.length,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Är du säker på att du vill ta bort denna sektion?")) {
      deleteContentMutation.mutate({ id });
    }
  };

  const handleTogglePublish = (id: number, published: number) => {
    updateContentMutation.mutate({ id, published });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Redigera innehåll för {page}</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Lägg till sektion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Skapa ny sektion</DialogTitle>
              <DialogDescription>
                Lägg till en ny innehållssektion på sidan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              <div>
                <Label htmlFor="sectionKey">Sektionsnyckel *</Label>
                <Input
                  id="sectionKey"
                  value={formData.sectionKey}
                  onChange={(e) => setFormData({ ...formData, sectionKey: e.target.value })}
                  placeholder="t.ex. hero, about, contact"
                />
              </div>
              <div>
                <Label htmlFor="type">Typ</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="text">Text</option>
                  <option value="html">HTML</option>
                  <option value="image">Bild URL</option>
                </select>
              </div>
              <div>
                <Label htmlFor="content">Innehåll *</Label>
                {formData.type === "html" ? (
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                  />
                ) : (
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    placeholder="Skriv innehållet här..."
                  />
                )}
              </div>
            </div>
            <DialogFooter className="border-t pt-4 mt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Avbryt
              </Button>
              <Button onClick={handleCreate}>
                Skapa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {missingRecommendedSections.length > 0 ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Föreslagna sektioner</CardTitle>
            <p className="text-sm text-gray-600">
              De här CMS-fälten används redan av sidan men finns inte skapade ännu.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {missingRecommendedSections.map((template) => (
              <div
                key={template.sectionKey}
                className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-white p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold">{template.label}</p>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  <p className="mt-1 text-xs text-gray-500">Nyckel: {template.sectionKey}</p>
                </div>
                <Button
                  onClick={() => handleCreateRecommended(template)}
                  disabled={createContentMutation.isPending}
                >
                  Lägg till
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {sections.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {sections.map((section) => (
                <SortableItem
                  key={section.id}
                  section={section}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTogglePublish={handleTogglePublish}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Inga sektioner än. Lägg till din första sektion!</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Redigera sektion</DialogTitle>
                <DialogDescription>
                  Uppdatera innehållet för {editingSection?.sectionKey}
                </DialogDescription>
              </div>
              {editingSection && (
                <VersionHistory
                  contentId={editingSection.id}
                  onRestore={() => {
                    refetch();
                    setEditingSection(null);
                  }}
                />
              )}
            </div>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="edit-content">Innehåll</Label>
              {formData.type === "html" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  {showPreview ? "Dölj förhandsvisning" : "Visa förhandsvisning"}
                </Button>
              )}
            </div>
            <div className={showPreview && formData.type === "html" ? "grid grid-cols-2 gap-4" : ""}>
              <div>
                {formData.type === "html" ? (
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                  />
                ) : (
                  <Textarea
                    id="edit-content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                  />
                )}
              </div>
              {showPreview && formData.type === "html" && (
                <div className="border rounded-lg p-4 bg-gray-50 overflow-y-auto max-h-[400px]">
                  <p className="text-xs text-gray-500 mb-2 font-semibold">Förhandsvisning:</p>
                  <div
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                    className="prose prose-sm max-w-none"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="border-t pt-4 mt-4">
            <Button variant="outline" onClick={() => setEditingSection(null)}>
              Avbryt
            </Button>
            <Button onClick={handleUpdate}>
              Spara ändringar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
