# GlobeTrotter
 
**Empowering Personalized Travel Planning**
 
GlobeTrotter is a personalized, intelligent, and collaborative platform that transforms the way individuals plan and experience travel. It's an end-to-end travel planning tool that lets users dream, design, and organize multi-city trips with ease — exploring destinations, visualizing itineraries, estimating budgets, and sharing plans within a community.
 
---
 
## Features
 
- **Multi-city itinerary builder** — add stops, assign travel dates, and reorder cities
- **City & activity search** — discover destinations and experiences by cost, popularity, and category
- **Automatic budget estimation** — cost breakdowns by transport, stay, activities, and meals with visual charts
- **Calendar & timeline views** — visualize the full trip day-by-day, with drag-to-reorder editing
- **Public sharing** — publish a read-only itinerary via a shareable link, with a "Copy Trip" option
- **User profiles** — manage account details, preferences, and saved destinations
- **Role-based admin dashboard** — track platform usage, top cities/activities, and user engagement (Admin-only)
- **Fully responsive UI** — no overlapping layouts across mobile, tablet, and desktop
---
 
## Screens
 
| # | Screen | Purpose |
|---|--------|---------|
| 1 | Login / Signup | Authenticate users to manage personal travel plans |
| 2 | Dashboard / Home | Navigate to trips and explore inspiration |
| 3 | Create Trip | Begin a new personalized travel plan |
| 4 | My Trips (Trip List) | Access and manage existing/upcoming trips |
| 5 | Itinerary Builder | Construct the full day-wise trip plan |
| 6 | Itinerary View | Review the full plan in a structured format |
| 7 | City Search | Discover and add cities to a trip |
| 8 | Activity Search | Enrich trips with sightseeing, food, and adventure |
| 9 | Trip Budget & Cost Breakdown | Stay informed and within budget |
| 10 | Trip Calendar / Timeline | Visualize the journey and daily plan flow |
| 11 | Shared/Public Itinerary View | Let others view, get inspired, or copy a trip |
| 12 | User Profile / Settings | Control account data, preferences, and privacy |
| 13 | Admin / Analytics Dashboard | Monitor app adoption and user behavior — gated to `ADMIN` role |
 
---
 
## Tech Stack
 
- **Frontend:** React (Vite), TypeScript, React Router, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL via **Supabase** (Prisma ORM)
- **Auth:** JWT-based email/password authentication with role-based access control (`USER` / `ADMIN`)
- **Validation:** Zod (request body validation on all POST/PUT routes)
- **Security:** Helmet (secure HTTP headers), express-rate-limit (auth route throttling)
- **Charts:** Chart.js / react-chartjs-2
- **Calendar/Timeline:** react-big-calendar with responsive overrides for mobile
- **Notifications:** react-toastify
---
 
## Database Schema (core entities)
 
- `User` — id, name, email, password_hash, profile_photo_url, language_preference, **role** (`USER` | `ADMIN`, default `USER`)
- `Trip` — id, user_id, name, description, start_date, end_date, cover_photo_url, is_public, share_slug
- `Stop` — id, trip_id, city_id, start_date, end_date, order_index
- `City` — id, name, country, region, cost_index, popularity_score, image_url
- `Activity` — id, city_id, name, description, category, cost, duration_minutes, image_url
- `TripActivity` — id, stop_id, activity_id, scheduled_date, scheduled_time, cost_override
- `BudgetItem` — id, trip_id, category, amount, date
- `SavedDestination` — id, user_id, city_id
---
 
## Getting Started
 
### Prerequisites
- Node.js (v18+)
- npm
- A [Supabase](https://supabase.com) project (free tier is fine)
### Installation
 
From the project root:
 
\`\`\`bash
# Clone the repository
git clone <repo-url>
cd globetrotter
 
# Install dependencies for both frontend and backend
npm run install:all
\`\`\`
 
### Environment Variables
 
Create a `.env` file in `backend/` (see `backend/.env.example`):
 
\`\`\`env
# From Supabase → Project Settings → Database → Connection String
DATABASE_URL=your_supabase_transaction_pooler_url
DIRECT_URL=your_supabase_direct_connection_url
 
JWT_SECRET=your_jwt_secret
PORT=5000
CLIENT_URL=http://localhost:5173
\`\`\`
 
> Generate a `JWT_SECRET` quickly with `openssl rand -base64 32`.
 
### Database Setup
 
\`\`\`bash
cd backend
npx prisma db push
npx prisma db seed
\`\`\`
 
This creates the schema in your Supabase project and seeds it with 20+ cities and 5+ activities per city.
 
### Running the App
 
From the project root:
 
\`\`\`bash
npm run dev
\`\`\`
 
This starts both the backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) concurrently.
 
---
 
## Responsive Design
 
GlobeTrotter is built mobile-first and tested across breakpoints (320px, 375px, 768px, 1024px, 1440px+) to ensure:
- No overlapping or clipped UI elements at any screen size
- Collapsible navigation on mobile
- Reflowing card/grid layouts
- Viewport-safe modals, dropdowns, and tooltips
- Responsive `react-big-calendar` and chart views (agenda/list reflow on small screens)
---
 
## Security & Validation
 
- Passwords hashed with `bcryptjs`
- JWT-based auth with role-based access control for admin routes
- Request body validation via `zod` on all write endpoints
- `helmet` for secure HTTP headers
- `express-rate-limit` on login/signup routes to prevent brute-force attempts
- Centralized error-handling middleware — no stack traces exposed to the client
---
 
## Project Structure
 
\`\`\`
globetrotter/
├── package.json           # Root scripts (concurrently runs frontend + backend)
├── frontend/               # React (Vite) + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Navbar, Cards, Modals, Forms
│   │   ├── context/         # AuthContext.tsx
│   │   ├── pages/           # All 13 screens (.tsx)
│   │   └── App.tsx
│   ├── tailwind.config.js
│   └── package.json
├── backend/                 # Express + Prisma + TypeScript backend
│   ├── src/
│   │   ├── routes/          # authRoutes, tripRoutes, cityRoutes, activityRoutes
│   │   ├── middleware/      # auth.ts, validateRequest.ts, rateLimiter.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── .env.example
│   └── package.json
└── README.md
\`\`\`
 
---
 
## Verification Checklist
 
- [ ] `npm run install:all` completes without errors
- [ ] `.env` filled with valid Supabase credentials
- [ ] `npx prisma db push` and `npx prisma db seed` succeed
- [ ] `npm run dev` starts both servers
- [ ] Signup, login, and invalid-login error handling work as expected
- [ ] Full flow: create trip → add stops → search cities → add activities → view budget & timeline
- [ ] Admin Dashboard is inaccessible to non-admin users, accessible to `ADMIN` role
- [ ] `react-big-calendar` reflows correctly on mobile
- [ ] No overlapping elements at 320px, 375px, 768px, 1024px, 1440px+
---
 
## Contributing
 
This project was built as part of a hackathon. Contributions, issues, and feature requests are welcome.
 
## License
 
This project is for educational/hackathon purposes.
