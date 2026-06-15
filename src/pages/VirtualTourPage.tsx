import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Play, Pause, X, ChevronLeft, ChevronRight, Maximize2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Design, GenerationView } from '@/types';

interface TourImage {
  view: GenerationView;
  label: string;
  url: string | null;
  category: 'exterior' | 'interior';
}

const TOUR_SEQUENCE: { view: GenerationView; label: string; category: 'exterior' | 'interior' }[] = [
  { view: 'exterior_front', label: 'Front Exterior', category: 'exterior' },
  { view: 'exterior_side', label: 'Side Exterior', category: 'exterior' },
  { view: 'exterior_aerial', label: 'Aerial View', category: 'exterior' },
  { view: 'interior_living', label: 'Living Room', category: 'interior' },
  { view: 'interior_kitchen', label: 'Kitchen', category: 'interior' },
  { view: 'interior_bedroom', label: 'Master Bedroom', category: 'interior' },
  { view: 'interior_bathroom', label: 'Bathroom', category: 'interior' },
];

interface LocationState {
  design: Design;
}

export default function VirtualTourPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const design = state?.design;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const touchStartX = useRef(0);

  const images: TourImage[] = design
    ? TOUR_SEQUENCE.map((item) => ({
        ...item,
        url: (() => {
          switch (item.view) {
            case 'exterior_front': return design.exterior_front_url;
            case 'exterior_side': return design.exterior_side_url;
            case 'exterior_aerial': return design.exterior_aerial_url;
            case 'interior_living': return design.interior_living_url;
            case 'interior_kitchen': return design.interior_kitchen_url;
            case 'interior_bedroom': return design.interior_bedroom_url;
            case 'interior_bathroom': return design.interior_bathroom_url;
          }
        })(),
      })).filter((img) => img.url)
    : [];

  const currentImage = images[currentIndex] || null;

  const goTo = useCallback((index: number, dir: 'left' | 'right') => {
    if (images.length <= 1 || transitioning) return;
    let next = index;
    if (next < 0) next = images.length - 1;
    if (next >= images.length) next = 0;
    setDirection(dir);
    setTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(next);
      setTransitioning(false);
    }, 300);
  }, [images.length, transitioning]);

  const goNext = useCallback(() => goTo(currentIndex + 1, 'right'), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1, 'left'), [currentIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') navigate(-1);
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, navigate]);

  // Auto-play slideshow
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        goTo(currentIndex + 1, 'right');
      }, 4000);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, currentIndex, goTo]);

  // Hide controls after inactivity
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  if (!design || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h1 className="text-xl font-normal text-foreground mb-4">No images available for tour</h1>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </div>
    );
  }

  const slideClass = transitioning
    ? direction === 'right'
      ? 'opacity-0 translate-x-12'
      : 'opacity-0 -translate-x-12'
    : 'opacity-100 translate-x-0';

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col select-none"
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image Viewer */}
      <div className="flex-1 relative overflow-hidden">
        {images.map((img, i) => (
          <div
            key={img.view}
            className={`absolute inset-0 transition-all duration-300 ease-out ${
              i === currentIndex ? slideClass : 'opacity-0 translate-x-0 pointer-events-none'
            }`}
          >
            {img.url && (
              <img
                src={img.url}
                alt={img.label}
                className="w-full h-full object-cover"
                draggable={false}
              />
            )}
          </div>
        ))}

        {/* Vignette overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)'
        }} />

        {/* Top bar */}
        <div className={`absolute top-0 left-0 right-0 flex items-center justify-between px-4 md:px-6 py-3 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => navigate(-1)}
            >
              <X className="w-5 h-5" />
            </Button>
            <div>
              <p className="text-white text-sm font-medium">{currentImage?.label}</p>
              <p className="text-white/60 text-xs">
                {currentIndex + 1} / {images.length} · {currentImage?.category === 'exterior' ? 'Exterior' : 'Interior'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`text-white/80 hover:text-white hover:bg-white/10 ${isPlaying ? 'text-white' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying((p) => !p);
              }}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`text-white/80 hover:text-white hover:bg-white/10 ${showMap ? 'text-white' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowMap((p) => !p);
              }}
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation arrows */}
        <div className={`absolute inset-y-0 left-0 flex items-center px-2 md:px-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>
        <div className={`absolute inset-y-0 right-0 flex items-center px-2 md:px-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Bottom progress bar */}
        <div className={`absolute bottom-0 left-0 right-0 px-4 md:px-6 pb-3 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/80 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mini Floor Plan */}
      {showMap && (
        <div className={`shrink-0 bg-black/80 backdrop-blur-md border-t border-white/10 transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="px-4 md:px-6 py-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-white/60" />
              <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Floor Plan</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.view}
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(i, i > currentIndex ? 'right' : 'left');
                  }}
                  className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all ${
                    i === currentIndex
                      ? 'ring-2 ring-white w-24 h-16 md:w-28 md:h-[72px]'
                      : 'w-16 h-12 md:w-20 md:h-14 opacity-60 hover:opacity-100'
                  }`}
                >
                  {img.url && (
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" loading="lazy" />
                  )}
                  {i === currentIndex && (
                    <div className="absolute inset-0 bg-white/10" />
                  )}
                  <span className={`absolute bottom-1 left-1.5 text-[10px] font-medium px-1 rounded ${
                    i === currentIndex ? 'bg-white/20 text-white' : 'bg-black/50 text-white/80'
                  }`}>
                    {img.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
