import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Eye, Layers, Download, Play, MapPin, Banknote, Palette, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STYLE_OPTIONS = ['Modern', 'Luxury', 'Minimal', 'Villa', 'Classic', 'Industrial', 'Scandinavian', 'Mediterranean'];
const BUDGET_OPTIONS = ['Under $200k', '$200k–$400k', '$400k–$600k', '$600k–$1M', 'Over $1M'];
const ROOMS_OPTIONS = ['1–2 Rooms', '3–4 Rooms', '5–6 Rooms', '7–8 Rooms', '9+ Rooms'];
const LOCATION_OPTIONS = ['United Kingdom', 'United States', 'Australia', 'Canada', 'UAE', 'Germany', 'France', 'Spain'];

const sampleImages = [
  {
    url: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_089c2884-df70-4ec4-a1fa-0373e4eeb5f8.jpg',
    label: 'Modern Exterior',
  },
  {
    url: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_11c87477-10da-40a1-9de9-741d1077fa50.jpg',
    label: 'Living Room',
  },
  {
    url: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_894df02a-3931-4543-a064-2ad6d8b6e45a.jpg',
    label: 'Kitchen',
  },
];

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'State-of-the-art AI creates photorealistic house visualizations from your specs.',
  },
  {
    icon: Eye,
    title: '7 Views Per Design',
    description: 'Exterior front, side, aerial + living room, kitchen, bedroom, and bathroom.',
  },
  {
    icon: Layers,
    title: 'Style Comparison',
    description: 'Generate multiple designs and compare them side by side.',
  },
  {
    icon: Download,
    title: 'Save & Download',
    description: 'Keep all designs in your gallery and download high-resolution images.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [style, setStyle] = useState('');
  const [budget, setBudget] = useState('');
  const [rooms, setRooms] = useState('');
  const [location, setLocation] = useState('');

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
    <div className="min-h-0">
      {/* Hero + Quick Form */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 px-4 md:px-8 pt-10 md:pt-16 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Home Visualization
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal text-foreground mb-4 leading-tight text-balance text-center">
            Visualize Your <span className="gradient-text">Dream Home</span>{' '}
            Before It Is Built
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty leading-relaxed text-center">
            Pick your style, set your budget, and let our AI generate photorealistic exterior and interior views in minutes.
          </p>

          {/* Quick-input card */}
          <div className="bg-card border border-border rounded-2xl shadow-hover p-5 md:p-7 max-w-3xl mx-auto">
            <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
              Quick Design Generator
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {/* Style */}
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
              {/* Budget */}
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
              {/* Rooms */}
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
              {/* Location */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Location <span className="text-muted-foreground font-normal">(optional)</span>
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
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 text-base px-7"
                onClick={handleQuickGenerate}
              >
                {allFilled ? 'Generate My Dream House' : 'Start Designing'} <ArrowRight className="w-4 h-4" />
              </Button>
              <Link to="/styles" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full gap-2 text-base">
                  <Play className="w-4 h-4" /> Explore Styles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Gallery */}
      <section className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-3xl font-normal text-foreground mb-3 text-balance">
              Stunning AI-Generated Previews
            </h2>
            <p className="text-muted-foreground text-pretty max-w-xl mx-auto">
              From modern minimalism to classic elegance — see what our AI can create for your vision.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {sampleImages.map((img, i) => (
              <div
                key={i}
                className="group relative aspect-[4/3] md:aspect-[3/4] rounded-xl overflow-hidden bg-muted"
              >
                <img
                  src={img.url}
                  alt={img.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 text-white text-sm font-medium">
                  {img.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 md:px-8 py-12 md:py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-3xl font-normal text-foreground mb-3 text-balance">
              Everything You Need to Plan Your Home
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-5 md:p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-hover transition-shadow h-full flex flex-col"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-medium text-foreground mb-2 text-balance">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground text-pretty leading-relaxed flex-1">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-8 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl md:text-3xl font-normal text-foreground mb-4 text-balance">
            Ready to See Your Future Home?
          </h2>
          <p className="text-muted-foreground mb-8 text-pretty max-w-lg mx-auto">
            It takes less than a minute to set your preferences. The AI does the rest.
          </p>
          <Link to="/design">
            <Button size="lg" className="gap-2 text-base px-8">
              Generate My Dream House <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
