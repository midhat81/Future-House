# 🏠 FutureHouse AI

> Visualize your dream home before it's built — powered by real house photography and AI.

![FutureHouse AI](https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80&fit=crop)

## 🌍 Live Demo
**[future-house-ai.vercel.app](https://future-house-ai.vercel.app)**

---

## ✨ Features

- 🏡 **7-View House Visualization** — Front, side, aerial exterior + living room, kitchen, bedroom, bathroom
- 🗺️ **10 Countries Supported** — UK, USA, Australia, Canada, UAE, Germany, France, Spain, Italy, Netherlands
- 🎨 **10 House Styles** — Modern, Luxury, Minimal, Villa, Classic, Industrial, Rustic, Mediterranean, Scandinavian, Contemporary
- 🏗️ **Floor Plan Builder** — Drag-and-drop room layout designer with 12+ room types
- 🎥 **Virtual Tour** — Fullscreen room-by-room tour with zoom, pan, and auto-play
- 💰 **Cost Estimator** — Multi-currency build cost breakdown based on your design params
- 📤 **Share Card** — Download a beautiful poster image of your design
- 🗂️ **Gallery** — Save, filter, search, and compare designs side by side
- 🔐 **Authentication** — Secure login/signup powered by Supabase Auth
- 🌙 **Dark Mode** — Full dark/light theme toggle
- 📱 **Mobile Responsive** — Works on all screen sizes

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| UI Components | Radix UI, shadcn/ui, Lucide Icons |
| Backend/DB | Supabase (PostgreSQL + Auth) |
| Image API | Unsplash API |
| Drag & Drop | DnD Kit |
| Routing | React Router DOM |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repo
git clone https://github.com/midhat81/Future-House.git
cd Future-House

# Install dependencies
npm install

# Start dev server
npx vite
```

### Environment Variables

Create a `.env` file in the root:

```properties
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CF_ACCOUNT_ID=your_cloudflare_account_id
VITE_CF_API_TOKEN=your_cloudflare_api_token
VITE_UNSPLASH_KEY=your_unsplash_access_key
VITE_HF_TOKEN=your_huggingface_token
```

### Database Setup

Run this SQL in your Supabase SQL editor:

```sql
create table designs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  params jsonb not null,
  exterior_front_url text,
  exterior_side_url text,
  exterior_aerial_url text,
  interior_living_url text,
  interior_kitchen_url text,
  interior_bedroom_url text,
  interior_bathroom_url text
);

alter table designs enable row level security;
create policy "Allow all" on designs for all using (true) with check (true);
```

---

## 📸 Screenshots

| Homepage | Design Form | Results |
|---|---|---|
| ![Home](https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80) | ![Form](https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80) | ![Results](https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80) |

---

## 📁 Project Structure