import type { DesignParams, GenerationTask, GenerationView } from '@/types';

const CF_ACCOUNT_ID = import.meta.env.VITE_CF_ACCOUNT_ID;
const CF_API_TOKEN = import.meta.env.VITE_CF_API_TOKEN;
const CF_API_URL = `/cf-api/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;

const VIEW_PROMPTS: Record<GenerationView, (params: DesignParams) => string> = {
  exterior_front: (p) =>
    `Realistic cinematic front view of a ${p.style} ${p.floors}-story house with ${p.rooms} rooms, built on a ${p.plot_size} plot${p.location ? ` in ${p.location}` : ''}. Budget: ${p.budget}. Architectural photography, golden hour lighting, ultra-detailed, photorealistic, 8k quality.`,
  exterior_side: (p) =>
    `Realistic cinematic side view of a ${p.style} ${p.floors}-story house with ${p.rooms} rooms, built on a ${p.plot_size} plot${p.location ? ` in ${p.location}` : ''}. Budget: ${p.budget}. Architectural photography, natural lighting, ultra-detailed, photorealistic, 8k quality.`,
  exterior_aerial: (p) =>
    `Realistic cinematic aerial drone view of a ${p.style} ${p.floors}-story house with ${p.rooms} rooms, built on a ${p.plot_size} plot${p.location ? ` in ${p.location}` : ''}. Budget: ${p.budget}. Landscaping visible, ultra-detailed, photorealistic, 8k quality.`,
  interior_living: (p) =>
    `Realistic cinematic interior of a luxury living room in a ${p.style} house. Budget: ${p.budget}. High-end furniture, natural light, ultra-detailed, photorealistic, 8k quality.`,
  interior_kitchen: (p) =>
    `Realistic cinematic interior of a modern kitchen in a ${p.style} house. Budget: ${p.budget}. Premium appliances, marble countertops, natural lighting, ultra-detailed, photorealistic, 8k quality.`,
  interior_bedroom: (p) =>
    `Realistic cinematic interior of a master bedroom in a ${p.style} house. Budget: ${p.budget}. Cozy elegant design, soft lighting, ultra-detailed, photorealistic, 8k quality.`,
  interior_bathroom: (p) =>
    `Realistic cinematic interior of a luxury bathroom in a ${p.style} house. Budget: ${p.budget}. Freestanding bathtub, marble finishes, rainfall shower, ultra-detailed, photorealistic, 8k quality.`,
};

async function generateImage(prompt: string): Promise<string> {
  const response = await fetch(CF_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cloudflare AI error: ${err}`);
  }

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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

      const prompt = VIEW_PROMPTS[task.view](paramSource);

      try {
        const imageUrl = await generateImage(prompt);
        task.status = 'success';
        task.imageUrl = imageUrl;
      } catch (err) {
        task.status = 'failed';
        task.error = err instanceof Error ? err.message : 'Generation failed';
      }

      onUpdate([...currentTasks]);
    })
  );

  return currentTasks;
}