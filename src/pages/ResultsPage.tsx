import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Download, Save, RefreshCw, Loader2, ImageOff, CheckCircle,
  Home, ArrowLeft, Play, Share2, Sparkles, Zap, TrendingDown, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { pollAllTasks } from '@/services/imageGeneration';
import { saveDesign } from '@/lib/supabase';
import type { Design, DesignParams, GenerationTask, GenerationView } from '@/types';

const VIEW_LABELS: Record<GenerationView, string> = {
  exterior_front: 'Front View',
  exterior_side: 'Side View',
  exterior_aerial: 'Aerial View',
  interior_living: 'Living Room',
  interior_kitchen: 'Kitchen',
  interior_bedroom: 'Master Bedroom',
  interior_bathroom: 'Bathroom',
};

interface LocationState {
  tasks: GenerationTask[];
  params: DesignParams;
}

interface ViewSection {
  title: string;
  views: GenerationView[];
}

const VIEW_SECTIONS: ViewSection[] = [
  { title: 'Exterior', views: ['exterior_front', 'exterior_side', 'exterior_aerial'] },
  { title: 'Living Room', views: ['interior_living'] },
  { title: 'Kitchen', views: ['interior_kitchen'] },
  { title: 'Bedroom', views: ['interior_bedroom'] },
  { title: 'Bathroom', views: ['interior_bathroom'] },
];

const REGEN_VARIANTS = [
  { label: 'More Luxury', icon: Sparkles, modifier: 'luxury' },
  { label: 'More Modern', icon: Zap, modifier: 'modern' },
  { label: 'More Affordable', icon: TrendingDown, modifier: 'affordable' },
] as const;

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [tasks, setTasks] = useState<GenerationTask[]>(state?.tasks || []);
  const [params, setParams] = useState<DesignParams | null>(state?.params || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const pollingStarted = useRef(false);

  const completedCount = tasks.filter((t) => t.status !== 'pending').length;
  const successCount = tasks.filter((t) => t.status === 'success').length;
  const isComplete = tasks.length > 0 && completedCount === tasks.length;

  useEffect(() => {
    if (!state) { navigate('/design'); return; }
    if (tasks.length > 0 && !pollingStarted.current) {
      pollingStarted.current = true;
      pollAllTasks(tasks, setTasks).catch(() => {
        toast.error('Some generations failed. Please try again.');
      });
    }
  }, [state, navigate, tasks]);

  const buildDesignPayload = (): Omit<Design, 'id' | 'created_at'> => ({
    params: params!,
    exterior_front_url: tasks.find((t) => t.view === 'exterior_front')?.imageUrl ?? null,
    exterior_side_url: tasks.find((t) => t.view === 'exterior_side')?.imageUrl ?? null,
    exterior_aerial_url: tasks.find((t) => t.view === 'exterior_aerial')?.imageUrl ?? null,
    interior_living_url: tasks.find((t) => t.view === 'interior_living')?.imageUrl ?? null,
    interior_kitchen_url: tasks.find((t) => t.view === 'interior_kitchen')?.imageUrl ?? null,
    interior_bedroom_url: tasks.find((t) => t.view === 'interior_bedroom')?.imageUrl ?? null,
    interior_bathroom_url: tasks.find((t) => t.view === 'interior_bathroom')?.imageUrl ?? null,
  });

  const handleSave = async () => {
    if (!params || saved) return;
    setSaving(true);
    try {
      await saveDesign(buildDesignPayload());
      setSaved(true);
      toast.success('Design saved to your gallery!');
    } catch {
      toast.error('Failed to save design. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    const successTasks = tasks.filter((t) => t.imageUrl);
    for (const task of successTasks) {
      if (!task.imageUrl) continue;
      try {
        const response = await fetch(task.imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${task.view}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch { console.error(`Failed to download ${task.view}`); }
    }
    toast.success('Downloads started!');
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.info(`Share this link: ${window.location.href}`);
    }
  };

  const handleRegenerate = (modifier: string) => {
    if (!params) return;
    const styleMap: Record<string, Partial<DesignParams>> = {
      luxury: { style: 'Luxury', budget: 'Over $1M' },
      modern: { style: 'Modern' },
      affordable: { budget: 'Under $200k', style: 'Minimal' },
    };
    navigate('/design', { state: { preset: { ...params, ...styleMap[modifier] } } });
  };

  const handleVirtualTour = () => {
    if (!params) return;
    const design: Design = {
      id: '',
      created_at: new Date().toISOString(),
      ...buildDesignPayload(),
    };
    navigate('/virtual-tour', { state: { design } });
  };

  if (!state) return null;

  return (
    <div className="min-h-0 px-3 md:px-8 py-5 md:py-12">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col gap-3 mb-5 md:mb-8">
          <Button variant="ghost" size="sm" className="gap-1 w-fit -ml-2" onClick={() => navigate('/design')}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl font-normal text-foreground mb-1">Your Generated Design</h1>
              {params && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs md:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Home className="w-3 h-3" /> {params.style}</span>
                  <span>{params.plot_size}</span>
                  <span>{params.budget}</span>
                  <span>{params.floors} floors</span>
                  <span>{params.rooms} rooms</span>
                  {params.location && <span>{params.location}</span>}
                </div>
              )}
            </div>

            {/* Action buttons */}
            {isComplete && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs" onClick={handleShare}>
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs" onClick={handleDownload} disabled={successCount === 0}>
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs" onClick={handleSave} disabled={saving || saved}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  {saved ? 'Saved' : 'Save'}
                </Button>
                <Button size="sm" className="gap-1.5 h-9 text-xs" disabled={successCount === 0} onClick={handleVirtualTour}>
                  <Play className="w-3.5 h-3.5" /> Virtual Tour
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        {!isComplete && (
          <div className="mb-6 p-4 rounded-xl bg-muted border border-border">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground">
                Loading images… {completedCount} / {tasks.length}
              </span>
            </div>
            <div className="w-full h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-6 md:space-y-10">
          {VIEW_SECTIONS.map((section) => {
            const sectionTasks = section.views
              .map((v) => tasks.find((t) => t.view === v))
              .filter(Boolean) as GenerationTask[];
            if (sectionTasks.length === 0) return null;

            const colClass = sectionTasks.length === 1
              ? 'grid-cols-1 max-w-lg'
              : sectionTasks.length === 2
              ? 'grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-3';

            return (
              <div key={section.title}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-base md:text-xl font-normal text-foreground">{section.title}</h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className={`grid ${colClass} gap-3`}>
                  {sectionTasks.map((task) => (
                    <ImageCard key={task.view} task={task} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom actions */}
        {isComplete && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 h-9 w-full sm:w-auto">
                  <RefreshCw className="w-4 h-4" /> Regenerate <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {REGEN_VARIANTS.map(({ label, icon: Icon, modifier }) => (
                  <DropdownMenuItem key={modifier} onClick={() => handleRegenerate(modifier)} className="gap-2 cursor-pointer">
                    <Icon className="w-4 h-4" /> {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="gap-2 h-9 flex-1 sm:flex-none" onClick={() => navigate('/design')}>
                New Design
              </Button>
              <Button className="gap-2 h-9 flex-1 sm:flex-none" onClick={() => navigate('/gallery')}>
                Gallery <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageCard({ task }: { task: GenerationTask }) {
  const label = VIEW_LABELS[task.view];
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-[4/3] bg-muted relative flex-shrink-0">
        {task.status === 'pending' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Loading…</span>
          </div>
        )}
        {task.status === 'failed' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
            <ImageOff className="w-7 h-7 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{task.error || 'Failed'}</span>
          </div>
        )}
        {task.status === 'success' && task.imageUrl && (
          <img src={task.imageUrl} alt={label} className="w-full h-full object-cover" loading="lazy" />
        )}
      </div>
      <CardContent className="p-2 md:p-3">
        <p className="text-xs md:text-sm font-medium text-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}