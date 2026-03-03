import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ArrowLeft, Edit, GripVertical, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Helper to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "published": return "default";
    case "draft": return "secondary";
    case "review": return "destructive"; // Using destructive for review to stand out
    case "archived": return "outline";
    default: return "outline";
  }
};

export default function CountryGuideEditor() {
  const { countryCode } = useParams<{ countryCode: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState<any>({});

  // Fetch country details for title
  const { data: country } = trpc.countries.get.useQuery(
    { countryCode: countryCode || "" },
    { enabled: !!countryCode }
  );

  // Fetch chapters (admin view)
  const { data: chapters, isLoading, refetch } = trpc.countryGuides.listAllChapters.useQuery(
    { countryCode: countryCode || "" },
    { enabled: !!countryCode }
  );

  const upsertMutation = trpc.countryGuides.upsertChapter.useMutation({
    onSuccess: () => {
      toast.success(t("common.saved"));
      setIsDialogOpen(false);
      setEditingChapter(null);
      setFormData({});
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const generateMutation = trpc.countryGuides.generateContent.useMutation({
    onSuccess: (data) => {
      setFormData((prev: any) => ({
        ...prev,
        contentEn: data.contentEn,
        contentZh: data.contentZh,
      }));
      toast.success(t("common.generated"));
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const handleEdit = (chapter: any) => {
    setEditingChapter(chapter);
    setFormData({
      ...chapter,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    const newChapter = {
      countryCode: countryCode,
      part: 1,
      sortOrder: (chapters?.length || 0) + 1,
      status: "draft",
      version: "2026-Q1",
      chapterKey: "",
      titleEn: "",
      titleZh: "",
      contentEn: "",
      contentZh: ""
    };
    setEditingChapter(null);
    setFormData(newChapter);
    setIsDialogOpen(true);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      id: editingChapter?.id,
      countryCode: countryCode!,
      part: Number(formData.part),
      chapterKey: formData.chapterKey,
      titleEn: formData.titleEn,
      titleZh: formData.titleZh,
      contentEn: formData.contentEn,
      contentZh: formData.contentZh,
      sortOrder: Number(formData.sortOrder),
      version: formData.version,
      status: formData.status,
    };

    upsertMutation.mutate(data);
  };

  if (!countryCode) return null;

  return (
    <Layout title={`${t("country_guide_admin.editor_title")} - ${country?.countryName || countryCode}`}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/knowledge/country-guides")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {country?.countryName} <Badge variant="outline">{countryCode}</Badge>
              </h1>
              <p className="text-muted-foreground">{t("country_guide_admin.editor_subtitle")}</p>
            </div>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {t("country_guide_admin.add_chapter")}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {chapters?.map((chapter) => (
              <Card key={chapter.id} className="group hover:bg-accent/5 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="cursor-move text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">Part {chapter.part}</Badge>
                      <span className="font-semibold">{chapter.titleEn}</span>
                      <span className="text-muted-foreground text-sm">/ {chapter.titleZh}</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-2 items-center">
                      <Badge variant={getStatusColor(chapter.status) as any}>{chapter.status}</Badge>
                      <span>Key: {chapter.chapterKey}</span>
                      <span>Ver: {chapter.version}</span>
                      <span>Order: {chapter.sortOrder}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(chapter)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {chapters?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                {t("common.noData")}
              </div>
            )}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingChapter?.id ? t("country_guide_admin.edit_chapter") : t("country_guide_admin.add_chapter")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chapter Key (Slug)</Label>
                  <Input 
                    value={formData.chapterKey || ""} 
                    onChange={(e) => handleInputChange("chapterKey", e.target.value)}
                    required 
                    placeholder="e.g. overview, taxes" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={formData.status || "draft"} 
                    onValueChange={(val) => handleInputChange("status", val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Part Number</Label>
                  <Input 
                    type="number" 
                    value={formData.part || ""} 
                    onChange={(e) => handleInputChange("part", e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input 
                    type="number" 
                    value={formData.sortOrder || ""} 
                    onChange={(e) => handleInputChange("sortOrder", e.target.value)}
                    required 
                  />
                </div>
                 <div className="space-y-2">
                  <Label>Version</Label>
                  <Input 
                    value={formData.version || ""} 
                    onChange={(e) => handleInputChange("version", e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title (EN)</Label>
                  <Input 
                    value={formData.titleEn || ""} 
                    onChange={(e) => handleInputChange("titleEn", e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (ZH)</Label>
                  <Input 
                    value={formData.titleZh || ""} 
                    onChange={(e) => handleInputChange("titleZh", e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Content (EN) - Markdown</Label>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Supports Markdown</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="h-6 text-xs gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                      onClick={() => {
                        if (!countryCode || !formData.titleEn) {
                          toast.error("Please enter a country and title first");
                          return;
                        }
                        generateMutation.mutate({ 
                          countryCode, 
                          topic: formData.titleEn 
                        });
                      }}
                      disabled={generateMutation.isPending}
                    >
                      {generateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      Generate with AI
                    </Button>
                  </div>
                  <Textarea 
                    className="h-64 font-mono" 
                    value={formData.contentEn || ""} 
                    onChange={(e) => handleInputChange("contentEn", e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content (ZH) - Markdown</Label>
                  <Textarea 
                    className="h-64 font-mono" 
                    value={formData.contentZh || ""} 
                    onChange={(e) => handleInputChange("contentZh", e.target.value)}
                    required 
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t("common.cancel")}</Button>
                <Button type="submit" disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("common.save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
