import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Eye, Layers, Download,
  Play, MapPin, Banknote, Palette, Home, Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STYLE_OPTIONS = ['Modern', 'Luxury', 'Minimal', 'Villa', 'Classic', 'Industrial', 'Scandinavian', 'Mediterranean'];
const BUDGET_OPTIONS = ['Under $200k', '$200k–$400k', '$400k–$600k', '$600k–$1M', 'Over $1M'];
const ROOMS_OPTIONS = ['1–2 Rooms', '3–4 Rooms', '5–6 Rooms', '7–8 Rooms', '9+ Rooms'];
const LOCATION_OPTIONS = ['United Kingdom', 'United States', 'Australia', 'Canada', 'UAE', 'Germany', 'France', 'Spain'];

const sampleImages = [
  {
    url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80&fit=crop',
    label: 'Modern Exterior',
    tag: 'United Kingdom',
  },
  {
    url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80&fit=crop',
    label: 'Living Room',
    tag: 'Interior',
  },
  {
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&fit=crop',
    label: 'Kitchen',
    tag: 'Interior',
  },
  {
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&fit=crop',
    label: 'Luxury Villa',
    tag: 'Exterior',
  },
  {
    url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80&fit=crop',
    label: 'Master Bedroom',
    tag: 'Interior',
  },
  {
    url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80&fit=crop',
    label: 'Bathroom',
    tag: 'Interior',
  },
];

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'State-of-the-art AI creates photorealistic house visualizations from your specs.',
    color: 'bg-violet-500/10 text-violet-500',
  },
  {
    icon: Eye,
    title: '7 Views Per Design',
    description: 'Exterior front, side, aerial + living room, kitchen, bedroom, and bathroom.',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: Layout,
    title: 'Floor Plan Builder',
    description: 'Design your floor plan by dragging and dropping rooms onto a grid.',
    color: 'bg-amber-500/10 text-amber-500',
  },
  {
    icon: Download,
    title: 'Save & Download',
    description: 'Keep all designs in your gallery and download high-resolution images.',
    color: 'bg-green-500/10 text-green-500',
  },
];

const stats = [
  { value: '7', label: 'Views per design' },
  { value: '10+', label: 'House styles' },
  { value: '10', label: 'Countries' },
  { value: '100%', label: 'Free to use' },
];

function useCountUp(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [style, setStyle] = useState('');
  const [budget, setBudget] = useState('');
  const [rooms, setRooms] = useState('');
  const [location, setLocation] = useState('');
  const [visible, setVisible] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setVisible(true);
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % sampleImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickGenerate = () => {
    navigate('/design', {
      state: {
        preset: {
          style: style || 'Modern',
          budget: budget || '$400k–$600k',
          rooms: rooms ? parseInt(rooms.split('–')[0]) || 5 : 5,
          location: location || '',
        },
      },
    });
  };

  const allFilled = style && budget && rooms;

  return (
    <div className="min-h-0 overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 px-4 md:px-8 pt-10 md:pt-16 pb-12 md:pb-20">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative">
          {/* Badge */}
          <div className={`flex justify-center mb-5 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Home Visualization
            </div>
          </div>

          {/* Headline */}
          <h1 className={`text-3xl md:text-5xl lg:text-6xl font-normal text-foreground mb-4 leading-tight text-balance text-center transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Visualize Your{' '}
            <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              Dream Home
            </span>{' '}
            Before It Is Built
          </h1>

          <p className={`text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty leading-relaxed text-center transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Pick your style, set your budget, and get real photorealistic house photos in seconds.
          </p>

          {/* Quick-input card */}
          <div className={`bg-card border border-border rounded-2xl shadow-lg p-5 md:p-7 max-w-3xl mx-auto transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">
              Quick Design Generator
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Palette className="w-3.5 h-3.5 text-primary" /> Style
                </label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="w-full h-10 text-sm">
                    <SelectValue placeholder="Modern" />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLE_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Banknote className="w-3.5 h-3.5 text-primary" /> Budget
                </label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger className="w-full h-10 text-sm">
                    <SelectValue placeholder="$400k–$600k" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Home className="w-3.5 h-3.5 text-primary" /> Rooms
                </label>
                <Select value={rooms} onValueChange={setRooms}>
                  <SelectTrigger className="w-full h-10 text-sm">
                    <SelectValue placeholder="5–6 Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOMS_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Location
                </label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-full h-10 text-sm">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-7 shadow-md hover:shadow-lg transition-shadow" onClick={handleQuickGenerate}>
                {allFilled ? 'Generate My Dream House' : 'Start Designing'} <ArrowRight className="w-4 h-4" />
              </Button>
              <Link to="/builder" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full gap-2 text-base">
                  <Layout className="w-4 h-4" /> Floor Plan Builder
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 md:px-8 py-8 border-y border-border bg-muted/20">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-3xl font-normal text-foreground mb-3">
              Real House Photos by Style & Location
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              Browse real photographic results from different styles and countries.
            </p>
          </div>

          {/* Featured image */}
          <div className="relative aspect-[16/7] rounded-2xl overflow-hidden mb-4 shadow-xl">
            {sampleImages.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-700 ${i === activeImage ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
              >
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="text-white font-medium">{img.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">{img.tag}</span>
                </div>
              </div>
            ))}

            {/* Dots */}
            <div className="absolute bottom-4 right-4 flex gap-1.5">
              {sampleImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`rounded-full transition-all duration-300 ${i === activeImage ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-6 gap-2">
            {sampleImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative aspect-video rounded-lg overflow-hidden transition-all duration-300 ${i === activeImage ? 'ring-2 ring-primary' : 'opacity-60 hover:opacity-100'}`}
              >
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 md:px-8 py-12 md:py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-3xl font-normal text-foreground mb-3">
              Everything You Need to Plan Your Home
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              From floor plan design to AI visualization — all in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group p-5 md:p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full flex flex-col"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 shrink-0 ${feature.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-medium text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-8 py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-violet-500/5 pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-xl md:text-3xl font-normal text-foreground mb-4">
            Ready to See Your Future Home?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-sm">
            It takes less than a minute to set your preferences. Get real house photos instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/design">
              <Button size="lg" className="gap-2 text-base px-8 shadow-md hover:shadow-lg transition-shadow">
                Generate My Dream House <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/builder">
              <Button variant="outline" size="lg" className="gap-2 text-base px-8">
                <Layout className="w-4 h-4" /> Start with Floor Plan
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}