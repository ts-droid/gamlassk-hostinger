import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, User, Phone, Mail } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
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

interface BoardMember {
  id: number;
  name: string;
  role: string;
  phone: string | null;
  email: string | null;
  photo: string | null;
  order: number;
  active: number;
}

function SortableBoardMember({ member, onEdit, onDelete }: {
  member: BoardMember;
  onEdit: (member: BoardMember) => void;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="h-5 w-5 text-gray-400" />
              </button>
              {member.photo ? (
                <div 
                  className="h-16 w-16 rounded-full overflow-hidden"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                    backgroundSize: '10px 10px',
                    backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
                  }}
                >
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <p className="text-sm text-gray-600">{member.role}</p>
                {member.phone && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Phone className="h-3 w-3" />
                    {member.phone}
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Mail className="h-3 w-3" />
                    {member.email}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(member)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(member.id)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function BoardMembersEditor() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    photo: "",
  });

  const { data: membersData, refetch } = trpc.cms.getAllBoardMembers.useQuery();

  const createMutation = trpc.cms.createBoardMember.useMutation({
    onSuccess: () => {
      toast.success("Styrelsemedlem tillagd!");
      setIsCreateOpen(false);
      setFormData({ name: "", role: "", phone: "", email: "", photo: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte lägga till styrelsemedlem");
    },
  });

  const updateMutation = trpc.cms.updateBoardMember.useMutation({
    onSuccess: () => {
      toast.success("Styrelsemedlem uppdaterad!");
      setEditingMember(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte uppdatera styrelsemedlem");
    },
  });

  const deleteMutation = trpc.cms.deleteBoardMember.useMutation({
    onSuccess: () => {
      toast.success("Styrelsemedlem borttagen!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte ta bort styrelsemedlem");
    },
  });

  useEffect(() => {
    if (membersData) {
      setMembers(membersData as BoardMember[]);
    }
  }, [membersData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMembers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update order in database
        newItems.forEach((item, index) => {
          if (item.order !== index) {
            updateMutation.mutate({ id: item.id, order: index });
          }
        });

        return newItems;
      });
    }
  };

  const handleCreate = () => {
    if (!formData.name || !formData.role) {
      toast.error("Namn och roll är obligatoriska");
      return;
    }
    createMutation.mutate({
      ...formData,
      order: members.length,
    });
  };

  const handleEdit = (member: BoardMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      phone: member.phone || "",
      email: member.email || "",
      photo: member.photo || "",
    });
  };

  const handleUpdate = () => {
    if (!editingMember) return;
    updateMutation.mutate({
      id: editingMember.id,
      ...formData,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Är du säker på att du vill ta bort denna styrelsemedlem?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Styrelsemedlemmar</h3>
          <p className="text-sm text-gray-600">Hantera styrelsemedlemmar och deras information</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Lägg till medlem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Lägg till styrelsemedlem</DialogTitle>
              <DialogDescription>
                Fyll i information om den nya styrelsemedlemmen
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Foto</Label>
                <ImageUpload
                  value={formData.photo}
                  onChange={(url) => setFormData({ ...formData, photo: url })}
                />
              </div>
              <div>
                <Label htmlFor="name">Namn *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="t.ex. Göran Söderberg"
                />
              </div>
              <div>
                <Label htmlFor="role">Roll *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="t.ex. Ordförande"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefonnummer</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="070-123 45 67"
                />
              </div>
              <div>
                <Label htmlFor="email">E-postadress</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="namn@example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Avbryt
              </Button>
              <Button onClick={handleCreate}>
                Lägg till
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {members.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={members.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {members.map((member) => (
                <SortableBoardMember
                  key={member.id}
                  member={member}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Inga styrelsemedlemmar än. Lägg till din första medlem!</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Redigera styrelsemedlem</DialogTitle>
            <DialogDescription>
              Uppdatera information för {editingMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Foto</Label>
              <ImageUpload
                value={formData.photo}
                onChange={(url) => setFormData({ ...formData, photo: url })}
              />
            </div>
            <div>
              <Label htmlFor="edit-name">Namn *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Roll *</Label>
              <Input
                id="edit-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Telefonnummer</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">E-postadress</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>
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
