import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, ImageOff, Layers, Check, Home, Banknote, Building2, DoorOpen, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { fetchDesigns, deleteDesign } from '@/lib/supabase';
import type { Design } from '@/types';

export default function GalleryPage() {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [viewDesign, setViewDesign] = useState<Design | null>(null);

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      setLoading(true);
      const data = await fetchDesigns();
      setDesigns(data);
    } catch (err) {
      console.error('Failed to load designs:', err);
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDesign(id);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success('Design deleted');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete design');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 4) {
          toast.info('You can compare up to 4 designs at a time');
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const compareDesigns = designs.filter((d) => selectedIds.has(d.id));

  const getPreviewUrl = (design: Design) => {
    return (
      design.exterior_front_url ||
      design.exterior_side_url ||
      design.exterior_aerial_url ||
      design.interior_living_url ||
      design.interior_kitchen_url ||
      design.interior_bedroom_url ||
      ''
    );
  };

  if (loading) {
    return (
      <div className="min-h-0 px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
          <div className="animate-pulse text-muted-foreground">Loading gallery...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 px-4 md:px-8 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-normal text-foreground mb-1 text-balance">
              Your Design Gallery
            </h1>
            <p className="text-sm text-muted-foreground text-pretty">
              {designs.length === 0
                ? 'No saved designs yet. Create your first design!'
                : `${designs.length} saved design${designs.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {designs.length > 0 && (
              <Button
                variant={compareMode ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => {
                  setCompareMode(!compareMode);
                  setSelectedIds(new Set());
                }}
              >
                <Layers className="w-4 h-4" />
                {compareMode ? 'Done' : 'Compare'}
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate('/design')}>
              <ArrowLeft className="w-4 h-4" /> New Design
            </Button>
          </div>
        </div>

        {/* Compare action bar */}
        {compareMode && selectedIds.size > 0 && (
          <div className="mb-6 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
            <span className="text-sm text-foreground">
              <span className="font-medium">{selectedIds.size}</span> selected
              {selectedIds.size < 2 && ' (select at least 2 to compare)'}
            </span>
            {selectedIds.size >= 2 && (
              <Button size="sm" className="gap-2" onClick={() => setViewDesign(compareDesigns[0])}>
                <Layers className="w-4 h-4" /> Compare Now
              </Button>
            )}
          </div>
        )}

        {/* Empty state */}
        {designs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ImageOff className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No designs yet</h3>
            <p className="text-sm text-muted-foreground mb-6 text-pretty max-w-sm">
              Create your first AI-generated home visualization and it will appear here.
            </p>
            <Button onClick={() => navigate('/design')}>Create Your First Design</Button>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {designs.map((design) => {
            const previewUrl = getPreviewUrl(design);
            const isSelected = selectedIds.has(design.id);

            return (
              <Card
                key={design.id}
                className={`overflow-hidden group cursor-pointer transition-all ${
                  compareMode && isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  if (compareMode) {
                    toggleSelect(design.id);
                  } else {
                    setViewDesign(design);
                  }
                }}
              >
                <div className="aspect-[4/3] bg-muted relative">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Design preview"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageOff className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  {compareMode && (
                    <div
                      className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background/80 border-border'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(design.id);
                      }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  )}
                  {!compareMode && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 bg-background/80 hover:bg-background text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(design.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Home className="w-3 h-3" /> {design.params.style}</span>
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {design.params.floors}f</span>
                    <span className="flex items-center gap-1"><DoorOpen className="w-3 h-3" /> {design.params.rooms}r</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(design.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Comparison Dialog */}
      <Dialog open={!!viewDesign && selectedIds.size >= 2} onOpenChange={(open) => { if (!open) setViewDesign(null); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-6xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-balance">Design Comparison</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {compareDesigns.map((design) => (
              <div key={design.id} className="space-y-3">
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground pb-2 border-b border-border">
                  <span className="font-medium text-foreground">{design.params.style}</span>
                  <span>{design.params.plot_size}</span>
                  <span>{design.params.budget}</span>
                  <span>{design.params.floors} floors</span>
                  <span>{design.params.rooms} rooms</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { url: design.exterior_front_url, label: 'Front' },
                    { url: design.exterior_side_url, label: 'Side' },
                    { url: design.exterior_aerial_url, label: 'Aerial' },
                    { url: design.interior_living_url, label: 'Living' },
                    { url: design.interior_kitchen_url, label: 'Kitchen' },
                    { url: design.interior_bedroom_url, label: 'Bedroom' },
                    { url: design.interior_bathroom_url, label: 'Bathroom' },
                  ].map((img, i) =>
                    img.url ? (
                      <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Single View Dialog */}
      <Dialog open={!!viewDesign && selectedIds.size < 2} onOpenChange={(open) => { if (!open) setViewDesign(null); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-4xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-balance">Design Details</DialogTitle>
          </DialogHeader>
          {viewDesign && (
            <div className="pt-4 space-y-6">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground pb-4 border-b border-border">
                <span className="font-medium text-foreground text-base">{viewDesign.params.style}</span>
                <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5" /> {viewDesign.params.plot_size}</span>
                <span className="flex items-center gap-1"><Banknote className="w-3.5 h-3.5" /> {viewDesign.params.budget}</span>
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {viewDesign.params.floors} floors</span>
                <span className="flex items-center gap-1"><DoorOpen className="w-3.5 h-3.5" /> {viewDesign.params.rooms} rooms</span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Exterior</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { url: viewDesign.exterior_front_url, label: 'Front View' },
                    { url: viewDesign.exterior_side_url, label: 'Side View' },
                    { url: viewDesign.exterior_aerial_url, label: 'Aerial View' },
                  ].map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                      {img.url ? (
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                          {img.label} — Not generated
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Interior</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { url: viewDesign.interior_living_url, label: 'Living Room' },
                    { url: viewDesign.interior_kitchen_url, label: 'Kitchen' },
                    { url: viewDesign.interior_bedroom_url, label: 'Master Bedroom' },
                    { url: viewDesign.interior_bathroom_url, label: 'Bathroom' },
                  ].map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                      {img.url ? (
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                          {img.label} — Not generated
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setViewDesign(null);
                    navigate('/virtual-tour', { state: { design: viewDesign } });
                  }}
                >
                  <Play className="w-4 h-4" /> Virtual Tour
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDelete(viewDesign.id)}>
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
