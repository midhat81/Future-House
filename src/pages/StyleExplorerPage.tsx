import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const themes = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean lines, open spaces, and a seamless blend of indoor and outdoor living. Large glass windows, minimal ornamentation, and smart home integration.',
    imageUrl: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_089c2884-df70-4ec4-a1fa-0373e4eeb5f8.jpg',
    style: 'Modern',
    floors: 2,
    rooms: 5,
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Less is more. Pure geometric forms, neutral palettes, and uncluttered spaces that create calm and clarity in everyday living.',
    imageUrl: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_11c87477-10da-40a1-9de9-741d1077fa50.jpg',
    style: 'Minimalist',
    floors: 2,
    rooms: 4,
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless elegance with traditional proportions, rich materials, and refined craftsmanship. Symmetrical facades and detailed moldings.',
    imageUrl: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_ac7853a3-12dd-4d88-b317-616acb33158d.jpg',
    style: 'Classic',
    floors: 2,
    rooms: 6,
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Raw and authentic. Exposed brick, steel beams, concrete finishes, and large factory-style windows create an urban loft atmosphere.',
    imageUrl: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_894df02a-3931-4543-a064-2ad6d8b6e45a.jpg',
    style: 'Industrial',
    floors: 2,
    rooms: 5,
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Light, airy, and functional. Natural wood tones, white walls, and hygge-inspired cozy spaces that maximize natural light.',
    imageUrl: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_e786dc29-b19a-419f-babe-a745482bb9c1.jpg',
    style: 'Scandinavian',
    floors: 2,
    rooms: 5,
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean',
    description: 'Warm and inviting. Terracotta roofs, stucco walls, arched doorways, and courtyards that embrace outdoor living and ocean breezes.',
    imageUrl: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_f95017fe-3389-4719-beff-a58b4fd785b0.jpg',
    style: 'Mediterranean',
    floors: 2,
    rooms: 6,
  },
];

export default function StyleExplorerPage() {
  const navigate = useNavigate();

  const handleUseStyle = (theme: (typeof themes)[0]) => {
    navigate('/design', {
      state: {
        preset: {
          style: theme.style,
          floors: theme.floors,
          rooms: theme.rooms,
        },
      },
    });
  };

  return (
    <div className="min-h-0 px-4 md:px-8 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-normal text-foreground mb-3 text-balance">
            Explore Architectural Styles
          </h1>
          <p className="text-muted-foreground text-pretty max-w-xl mx-auto">
            Browse our curated collection of design themes. Each style offers a unique aesthetic direction for your future home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className="overflow-hidden group h-full flex flex-col"
            >
              <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                <img
                  src={theme.imageUrl}
                  alt={theme.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="text-white text-sm font-medium px-2 py-0.5 rounded bg-black/30 backdrop-blur-sm">
                    {theme.floors} floors · {theme.rooms} rooms
                  </span>
                </div>
              </div>
              <CardContent className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-medium text-foreground mb-2 text-balance">
                  {theme.name}
                </h3>
                <p className="text-sm text-muted-foreground text-pretty leading-relaxed flex-1">
                  {theme.description}
                </p>
                <Button
                  variant="ghost"
                  className="gap-2 mt-4 w-fit px-0 h-auto py-1 text-sm font-medium text-primary hover:text-primary/80"
                  onClick={() => handleUseStyle(theme)}
                >
                  Use This Style <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
