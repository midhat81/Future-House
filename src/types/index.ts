export interface DesignParams {
  plot_size: string;
  budget: string;
  style: string;
  floors: number;
  rooms: number;
  location?: string;
}

export interface Design {
  id: string;
  created_at: string;
  params: DesignParams;
  exterior_front_url: string | null;
  exterior_side_url: string | null;
  exterior_aerial_url: string | null;
  interior_living_url: string | null;
  interior_kitchen_url: string | null;
  interior_bedroom_url: string | null;
  interior_bathroom_url: string | null;
}

export type GenerationView =
  | 'exterior_front'
  | 'exterior_side'
  | 'exterior_aerial'
  | 'interior_living'
  | 'interior_kitchen'
  | 'interior_bedroom'
  | 'interior_bathroom';

export interface GenerationTask {
  view: GenerationView;
  taskId: string;
  status: 'pending' | 'success' | 'failed';
  imageUrl?: string;
  error?: string;
  params?: DesignParams; // ✅ added for HF generation
}

export interface StyleTheme {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  style: string;
  floors: number;
  rooms: number;
}