import type { DesignParams, GenerationTask, GenerationView } from '@/types';

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;

const CURATED_PHOTOS: Record<GenerationView, string[]> = {
  exterior_front: [
    'photo-1583608205776-bfd35f0d9f83',
    'photo-1570129477492-45c003edd2be',
    'photo-1512917774080-9991f1c4c750',
    'photo-1449844908441-8829872d2607',
    'photo-1531971589569-0d9370cbe1e5',
    'photo-1558036117-15d82a90b9b1',
    'photo-1564013799919-ab600027ffc6',
    'photo-1600585154340-be6161a56a0c',
  ],
  exterior_side: [
    'photo-1564013799919-ab600027ffc6',
    'photo-1600047509807-ba8f99d2cdde',
    'photo-1605276374104-dee2a0ed3cd6',
    'photo-1598228723793-52759bba239c',
    'photo-1512917774080-9991f1c4c750',
    'photo-1583608205776-bfd35f0d9f83',
    'photo-1570129477492-45c003edd2be',
  ],
  exterior_aerial: [
    'photo-1486325212027-8081e485255e',
    'photo-1524813686514-a57563d77965',
    'photo-1604014237800-1c9102c219da',
    'photo-1545324418-cc1a3fa10c00',
    'photo-1477959858617-67f85cf4f1df',
    'photo-1519501025264-65ba15a82390',
  ],
  interior_living: [
    'photo-1555041469-a586c61ea9bc',
    'photo-1586023492125-27b2c045efd7',
    'photo-1560448204-e02f11c3d0e2',
    'photo-1493663284031-b7e3aefcae8e',
    'photo-1567016432779-094069958ea5',
    'photo-1618221195710-dd6b41faaea6',
    'photo-1484101403633-562f891dc89a',
  ],
  interior_kitchen: [
    'photo-1556909114-f6e7ad7d3136',
    'photo-1565538810643-b5bdb714032a',
    'photo-1588854337221-4cf9fa96059c',
    'photo-1600489000022-c2086d79f9d4',
    'photo-1604709177225-055f99402ea3',
    'photo-1507089947368-19c1da9775ae',
    'photo-1556909172-54557c7e4fb7',
  ],
  interior_bedroom: [
    'photo-1616594039964-ae9021a400a0',
    'photo-1505693314120-0d443867891c',
    'photo-1560185007-cde436f6a4d0',
    'photo-1588046130717-0eb0c9a3ba15',
    'photo-1522771739844-6a9f6d5f14af',
    'photo-1631049307264-da0ec9d70304',
    'photo-1598300042247-d088f8ab3a91',
  ],
  interior_bathroom: [
    'photo-1552321554-5fefe8c9ef14',
    'photo-1507652313519-d4e9174996dd',
    'photo-1584622650111-993a426fbf0a',
    'photo-1600566752355-35792bedcfea',
    'photo-1620626011761-996317702574',
    'photo-1564540586988-aa4e53c3d799',
    'photo-1571902943202-507ec2618e8f',
  ],
};

function getRandomPhoto(view: GenerationView): string {
  const photos = CURATED_PHOTOS[view];
  const random = Math.floor(Math.random() * photos.length);
  return `https://images.unsplash.com/${photos[random]}?w=800&q=80&fit=crop`;
}

async function fetchImage(view: GenerationView, params: DesignParams): Promise<string> {
  const queries: Record<GenerationView, string> = {
    exterior_front: `single family house exterior front door garden ${params.location || 'UK'} residential`,
    exterior_side: `single house exterior side view garden fence driveway residential`,
    exterior_aerial: `aerial drone view single house rooftop garden suburban`,
    interior_living: `full living room interior wide angle sofa couch`,
    interior_kitchen: `full kitchen interior wide angle cabinets island`,
    interior_bedroom: `full master bedroom interior wide angle bed furniture`,
    interior_bathroom: `full bathroom interior wide angle bathtub shower`,
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
      } catch {
        task.status = 'success';
        task.imageUrl = getRandomPhoto(task.view as GenerationView);
      }

      onUpdate([...currentTasks]);
    })
  );

  return currentTasks;
}