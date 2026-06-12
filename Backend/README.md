# MOLE Backend API

> B2B Industrial Waste Exchange Platform — Nepal
> Hackathon MVP Backend | Node.js + Express + Supabase + Gemini Vision

---

## Quick Start

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Set Environment Variables
```bash
cp .env.example .env
# Edit .env with your Supabase and Gemini credentials
```

### 3. Set Up Database
1. Go to [Supabase Dashboard](https://app.supabase.com) → SQL Editor
2. Paste and run the contents of `scripts/createSchema.sql`
3. Go to Storage → Create bucket called `waste-photos` (set as Public)

### 4. Seed Demo Data
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
# Server runs on http://localhost:5000
```

---

## Environment Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `PORT` | Server port (default: 5000) | — |
| `SUPABASE_URL` | Supabase project URL | Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase anon/public key | Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Dashboard → Settings → API |
| `GEMINI_API_KEY` | Google Gemini API key | [console.cloud.google.com](https://console.cloud.google.com) |
| `JWT_SECRET` | Secret for signing JWTs | Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `FRONTEND_URL` | Next.js frontend URL (CORS) | `http://localhost:3000` in dev |

---

## API Reference

### Base URL
```
http://localhost:5000
```

### Authentication
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```
Get a token from `POST /api/auth/login`.

---

### 🔐 Auth Endpoints

#### `POST /api/auth/register`
Create a new account.
```json
{
  "email": "user@example.com",
  "password": "minSixChars",
  "full_name": "Ram Shrestha",
  "role": "generator",         // "generator" | "buyer" | "agent"
  "industry": "Biomass energy plants",  // required for buyers
  "phone": "+977-9841000000",
  "location": "Bhaktapur"
}
```

#### `POST /api/auth/login`
Sign in and receive JWT.
```json
{ "email": "user@example.com", "password": "password" }
```

#### `GET /api/auth/me` 🔒
Get current user's profile.

---

### 📋 Listings Endpoints

#### `GET /api/listings`
Get all active listings. Supports filters:
- `?category=wood_biomass` — filter by waste category
- `?neighborhood=Bhaktapur` — filter by neighborhood (partial match)
- `?page=1&limit=20` — pagination

#### `GET /api/listings/:id`
Get a single listing with seller profile.

#### `POST /api/listings` 🔒
Create a new waste listing.
```json
{
  "title": "Hardwood Offcuts — काठको धुलो",
  "category_code": "wood_biomass",
  "material_type": "Hardwood offcuts and sawdust",
  "quantity_kg": 300,
  "condition": "Clean",
  "price_npr_min": 4,
  "price_npr_max": 7,
  "neighborhood": "Bhaktapur / Thimi",
  "lat": 27.6727,
  "lng": 85.3990,
  "photo_url": "https://...",
  "ai_result": { ... }
}
```

#### `PUT /api/listings/:id` 🔒 (owner only)
Update listing status or details.
```json
{ "status": "sold" }
```

#### `DELETE /api/listings/:id` 🔒 (owner only)
Soft-delete (sets status to `expired`).

---

### 🤝 Matches Endpoints

#### `GET /api/matches` 🔒
Get listings matched to the authenticated buyer's industry profile.
Uses rule-based matching from PRD §4.3 — no ML needed.

**Response:**
```json
{
  "matches": [...],
  "matched_categories": ["wood_biomass"],
  "buyer_industry": "Biomass energy plants",
  "count": 3
}
```

#### `POST /api/matches` 🔒
Express buyer interest in a listing.
```json
{ "listing_id": "uuid-here" }
```

#### `PUT /api/matches/:id` 🔒
Update match status: `pending` → `contacted` → `closed`.
When status is set to `closed`, the system automatically:
- Logs the trade to `impact_log`
- Marks the listing as `sold`

---

### 🤖 AI Endpoints

#### `POST /api/ai/classify` 🔒
Upload a waste photo for Gemini Vision classification.
- Content-Type: `multipart/form-data`
- Field name: `image`
- Max size: 10 MB
- Supported formats: JPEG, PNG, WebP, GIF

**Response:**
```json
{
  "result": {
    "material_type": "Hardwood offcuts and sawdust",
    "category_code": "wood_biomass",
    "estimated_purity_pct": 82,
    "condition": "Clean",
    "price_range_npr": { "min": 4, "max": 7 },
    "buyer_industries": ["Biomass energy plants", "Paper mills", "Particle board factories"],
    "listing_title_suggestion": "Hardwood Offcuts — काठको धुलो"
  },
  "source": "gemini"   // or "fallback" if Gemini is unavailable
}
```

#### `GET /api/ai/fallbacks`
Get available pre-computed fallback responses for demo mode.

---

### 📊 Impact Endpoints

#### `GET /api/impact`
Get platform-wide aggregate stats (powers homepage ImpactCounter).

**Response:**
```json
{
  "total_kg_listed": 3750,
  "total_kg_traded": 420,
  "total_co2_saved_kg": 210.0,
  "active_listings": 8,
  "total_users": 3
}
```

---

### 🗂️ Categories Endpoints

#### `GET /api/categories`
Get all waste categories with buyer industry mappings.

#### `GET /api/categories/:code`
Get a single category. Valid codes:
`wood_biomass` | `plastic_hdpe` | `metal_ferrous` | `metal_nonferrous` | `textile_wool` | `concrete_rubble` | `brick_dust` | `paper_cardboard` | `glass_cullet` | `organic_food` | `other`

---

## Project Structure

```
Backend/
├── src/
│   ├── index.js                  # Express app entry point
│   ├── config/
│   │   ├── supabase.js           # Supabase admin + public clients
│   │   ├── gemini.js             # Gemini Vision client + system prompt
│   │   └── matchConfig.js        # Rule-based match engine config
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   └── upload.js             # Multer image upload middleware
│   ├── routes/
│   │   ├── auth.js
│   │   ├── listings.js
│   │   ├── matches.js
│   │   ├── ai.js
│   │   ├── impact.js
│   │   └── categories.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── listingsController.js
│   │   ├── matchesController.js
│   │   ├── aiController.js
│   │   ├── impactController.js
│   │   └── categoriesController.js
│   └── lib/
│       └── ai-fallbacks.json     # 3 demo fallback AI responses
├── scripts/
│   ├── createSchema.sql          # Full Supabase schema + RLS
│   └── seed.js                   # Demo data seeder (8 listings)
├── api.http                      # VS Code REST Client test file
├── .env.example                  # Environment variable template
├── package.json
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js 4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + JWT |
| AI | Google Gemini Vision (gemini-1.5-flash) |
| File Upload | Multer (in-memory) |
| Validation | Joi |
| Dev Server | Nodemon |

---

## Demo Credentials (after seeding)

| Role | Email | Industry |
|------|-------|----------|
| Generator | `ram.shrestha@demo.mole.np` | — |
| Buyer | `sita.thapa@demo.mole.np` | Biomass energy plants |
| Agent | `bijay.tamang@demo.mole.np` | — |

> **Note:** You must register these users via `/api/auth/register` (or Supabase Auth dashboard) before the seed data can reference them.

---

## CORS

The backend allows requests from `FRONTEND_URL` (default: `http://localhost:3000`).
For production, set `FRONTEND_URL=https://your-vercel-url.vercel.app` in `.env`.

---

*MOLE Team — Kathmandu Hackathon 2026*
