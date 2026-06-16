import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2, ImageOff, Layers, Check, Home, Banknote,
  Building2, DoorOpen, Play, Plus, Search, Filter, Grid2X2, Grid3X3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { fetchDesigns, deleteDesign } from '@/lib/supabase';
import type { Design } from '@/types';

const STYLE_FILTERS = ['All', 'Modern', 'Luxury', 'Minimal', 'Villa', 'Classic', 'Industrial', 'Scandinavian', 'Mediterranean'];

export default function GalleryPage() {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [viewDesign, setViewDesign] = useState<Design | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [gridSize, setGridSize] = useState<2 | 3>(3);

  useEffect(() => { loadDesigns(); }, []);

  const loadDesigns = async () => {
    try {
      setLoading(true);
      const data = await fetchDesigns();
      setDesigns(data);
    } catch {
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDesign(id);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      setViewDesign(null);
      toast.success('Design deleted');
    } catch {
      toast.error('Failed to delete design');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); }
      else {
        if (next.size >= 4) { toast.info('You can compare up to 4 designs'); return prev; }
        next.add(id);
      }
      return next;
    });
  };

  const getPreviewUrl = (design: Design) =>
    design.exterior_front_url || design.exterior_side_url || design.interior_living_url || '';

  const filteredDesigns = designs.filter((d) => {
    const matchesFilter = activeFilter === 'All' || d.params.style === activeFilter;
    const matchesSearch = search === '' ||
      d.params.style.toLowerCase().includes(search.toLowerCase()) ||
      d.params.location?.toLowerCase().includes(search.toLowerCase()) ||
      d.params.budget.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const compareDesigns = designs.filter((d) => selectedIds.has(d.id));

  if (loading) {
    return (
      <div className="min-h-0 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 px-4 md:px-8 py-8 md:py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-normal text-foreground mb-1">Your Design Gallery</h1>
            <p className="text-sm text-muted-foreground">
              {designs.length === 0 ? 'No saved designs yet.' : `${designs.length} saved design${designs.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {designs.length > 0 && (
              <Button
                variant={compareMode ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => { setCompareMode(!compareMode); setSelectedIds(new Set()); }}
              >
                <Layers className="w-4 h-4" />
                {compareMode ? 'Done' : 'Compare'}
              </Button>
            )}
            <Button size="sm" className="gap-2" onClick={() => navigate('/design')}>
              <Plus className="w-4 h-4" /> New Design
            </Button>
          </div>
        </div>

        {/* Search + Filters + Grid toggle */}
        {designs.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search designs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              {STYLE_FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeFilter === filter
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant={gridSize === 2 ? 'default' : 'ghost'}
                size="icon"
                className="w-8 h-8"
                onClick={() => setGridSize(2)}
              >
                <Grid2X2 className="w-4 h-4" />
              </Button>
              <Button
                variant={gridSize === 3 ? 'default' : 'ghost'}
                size="icon"
                className="w-8 h-8"
                onClick={() => setGridSize(3)}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Compare bar */}
        {compareMode && selectedIds.size > 0 && (
          <div className="mb-6 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
            <span className="text-sm text-foreground">
              <span className="font-medium">{selectedIds.size}</span> selected
              {selectedIds.size < 2 && ' — select at least 2 to compare'}
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
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <ImageOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No designs yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Create your first AI-generated home visualization and it will appear here.
            </p>
            <Button onClick={() => navigate('/design')} className="gap-2">
              <Plus className="w-4 h-4" /> Create Your First Design
            </Button>
          </div>
        )}

        {/* No results from filter */}
        {designs.length > 0 && filteredDesigns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No designs match your search or filter.</p>
            <button onClick={() => { setActiveFilter('All'); setSearch(''); }} className="text-sm text-primary hover:underline mt-2">
              Clear filters
            </button>
          </div>
        )}

        {/* Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridSize === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4 md:gap-5`}>
          {filteredDesigns.map((design) => {
            const previewUrl = getPreviewUrl(design);
            const isSelected = selectedIds.has(design.id);
            return (
              <Card
                key={design.id}
                className={`overflow-hidden group cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  compareMode && isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
                onClick={() => compareMode ? toggleSelect(design.id) : setViewDesign(design)}
              >
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Design preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageOff className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Style badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm font-medium">
                      {design.params.style}
                    </span>
                  </div>

                  {/* Compare checkbox */}
                  {compareMode && (
                    <div
                      className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                        isSelected ? 'bg-primary border-primary text-primary-foreground' : 'bg-background/80 border-border'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  )}

                  {/* Delete button */}
                  {!compareMode && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm"
                        onClick={(e) => { e.stopPropagation(); handleDelete(design.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}

                  {/* Virtual tour button on hover */}
                  {!compareMode && (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        className="gap-1.5 h-8 text-xs bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/virtual-tour', { state: { design } });
                        }}
                      >
                        <Play className="w-3 h-3" /> Tour
                      </Button>
                    </div>
                  )}
                </div>

                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {design.params.floors} floors</span>
                      <span className="flex items-center gap-1"><DoorOpen className="w-3 h-3" /> {design.params.rooms} rooms</span>
                      <span className="flex items-center gap-1"><Banknote className="w-3 h-3" /> {design.params.budget}</span>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">
                      {new Date(design.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {design.params.location && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Home className="w-3 h-3" /> {design.params.location}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Single View Dialog */}
      <Dialog open={!!viewDesign && selectedIds.size < 2} onOpenChange={(open) => { if (!open) setViewDesign(null); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-4xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Design Details</DialogTitle>
          </DialogHeader>
          {viewDesign && (
            <div className="pt-2 space-y-5">
              {/* Params */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{viewDesign.params.style}</span>
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">{viewDesign.params.budget}</span>
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">{viewDesign.params.floors} floors</span>
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">{viewDesign.params.rooms} rooms</span>
                {viewDesign.params.location && (
                  <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">{viewDesign.params.location}</span>
                )}
              </div>

              {/* Exterior */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-primary inline-block" /> Exterior
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { url: viewDesign.exterior_front_url, label: 'Front View' },
                    { url: viewDesign.exterior_side_url, label: 'Side View' },
                    { url: viewDesign.exterior_aerial_url, label: 'Aerial View' },
                  ].map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-muted relative group">
                      {img.url ? (
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs py-1 px-2 text-center">
                        {img.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interior */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-violet-500 inline-block" /> Interior
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { url: viewDesign.interior_living_url, label: 'Living Room' },
                    { url: viewDesign.interior_kitchen_url, label: 'Kitchen' },
                    { url: viewDesign.interior_bedroom_url, label: 'Bedroom' },
                    { url: viewDesign.interior_bathroom_url, label: 'Bathroom' },
                  ].map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-muted relative">
                      {img.url ? (
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs py-1 px-2 text-center">
                        {img.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => { setViewDesign(null); navigate('/virtual-tour', { state: { design: viewDesign } }); }}
                >
                  <Play className="w-4 h-4" /> Virtual Tour
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleDelete(viewDesign.id)}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={!!viewDesign && selectedIds.size >= 2} onOpenChange={(open) => { if (!open) setViewDesign(null); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-6xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Design Comparison</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {compareDesigns.map((design) => (
              <div key={design.id} className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{design.params.style}</span>
                  <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">{design.params.budget}</span>
                  <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">{design.params.floors} floors</span>
                  <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">{design.params.rooms} rooms</span>
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
                      <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-muted relative">
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs py-1 px-2 text-center">
                          {img.label}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}