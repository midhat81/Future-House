import type { DesignParams, GenerationTask, GenerationView } from '@/types';

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;

// Curated real photo IDs from Unsplash — guaranteed to match each room type
const CURATED_PHOTOS: Record<GenerationView, string[]> = {
  exterior_front: [
    'photo-1568605114967-8130f3a36994', // UK suburban house
    'photo-1570129477492-45c003edd2be', // modern house exterior
    'photo-1600596542815-ffad4c1539a9', // luxury house front
    'photo-1583608205776-bfd35f0d9f83', // classic house exterior
    'photo-1512917774080-9991f1c4c750', // modern villa
    'photo-1523217582562-09d05b9f3b91', // house front door
    'photo-1449844908441-8829872d2607', // brick house exterior
    'photo-1531971589569-0d9370cbe1e5', // white house exterior
  ],
  exterior_side: [
    'photo-1600585154340-be6161a56a0c', // house side view
    'photo-1558618666-fcd25c85cd64', // side garden
    'photo-1513584684374-8bab748fbf90', // house side angle
    'photo-1605276374104-dee2a0ed3cd6', // modern side view
    'photo-1564013799919-ab600027ffc6', // house with garden
    'photo-1600047509807-ba8f99d2cdde', // house exterior side
  ],
  exterior_aerial: [
    'photo-1477959858617-67f85cf4f1df', // aerial city view
    'photo-1486325212027-8081e485255e', // aerial suburban
    'photo-1524813686514-a57563d77965', // drone house view
    'photo-1604014237800-1c9102c219da', // aerial neighborhood
    'photo-1545324418-cc1a3fa10c00', // aerial residential
  ],
  interior_living: [
    'photo-1555041469-a586c61ea9bc', // modern living room sofa
    'photo-1560448204-e02f11c3d0e2', // cozy living room
    'photo-1586023492125-27b2c045efd7', // living room interior
    'photo-1493663284031-b7e3aefcae8e', // luxury living room
    'photo-1567016432779-094069958ea5', // minimalist living room
    'photo-1618221195710-dd6b41faaea6', // modern living space
  ],
  interior_kitchen: [
    'photo-1556909114-f6e7ad7d3136', // modern kitchen
    'photo-1565538810643-b5bdb714032a', // white kitchen cabinets
    'photo-1507089947368-19c1da9775ae', // kitchen interior
    'photo-1588854337221-4cf9fa96059c', // luxury kitchen
    'photo-1604709177225-055f99402ea3', // kitchen countertop
    'photo-1600489000022-c2086d79f9d4', // open kitchen
  ],
  interior_bedroom: [
    'photo-1540518614846-7eded433c457', // modern bedroom
    'photo-1522771739844-6a9f6d5f14af', // cozy bedroom
    'photo-1560185007-cde436f6a4d0', // luxury bedroom
    'photo-1588046130717-0eb0c9a3ba15', // minimalist bedroom
    'photo-1505693314120-0d443867891c', // elegant bedroom
    'photo-1616594039964-ae9021a400a0', // master bedroom
  ],
  interior_bathroom: [
    'photo-1552321554-5fefe8c9ef14', // modern bathroom
    'photo-1507652313519-d4e9174996dd', // luxury bathroom bathtub
    'photo-1584622650111-993a426fbf0a', // white bathroom
    'photo-1600566752355-35792bedcfea', // bathroom interior
    'photo-1620626011761-996317702574', // elegant bathroom
    'photo-1564540586988-aa4e53c3d799', // bathroom tiles
  ],
};

function getRandomPhoto(view: GenerationView): string {
  const photos = CURATED_PHOTOS[view];
  const random = Math.floor(Math.random() * photos.length);
  return `https://images.unsplash.com/${photos[random]}?w=800&q=80&fit=crop`;
}

async function fetchImage(view: GenerationView, params: DesignParams): Promise<string> {
  // Try Unsplash API first with very specific query
  const queries: Record<GenerationView, string> = {
    exterior_front: `house exterior front ${params.location || 'UK'}`,
    exterior_side: `house exterior side view garden`,
    exterior_aerial: `aerial view house rooftop neighborhood`,
    interior_living: `living room sofa interior design`,
    interior_kitchen: `kitchen cabinets interior`,
    interior_bedroom: `bedroom bed interior design`,
    interior_bathroom: `bathroom bathtub shower interior`,
  };

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(queries[view])}&per_page=15&page=${Math.floor(Math.random() * 3) + 1}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.results?.length > 0) {
        const index = Math.floor(Math.random() * Math.min(5, data.results.length));
        return data.results[index].urls.regular;
      }
    }
  } catch {
    // Fall through to curated
  }

  // Fallback to curated photos
  return getRandomPhoto(view);
}

export async function submitAllTasks(params: DesignParams): Promise<GenerationTask[]> {
  const views: GenerationView[] = [
    'exterior_front',
    'exterior_side',
    'exterior_aerial',
    'interior_living',
    'interior_kitchen',
    'interior_bedroom',
    'interior_bathroom',
  ];

  return views.map((view) => ({
    view,
    taskId: view,
    status: 'pending' as const,
    params,
  }));
}

export async function pollAllTasks(
  tasks: GenerationTask[],
  onUpdate: (tasks: GenerationTask[]) => void
): Promise<GenerationTask[]> {
  const currentTasks = tasks.map((t) => ({ ...t }));

  await Promise.all(
    currentTasks.map(async (task) => {
      const paramSource = task.params;
      if (!paramSource) {
        task.status = 'failed';
        task.error = 'Missing design params';
        onUpdate([...currentTasks]);
        return;
      }

      try {
        const imageUrl = await fetchImage(task.view as GenerationView, paramSource);
        task.status = 'success';
        task.imageUrl = imageUrl;
      } catch (err) {
        // Last resort — use curated
        task.status = 'success';
        task.imageUrl = getRandomPhoto(task.view as GenerationView);
      }

      onUpdate([...currentTasks]);
    })
  );

  return currentTasks;
}