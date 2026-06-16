import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trash2, RotateCcw, Home, Bath, ChefHat, Sofa, BedDouble, Car, Trees, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const GRID_SIZE = 20;
const CELL_SIZE = 30;
const GRID_COLS = 20;
const GRID_ROWS = 16;

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

const ROOM_TYPES = [
  { type: 'living', label: 'Living Room', color: '#6366f1', icon: Sofa, w: 4, h: 3 },
  { type: 'bedroom', label: 'Bedroom', color: '#8b5cf6', icon: BedDouble, w: 3, h: 3 },
  { type: 'kitchen', label: 'Kitchen', color: '#f59e0b', icon: ChefHat, w: 3, h: 2 },
  { type: 'bathroom', label: 'Bathroom', color: '#06b6d4', icon: Bath, w: 2, h: 2 },
  { type: 'garage', label: 'Garage', color: '#64748b', icon: Car, w: 3, h: 2 },
  { type: 'garden', label: 'Garden', color: '#22c55e', icon: Trees, w: 4, h: 3 },
];

export default function BuilderPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const addRoom = (type: typeof ROOM_TYPES[0]) => {
    const newRoom: Room = {
      id: `${type.type}-${Date.now()}`,
      type: type.type,
      label: type.label,
      color: type.color,
      icon: type.icon,
      x: 0,
      y: 0,
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

    const bedroomCount = rooms.filter((r) => r.type === 'bedroom').length;
    const hasLiving = rooms.some((r) => r.type === 'living');
    const hasKitchen = rooms.some((r) => r.type === 'kitchen');

    const style = hasLiving && hasKitchen ? 'Modern' : 'Minimal';
    const roomCount = Math.max(bedroomCount + (hasLiving ? 1 : 0) + (hasKitchen ? 1 : 0), 2);

    navigate('/design', {
      state: {
        preset: {
          style,
          rooms: roomCount,
          floors: Math.ceil(rooms.length / 4),
          budget: '$400k–$600k',
        },
      },
    });

    toast.success('Taking your floor plan to AI generation!');
  };

  const selectedRoom = rooms.find((r) => r.id === selected);

  return (
    <div className="min-h-0 px-4 md:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-normal text-foreground mb-1">
              Floor Plan Builder
            </h1>
            <p className="text-muted-foreground text-sm">
              Drag rooms onto the grid, resize them, then generate AI images of your design.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={clearAll}>
              <RotateCcw className="w-4 h-4" /> Clear
            </Button>
            <Button size="sm" className="gap-2" onClick={handleGenerateAI}>
              <Sparkles className="w-4 h-4" /> Generate AI Images
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel — Room Types */}
          <div className="lg:w-56 shrink-0 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Add Rooms</p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {ROOM_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.type}
                    onClick={() => addRoom(type)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: type.color + '20' }}>
                      <Icon className="w-4 h-4" style={{ color: type.color }} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{type.label}</span>
                    <Plus className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                  </button>
                );
              })}
            </div>

            {/* Selected room info */}
            {selectedRoom && (
              <div className="mt-4 p-3 rounded-xl border border-border bg-card">
                <p className="text-xs font-medium text-muted-foreground mb-2">Selected Room</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedRoom.color }} />
                  <p className="text-sm font-medium text-foreground">{selectedRoom.label}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  Size: {selectedRoom.w * CELL_SIZE / 10}m × {selectedRoom.h * CELL_SIZE / 10}m
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Position: ({selectedRoom.x}, {selectedRoom.y})
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => deleteRoom(selectedRoom.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Room
                </Button>
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <div className="border border-border rounded-2xl overflow-auto bg-muted/20 p-4">
              <div
                ref={gridRef}
                className="relative select-none"
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
                  return (
                    <div
                      key={room.id}
                      className={`absolute rounded-lg border-2 flex flex-col items-center justify-center cursor-grab transition-shadow ${
                        isSelected ? 'shadow-lg z-10' : 'z-0'
                      }`}
                      style={{
                        left: room.x * CELL_SIZE,
                        top: room.y * CELL_SIZE,
                        width: room.w * CELL_SIZE,
                        height: room.h * CELL_SIZE,
                        backgroundColor: room.color + '30',
                        borderColor: isSelected ? room.color : room.color + '80',
                      }}
                      onMouseDown={(e) => handleMouseDown(e, room.id)}
                    >
                      <Icon className="w-5 h-5 mb-1" style={{ color: room.color }} />
                      <span className="text-xs font-medium text-center px-1 leading-tight" style={{ color: room.color }}>
                        {room.label}
                      </span>

                      {/* Resize handle */}
                      {isSelected && (
                        <div
                          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize rounded-tl-md"
                          style={{ backgroundColor: room.color }}
                          onMouseDown={(e) => handleResizeDown(e, room.id)}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Empty state */}
                {rooms.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <Home className="w-10 h-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground/50">Click rooms on the left to add them</p>
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3">
              {rooms.length > 0 && [...new Set(rooms.map((r) => r.type))].map((type) => {
                const roomType = ROOM_TYPES.find((rt) => rt.type === type);
                if (!roomType) return null;
                const count = rooms.filter((r) => r.type === type).length;
                return (
                  <div key={type} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: roomType.color }} />
                    <span className="text-xs text-muted-foreground">{roomType.label} × {count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}