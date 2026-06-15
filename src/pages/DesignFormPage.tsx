import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Banknote, Palette, Building2, DoorOpen, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { submitAllTasks } from '@/services/imageGeneration';
import type { DesignParams } from '@/types';

const BUDGET_OPTIONS = [
  'Under $200k',
  '$200k - $400k',
  '$400k - $600k',
  '$600k - $1M',
  'Over $1M',
];

const STYLE_OPTIONS = [
  'Modern',
  'Luxury',
  'Minimal',
  'Villa',
  'Classic',
  'Industrial',
  'Rustic',
  'Mediterranean',
  'Scandinavian',
  'Contemporary',
];

const PLOT_OPTIONS = [
  'Small (under 5,000 sq ft)',
  'Medium (5,000 - 10,000 sq ft)',
  'Large (10,000 - 20,000 sq ft)',
  'Estate (over 20,000 sq ft)',
];

const LOCATION_OPTIONS = [
  'United Kingdom',
  'United States',
  'Australia',
  'Canada',
  'UAE',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
];

interface LocationState {
  preset?: {
    style?: string;
    floors?: number;
    rooms?: number;
    budget?: string;
    location?: string;
  };
}

export default function DesignFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<DesignParams>({
    plot_size: PLOT_OPTIONS[1],
    budget: BUDGET_OPTIONS[2],
    style: STYLE_OPTIONS[0],
    floors: 2,
    rooms: 5,
    location: '',
  });

  useEffect(() => {
    if (state?.preset) {
      setParams((prev) => ({
        ...prev,
        style: state.preset!.style && STYLE_OPTIONS.includes(state.preset!.style!) ? state.preset!.style! : prev.style,
        floors: state.preset!.floors ?? prev.floors,
        rooms: state.preset!.rooms ?? prev.rooms,
        budget: state.preset!.budget && BUDGET_OPTIONS.includes(state.preset!.budget!) ? state.preset!.budget! : prev.budget,
        location: state.preset!.location ?? prev.location,
      }));
    }
  }, [state]);

  const updateParam = <K extends keyof DesignParams>(key: K, value: DesignParams[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tasks = await submitAllTasks(params);
      navigate('/results', { state: { tasks, params } });
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-0 px-4 md:px-8 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-normal text-foreground mb-2 text-balance">
            Design Your Future Home
          </h1>
          <p className="text-muted-foreground text-pretty">
            Tell us about your vision and our AI will bring it to life with 7 stunning views.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Plot Size */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Home className="w-4 h-4 text-primary" /> Plot Size
            </Label>
            <Select value={params.plot_size} onValueChange={(v) => updateParam('plot_size', v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLOT_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Banknote className="w-4 h-4 text-primary" /> Budget Range
            </Label>
            <Select value={params.budget} onValueChange={(v) => updateParam('budget', v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Style */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Palette className="w-4 h-4 text-primary" /> House Style
            </Label>
            <Select value={params.style} onValueChange={(v) => updateParam('style', v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLE_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Floors */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="w-4 h-4 text-primary" />
              Number of Floors: <span className="text-primary font-semibold ml-1">{params.floors}</span>
            </Label>
            <Slider
              value={[params.floors]}
              onValueChange={([v]) => updateParam('floors', v)}
              min={1} max={4} step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground px-0.5">
              {[1, 2, 3, 4].map((n) => <span key={n}>{n}</span>)}
            </div>
          </div>

          {/* Rooms */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <DoorOpen className="w-4 h-4 text-primary" />
              Number of Rooms: <span className="text-primary font-semibold ml-1">{params.rooms}</span>
            </Label>
            <Slider
              value={[params.rooms]}
              onValueChange={([v]) => updateParam('rooms', v)}
              min={2} max={12} step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground px-0.5">
              {[2, 4, 6, 8, 10, 12].map((n) => <span key={n}>{n}</span>)}
            </div>
          </div>

          {/* Location (optional) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4 text-primary" />
              Location <span className="text-muted-foreground font-normal text-xs ml-1">(optional)</span>
            </Label>
            <Select value={params.location || ''} onValueChange={(v) => updateParam('location', v === 'any' ? '' : v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any location</SelectItem>
                {LOCATION_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full gap-2 text-base" disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <>Generate My Home Visualization <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Generates 7 images (exterior + interior). May take up to 10 minutes.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
