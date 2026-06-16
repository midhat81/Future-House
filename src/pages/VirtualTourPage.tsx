import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Play, Pause, X, ChevronLeft, ChevronRight,
  Maximize2, Minimize2, MapPin, ZoomIn, ZoomOut, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Design, GenerationView } from '@/types';

interface TourImage {
  view: GenerationView;
  label: string;
  url: string | null;
  category: 'exterior' | 'interior';
  description: string;
}

const TOUR_SEQUENCE: {
  view: GenerationView;
  label: string;
  category: 'exterior' | 'interior';
  description: string;
}[] = [
  {
    view: 'exterior_front',
    label: 'Front Exterior',
    category: 'exterior',
    description: 'The grand entrance of your home featuring architectural details, landscaping, and curb appeal designed to impress.',
  },
  {
    view: 'exterior_side',
    label: 'Side Exterior',
    category: 'exterior',
    description: 'A side perspective revealing the full depth and scale of the property with surrounding outdoor space.',
  },
  {
    view: 'exterior_aerial',
    label: 'Aerial View',
    category: 'exterior',
    description: 'A bird\'s-eye drone view showcasing the entire property layout, roof design, and surrounding landscape.',
  },
  {
    view: 'interior_living',
    label: 'Living Room',
    category: 'interior',
    description: 'A spacious, light-filled living area with premium furnishings, high ceilings, and an open-plan layout perfect for entertaining.',
  },
  {
    view: 'interior_kitchen',
    label: 'Kitchen',
    category: 'interior',
    description: 'A chef\'s kitchen with top-of-the-line appliances, marble countertops, custom cabinetry, and a central island.',
  },
  {
    view: 'interior_bedroom',
    label: 'Master Bedroom',
    category: 'interior',
    description: 'A serene master retreat featuring a king-size bed, walk-in wardrobe, ambient lighting, and premium finishes.',
  },
  {
    view: 'interior_bathroom',
    label: 'Bathroom',
    category: 'interior',
    description: 'A spa-inspired bathroom with a freestanding bathtub, rainfall shower, marble finishes, and warm ambient lighting.',
  },
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
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<'slide-right' | 'slide-left' | 'fade'>('fade');
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const resetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const goTo = useCallback((index: number, type: 'slide-right' | 'slide-left' | 'fade' = 'fade') => {
    if (images.length <= 1 || transitioning) return;
    let next = index;
    if (next < 0) next = images.length - 1;
    if (next >= images.length) next = 0;
    setTransitionType(type);
    setTransitioning(true);
    resetZoom();
    setTimeout(() => {
      setCurrentIndex(next);
      setTransitioning(false);
    }, 400);
  }, [images.length, transitioning]);

  const goNext = useCallback(() => goTo(currentIndex + 1, 'slide-right'), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1, 'slide-left'), [currentIndex, goTo]);

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.5, 3));
  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(z - 0.5, 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse drag for panning when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: panOffset.x, panY: panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPanOffset({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Fullscreen
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') {
        if (document.fullscreenElement) document.exitFullscreen();
        else navigate(-1);
      }
      if (e.key === ' ') { e.preventDefault(); setIsPlaying((p) => !p); }
      if (e.key === '+') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === 'i') setShowInfo((p) => !p);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, navigate]);

  // Auto-play
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => goTo(currentIndex + 1, 'slide-right'), 4000);
    }
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [isPlaying, currentIndex, goTo]);

  // Hide controls
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  useEffect(() => {
    resetControlsTimeout();
    return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); };
  }, [resetControlsTimeout]);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
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
        <Button onClick={() => navigate('/')}><ChevronLeft className="w-4 h-4 mr-2" /> Back to Home</Button>
      </div>
    );
  }

  const getSlideClass = () => {
    if (!transitioning) return 'opacity-100 translate-x-0 scale-100';
    if (transitionType === 'slide-right') return 'opacity-0 -translate-x-16 scale-95';
    if (transitionType === 'slide-left') return 'opacity-0 translate-x-16 scale-95';
    return 'opacity-0 scale-95';
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col select-none"
      onMouseMove={resetControlsTimeout}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image Viewer */}
      <div
        className="flex-1 relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {images.map((img, i) => (
          <div
            key={img.view}
            className={`absolute inset-0 transition-all duration-400 ease-out ${
              i === currentIndex ? getSlideClass() : 'opacity-0 pointer-events-none'
            }`}
          >
            {img.url && (
              <img
                src={img.url}
                alt={img.label}
                className="w-full h-full object-cover transition-transform duration-300"
                style={{
                  transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                  transformOrigin: 'center center',
                }}
                draggable={false}
              />
            )}
          </div>
        ))}

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)'
        }} />

        {/* Top bar */}
        <div className={`absolute top-0 left-0 right-0 flex items-center justify-between px-4 md:px-6 py-4 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 rounded-full" onClick={() => navigate(-1)}>
              <X className="w-5 h-5" />
            </Button>
            <div>
              <p className="text-white text-sm font-medium">{currentImage?.label}</p>
              <p className="text-white/60 text-xs">{currentIndex + 1} / {images.length} · {currentImage?.category === 'exterior' ? 'Exterior' : 'Interior'}</p>
            </div>
          </div>

          {/* Top right controls */}
          <div className="flex items-center gap-1">
            {/* Zoom controls */}
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 rounded-full" onClick={handleZoomOut} disabled={zoom <= 1}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-white/60 text-xs w-8 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 rounded-full" onClick={handleZoomIn} disabled={zoom >= 3}>
              <ZoomIn className="w-4 h-4" />
            </Button>

            <div className="w-px h-4 bg-white/20 mx-1" />

            {/* Info toggle */}
            <Button variant="ghost" size="icon" className={`rounded-full hover:bg-white/10 ${showInfo ? 'text-white bg-white/20' : 'text-white/80 hover:text-white'}`} onClick={() => setShowInfo((p) => !p)}>
              <Info className="w-4 h-4" />
            </Button>

            {/* Play/Pause */}
            <Button variant="ghost" size="icon" className={`rounded-full hover:bg-white/10 ${isPlaying ? 'text-white bg-white/20' : 'text-white/80 hover:text-white'}`} onClick={() => setIsPlaying((p) => !p)}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            {/* Fullscreen */}
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 rounded-full" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Room info panel */}
        {showInfo && currentImage && (
          <div className="absolute bottom-24 left-4 right-4 md:left-8 md:right-auto md:max-w-sm bg-black/70 backdrop-blur-md rounded-2xl p-4 border border-white/10 transition-all duration-300">
            <p className="text-white font-medium text-sm mb-1">{currentImage.label}</p>
            <p className="text-white/70 text-xs leading-relaxed">{currentImage.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${currentImage.category === 'exterior' ? 'bg-blue-500/30 text-blue-300' : 'bg-amber-500/30 text-amber-300'}`}>
                {currentImage.category === 'exterior' ? 'Exterior' : 'Interior'}
              </span>
              {zoom > 1 && (
                <button onClick={resetZoom} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 hover:bg-white/20">
                  Reset zoom
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation arrows */}
        <div className={`absolute inset-y-0 left-0 flex items-center px-2 md:px-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <Button variant="ghost" size="icon" className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10" onClick={goPrev}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>
        <div className={`absolute inset-y-0 right-0 flex items-center px-2 md:px-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <Button variant="ghost" size="icon" className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10" onClick={goNext}>
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Progress dots */}
        <div className={`absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > currentIndex ? 'slide-right' : 'slide-left')}
              className={`rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      </div>

      {/* Mini Floor Plan */}
      {showMap && (
        <div className={`shrink-0 bg-black/90 backdrop-blur-md border-t border-white/10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="px-4 md:px-6 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-white/50" />
                <span className="text-xs text-white/50 font-medium uppercase tracking-wider">Room Navigator</span>
              </div>
              <button onClick={() => setShowMap(false)} className="text-white/30 hover:text-white/60 text-xs">Hide</button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, i) => (
                <button
                  key={img.view}
                  onClick={() => goTo(i, i > currentIndex ? 'slide-right' : 'slide-left')}
                  className={`flex-shrink-0 relative rounded-xl overflow-hidden transition-all duration-300 ${
                    i === currentIndex
                      ? 'ring-2 ring-white w-24 h-16 md:w-28 md:h-[72px]'
                      : 'w-16 h-12 md:w-20 md:h-14 opacity-50 hover:opacity-90'
                  }`}
                >
                  {img.url && <img src={img.url} alt={img.label} className="w-full h-full object-cover" loading="lazy" />}
                  {i === currentIndex && <div className="absolute inset-0 bg-white/10" />}
                  <span className="absolute bottom-1 left-1 right-1 text-[9px] font-medium text-white bg-black/50 rounded px-1 truncate">
                    {img.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Show map button when hidden */}
      {!showMap && (
        <div className={`absolute bottom-4 right-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <Button variant="ghost" size="sm" className="bg-black/50 text-white/70 hover:text-white hover:bg-black/70 rounded-full backdrop-blur-sm text-xs gap-1" onClick={() => setShowMap(true)}>
            <MapPin className="w-3 h-3" /> Show Rooms
          </Button>
        </div>
      )}
    </div>
  );
}