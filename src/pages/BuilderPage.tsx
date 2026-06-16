import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Trash2, RotateCcw, Home, Bath, ChefHat,
  Sofa, BedDouble, Car, Trees, Plus, Info, Ruler,
  UtensilsCrossed, Dumbbell, BookOpen, Baby
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const CELL_SIZE = 32;
const GRID_COLS = 24;
const GRID_ROWS = 18;

interface Room {
  id: string;
  type: string;
  label: string;
  color: string;
  icon: any;
  x: number;
  y: number;
  w: number;
  h: number;
}

const ROOM_CATEGORIES = [
  {
    category: 'Living Spaces',
    rooms: [
      { type: 'living', label: 'Living Room', color: '#6366f1', icon: Sofa, w: 5, h: 4 },
      { type: 'dining', label: 'Dining Room', color: '#8b5cf6', icon: UtensilsCrossed, w: 4, h: 3 },
      { type: 'study', label: 'Study / Office', color: '#3b82f6', icon: BookOpen, w: 3, h: 3 },
      { type: 'gym', label: 'Gym', color: '#ef4444', icon: Dumbbell, w: 4, h: 3 },
    ],
  },
  {
    category: 'Bedrooms',
    rooms: [
      { type: 'master', label: 'Master Bedroom', color: '#ec4899', icon: BedDouble, w: 4, h: 4 },
      { type: 'bedroom', label: 'Bedroom', color: '#f472b6', icon: BedDouble, w: 3, h: 3 },
      { type: 'kids', label: 'Kids Room', color: '#f59e0b', icon: Baby, w: 3, h: 3 },
    ],
  },
  {
    category: 'Utility',
    rooms: [
      { type: 'kitchen', label: 'Kitchen', color: '#f97316', icon: ChefHat, w: 4, h: 3 },
      { type: 'bathroom', label: 'Bathroom', color: '#06b6d4', icon: Bath, w: 3, h: 2 },
      { type: 'toilet', label: 'Toilet', color: '#0ea5e9', icon: Bath, w: 2, h: 2 },
    ],
  },
  {
    category: 'Outdoor',
    rooms: [
      { type: 'garage', label: 'Garage', color: '#64748b', icon: Car, w: 4, h: 3 },
      { type: 'garden', label: 'Garden', color: '#22c55e', icon: Trees, w: 5, h: 4 },
    ],
  },
];

const ALL_ROOM_TYPES = ROOM_CATEGORIES.flatMap((c) => c.rooms);

export default function BuilderPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Living Spaces');
  const gridRef = useRef<HTMLDivElement>(null);

  const addRoom = (type: typeof ALL_ROOM_TYPES[0]) => {
    // Find a free spot
    let x = 0, y = 0;
    const occupied = new Set(rooms.flatMap((r) =>
      Array.from({ length: r.h }, (_, dy) =>
        Array.from({ length: r.w }, (_, dx) => `${r.x + dx},${r.y + dy}`)
      ).flat()
    ));

    outer: for (let row = 0; row < GRID_ROWS - type.h; row++) {
      for (let col = 0; col < GRID_COLS - type.w; col++) {
        let free = true;
        for (let dy = 0; dy < type.h; dy++) {
          for (let dx = 0; dx < type.w; dx++) {
            if (occupied.has(`${col + dx},${row + dy}`)) { free = false; break; }
          }
          if (!free) break;
        }
        if (free) { x = col; y = row; break outer; }
      }
    }

    const newRoom: Room = {
      id: `${type.type}-${Date.now()}`,
      type: type.type,
      label: type.label,
      color: type.color,
      icon: type.icon,
      x, y,
      w: type.w,
      h: type.h,
    };
    setRooms((prev) => [...prev, newRoom]);
    setSelected(newRoom.id);
    toast.success(`${type.label} added!`);
  };

  const deleteRoom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    setSelected(null);
  };

  const clearAll = () => {
    setRooms([]);
    setSelected(null);
    toast.success('Floor plan cleared!');
  };

  const getGridPos = (clientX: number, clientY: number) => {
    const grid = gridRef.current;
    if (!grid) return { col: 0, row: 0 };
    const rect = grid.getBoundingClientRect();
    const col = Math.floor((clientX - rect.left) / CELL_SIZE);
    const row = Math.floor((clientY - rect.top) / CELL_SIZE);
    return { col: Math.max(0, col), row: Math.max(0, row) };
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelected(id);
    const room = rooms.find((r) => r.id === id);
    if (!room) return;
    const grid = gridRef.current;
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const offsetX = Math.floor((e.clientX - rect.left) / CELL_SIZE) - room.x;
    const offsetY = Math.floor((e.clientY - rect.top) / CELL_SIZE) - room.y;
    setDragOffset({ x: offsetX, y: offsetY });
    setDragging(id);
  };

  const handleResizeDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const room = rooms.find((r) => r.id === id);
    if (!room) return;
    setResizing(id);
    setResizeStart({ x: e.clientX, y: e.clientY, w: room.w, h: room.h });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      const { col, row } = getGridPos(e.clientX, e.clientY);
      setRooms((prev) =>
        prev.map((r) =>
          r.id === dragging
            ? {
                ...r,
                x: Math.max(0, Math.min(col - dragOffset.x, GRID_COLS - r.w)),
                y: Math.max(0, Math.min(row - dragOffset.y, GRID_ROWS - r.h)),
              }
            : r
        )
      );
    }
    if (resizing) {
      const room = rooms.find((r) => r.id === resizing);
      if (!room) return;
      const dx = Math.round((e.clientX - resizeStart.x) / CELL_SIZE);
      const dy = Math.round((e.clientY - resizeStart.y) / CELL_SIZE);
      setRooms((prev) =>
        prev.map((r) =>
          r.id === resizing
            ? {
                ...r,
                w: Math.max(2, Math.min(resizeStart.w + dx, GRID_COLS - r.x)),
                h: Math.max(2, Math.min(resizeStart.h + dy, GRID_ROWS - r.y)),
              }
            : r
        )
      );
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
  };

  const handleGenerateAI = () => {
    if (rooms.length === 0) {
      toast.error('Add at least one room first!');
      return;
    }
    const bedroomCount = rooms.filter((r) => r.type === 'bedroom' || r.type === 'master' || r.type === 'kids').length;
    const hasLiving = rooms.some((r) => r.type === 'living');
    const hasKitchen = rooms.some((r) => r.type === 'kitchen');
    const hasLuxury = rooms.some((r) => r.type === 'gym' || r.type === 'master');
    const style = hasLuxury ? 'Luxury' : hasLiving && hasKitchen ? 'Modern' : 'Minimal';
    const roomCount = Math.max(rooms.length, 2);
    const floors = rooms.length > 8 ? 2 : 1;

    navigate('/design', {
      state: {
        preset: {
          style,
          rooms: roomCount,
          floors,
          budget: hasLuxury ? 'Over $1M' : '$400k–$600k',
        },
      },
    });
    toast.success('Taking your floor plan to AI generation!');
  };

  const selectedRoom = rooms.find((r) => r.id === selected);
  const totalArea = rooms.reduce((sum, r) => sum + r.w * r.h * (CELL_SIZE / 10) * (CELL_SIZE / 10), 0).toFixed(0);
  const activeRooms = ROOM_CATEGORIES.find((c) => c.category === activeCategory)?.rooms || [];

  return (
    <div className="min-h-0 px-4 md:px-6 py-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-normal text-foreground mb-1">Floor Plan Builder</h1>
            <p className="text-muted-foreground text-sm">Design your floor plan then generate AI house images from it.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={clearAll} disabled={rooms.length === 0}>
              <RotateCcw className="w-4 h-4" /> Clear
            </Button>
            <Button size="sm" className="gap-2" onClick={handleGenerateAI}>
              <Sparkles className="w-4 h-4" /> Generate AI Images
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">

          {/* Left Panel */}
          <div className="lg:w-60 shrink-0 space-y-4">

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5">
              {ROOM_CATEGORIES.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategory(cat.category)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    activeCategory === cat.category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat.category}
                </button>
              ))}
            </div>

            {/* Room buttons */}
            <div className="space-y-1.5">
              {activeRooms.map((type) => {
                const Icon = type.icon;
                const count = rooms.filter((r) => r.type === type.type).length;
                return (
                  <button
                    key={type.type}
                    onClick={() => addRoom(type)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: type.color + '20' }}>
                      <Icon className="w-4 h-4" style={{ color: type.color }} />
                    </div>
                    <span className="text-sm font-medium text-foreground flex-1">{type.label}</span>
                    <div className="flex items-center gap-1.5">
                      {count > 0 && (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: type.color }}>
                          {count}
                        </span>
                      )}
                      <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stats */}
            <div className="p-3 rounded-xl border border-border bg-card space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Floor Plan Stats</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-bold text-foreground">{rooms.length}</p>
                  <p className="text-xs text-muted-foreground">Rooms</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-bold text-foreground">{totalArea}</p>
                  <p className="text-xs text-muted-foreground">sq m</p>
                </div>
              </div>
            </div>

            {/* Selected room */}
            {selectedRoom && (
              <div className="p-3 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selectedRoom.color }} />
                  <p className="text-sm font-medium text-foreground">{selectedRoom.label}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    {(selectedRoom.w * CELL_SIZE / 10).toFixed(1)}m × {(selectedRoom.h * CELL_SIZE / 10).toFixed(1)}m
                  </div>
                  <div className="flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {(selectedRoom.w * selectedRoom.h * (CELL_SIZE / 10) ** 2).toFixed(0)} sq m
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Drag to move · Drag corner to resize
                </p>
                <Button variant="destructive" size="sm" className="w-full gap-2" onClick={() => deleteRoom(selectedRoom.id)}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete Room
                </Button>
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <div className="border border-border rounded-2xl overflow-auto bg-muted/10 p-3">
              <div
                ref={gridRef}
                className="relative select-none mx-auto"
                style={{
                  width: GRID_COLS * CELL_SIZE,
                  height: GRID_ROWS * CELL_SIZE,
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                  cursor: dragging ? 'grabbing' : 'default',
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => setSelected(null)}
              >
                {/* Rooms */}
                {rooms.map((room) => {
                  const Icon = room.icon;
                  const isSelected = selected === room.id;
                  const roomW = room.w * CELL_SIZE;
                  const roomH = room.h * CELL_SIZE;
                  return (
                    <div
                      key={room.id}
                      className={`absolute rounded-xl border-2 flex flex-col items-center justify-center cursor-grab transition-all duration-100 ${
                        isSelected ? 'shadow-xl z-10 scale-[1.02]' : 'z-0 hover:shadow-md'
                      }`}
                      style={{
                        left: room.x * CELL_SIZE,
                        top: room.y * CELL_SIZE,
                        width: roomW,
                        height: roomH,
                        backgroundColor: room.color + '25',
                        borderColor: isSelected ? room.color : room.color + '70',
                      }}
                      onMouseDown={(e) => handleMouseDown(e, room.id)}
                    >
                      {/* Room content */}
                      <Icon className="w-5 h-5 mb-1 shrink-0" style={{ color: room.color }} />
                      {roomH > 50 && (
                        <span className="text-xs font-semibold text-center px-1 leading-tight" style={{ color: room.color }}>
                          {room.label}
                        </span>
                      )}
                      {roomH > 70 && (
                        <span className="text-[10px] text-center px-1 mt-0.5 opacity-70" style={{ color: room.color }}>
                          {(room.w * CELL_SIZE / 10).toFixed(1)}×{(room.h * CELL_SIZE / 10).toFixed(1)}m
                        </span>
                      )}

                      {/* Resize handle */}
                      {isSelected && (
                        <div
                          className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize rounded-tl-lg flex items-center justify-center"
                          style={{ backgroundColor: room.color }}
                          onMouseDown={(e) => handleResizeDown(e, room.id)}
                        >
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
                            <path d="M0 8L8 0M4 8L8 4" stroke="white" strokeWidth="1.5" />
                          </svg>
                        </div>
                      )}

                      {/* Delete on hover when selected */}
                      {isSelected && (
                        <button
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-80 hover:opacity-100"
                          onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Empty state */}
                {rooms.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                      <Home className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground/60">Click rooms on the left to add them to your floor plan</p>
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            {rooms.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {[...new Map(rooms.map((r) => [r.type, r])).values()].map((room) => {
                  const count = rooms.filter((r) => r.type === room.type).length;
                  return (
                    <div key={room.type} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: room.color }} />
                      <span className="text-xs text-muted-foreground">{room.label} {count > 1 ? `×${count}` : ''}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tips */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>🖱️ Click room → drag to move</span>
              <span>↔️ Drag corner handle → resize</span>
              <span>🗑️ Click red X → delete</span>
              <span>✨ Click Generate → get AI images</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}