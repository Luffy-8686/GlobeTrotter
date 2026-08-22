# GlobeTrotter

**Empowering Personalized Travel Planning**

GlobeTrotter is a personalized, intelligent, and collaborative platform that transforms the way individuals plan and experience travel. It's an end-to-end travel planning tool that lets users dream, design, and organize multi-city trips with ease — exploring destinations, visualizing itineraries, estimating budgets, and sharing plans within a community.

---

## ✨ Features

- **Multi-city itinerary builder** — add stops, assign travel dates, and reorder cities
- **City & activity search** — discover destinations and experiences by cost, popularity, and category
- **Automatic budget estimation** — cost breakdowns by transport, stay, activities, and meals with visual charts
- **Calendar & timeline views** — visualize the full trip day-by-day, with drag-to-reorder editing
- **Public sharing** — publish a read-only itinerary via a shareable link, with a "Copy Trip" option
- **User profiles** — manage account details, preferences, and saved destinations
- **Admin dashboard (optional)** — track platform usage, top cities/activities, and user engagement
- **Fully responsive UI** — no overlapping layouts across mobile, tablet, and desktop

---

## 🖥️ Screens

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
| 13 | Admin / Analytics Dashboard *(optional)* | Monitor app adoption and user behavior |

---

## 🛠️ Tech Stack

- **Frontend:** React, React Router, Tailwind CSS
- **Backend:** Node.js, Express (REST API)
- **Database:** PostgreSQL (via Prisma or Sequelize)
- **Auth:** JWT-based email/password authentication
- **Charts:** Chart.js / Recharts
- **Calendar/Timeline:** FullCalendar or a custom drag-and-drop timeline component

---

## 🗄️ Database Schema (core entities)

- `users` — id, name, email, password_hash, profile_photo_url, language_preference
- `trips` — id, user_id, name, description, start_date, end_date, cover_photo_url, is_public, share_slug
- `stops` — id, trip_id, city_id, start_date, end_date, order_index
- `cities` — id, name, country, region, cost_index, popularity_score, image_url
- `activities` — id, city_id, name, description, category, cost, duration_minutes, image_url
- `trip_activities` — id, stop_id, activity_id, scheduled_date, scheduled_time, cost_override
- `budget_items` — id, trip_id, category, amount, date
- `saved_destinations` — id, user_id, city_id

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd globetrotter

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in the `server` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/globetrotter
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Database Setup

```bash
cd server
npx prisma migrate dev --name init
npx prisma db seed
```

### Running the App

```bash
# Start the backend (from /server)
npm run dev

# Start the frontend (from /client)
npm run dev
```

The app will be available at `http://localhost:3000` (frontend) and `http://localhost:5000` (API).

---

## 📱 Responsive Design

GlobeTrotter is built mobile-first and tested across breakpoints (320px, 375px, 768px, 1024px, 1440px+) to ensure:
- No overlapping or clipped UI elements at any screen size
- Collapsible navigation on mobile
- Reflowing card/grid layouts
- Viewport-safe modals, dropdowns, and tooltips
- Responsive charts and calendar views

---

## 📁 Project Structure

```
globetrotter/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── App.jsx
│   └── package.json
├── server/          # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── index.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── package.json
└── README.md
```

---

## 🤝 Contributing

This project was built as part of a hackathon. Contributions, issues, and feature requests are welcome.

## 📄 License

This project is for educational/hackathon purposes.
