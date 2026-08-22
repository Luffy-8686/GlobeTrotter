# 🌍 GlobeTrotter — Intelligent Travel Planning Platform
### Odoo Hackathon 2026 | Custom Odoo 18 Module

---

## 📖 Overview

**GlobeTrotter** is a personalized, collaborative travel planning platform designed to help users build end-to-end multi-city itineraries, discover activities and destinations, visualize their timeline on an interactive calendar, track expenses with dynamic charts, and share public read-only trips with friends and the global community.

Built natively on **Odoo 18** using the Python ORM, QWeb, SCSS (custom design tokens + local fonts), and modern OWL (Odoo Web Library) components.

---

## ✨ Features & Screen Map

| # | Screen / Feature | Route / Access | Technology |
|---|---|---|---|
| **1** | **Authentication** | `/globetrotter/login`, `/globetrotter/signup` | QWeb + SCSS |
| **2** | **Dashboard** | `/globetrotter`, `/globetrotter/dashboard` | QWeb + SCSS |
| **3** | **Plan a Trip** | `/globetrotter/trip/create` | QWeb + Form Handling |
| **4** | **Itinerary Builder** | `/globetrotter/trip/<id>/edit` | OWL Component + RPC APIs |
| **5** | **Activity Picker & City Autocomplete** | Modal inside Itinerary Builder | OWL + JSON API |
| **6** | **Day-wise Itinerary View** | `/globetrotter/trip/<id>` | QWeb Day-grouped Layout |
| **7** | **My Trips (Tabs)** | `/globetrotter/trips` (Ongoing/Upcoming/Completed) | QWeb + Filtering |
| **8** | **Explore Cities & Activities** | `/globetrotter/explore/cities`, `/explore/activities` | QWeb + Multi-filter Search |
| **9** | **Budget & Cost Breakdown** | `/globetrotter/trip/<id>/budget` | OWL Component + Chart.js |
| **10** | **Trip Calendar & Timeline** | `/globetrotter/calendar` | OWL Component + Date Grid |
| **11** | **Public Itinerary Share** | `/trip/shared/<token>` (No Auth Required) | Public Controller + Clone Trip |
| **12** | **Profile & Travel Preferences** | `/globetrotter/profile` | QWeb + User Settings |
| **13** | **Community Trips Feed** | `/globetrotter/community` | QWeb + Public Itineraries |
| **14** | **Admin Analytics Dashboard** | Backend Menu → *GlobeTrotter → Trips/Analytics* | OWL + ORM `readGroup` |

---

## 🎨 Design System

- **Archetype**: *Experiential Disruptor* (warmth, belonging, premium exploration vibe)
- **Palette**: Strict 60-30-10 Rule
  - **60% Primary Surface**: `#FFFFFF` / `#F9F9F9`
  - **30% Secondary Teal**: `#00A699`
  - **10% Accent Coral**: `#FF5A5F`
- **Typography**: Locally hosted `.woff2` fonts (zero external CDN dependency):
  - Headings & Buttons: **Poppins** (400, 600, 700)
  - Body & Meta: **Inter** (400, 500, 600)
- **Grid**: 8px spatial rhythm throughout margins, paddings, and card components.
- **Accessibility**: WCAG AA compliant contrast and `prefers-reduced-motion` support.

---

## 🚀 Quick Start Guide

### Option 1: Using Docker (One Command)

```bash
docker compose up
```

Open `http://localhost:8069/globetrotter` in your browser.

### Option 2: Using Local Odoo 18 Installation

1. Add this folder's parent directory to your Odoo configuration addons path.
2. Run with module installation:
   ```bash
   python odoo-bin -c odoo.conf --addons-path="<path-to-odoo-addons>,c:\Users\MEGHRAJ\OneDrive\Desktop" -d globetrotter_db -i globetrotter --dev=xml,reload
   ```

---

## 🧪 Demo Data Included

The module comes pre-seeded with rich data ready for instant testing:
- **20 Global Cities** across Asia, Europe, Americas, Africa, Oceania, and Middle East.
- **70+ Curated Activities** with categories, durations, and estimated costs.
- **2 Ready-made Demo Trips**:
  - *"Grand European Discovery"* (Paris → Rome → Barcelona with activities, hotel/flight expenses, and public share link).
  - *"Wonders of Asia: Tokyo & Bali"*.
- **Pre-configured Public Share Link**:
  - `http://localhost:8069/trip/shared/demo-europe-2026`
  - `http://localhost:8069/trip/shared/demo-asia-wonders`

---

## 🏛️ Relational Data Models

```
gt.trip (1) ───< gt.stop (N) ───< gt.stop.activity (N) >─── gt.activity (1)
   │                                                               │
   ├───< gt.expense (N)                                            │
   ├───< gt.share.link (N)                                         │
   └───> res.users (1)                                      gt.city (1)
```

- `gt.trip`: Central trip entity with auto-computed states and cascading budget rollups.
- `gt.stop`: Multi-city travel stops with sequence ordering and day spans.
- `gt.stop.activity`: Activity scheduling with time slots and cost overrides.
- `gt.city`: Master city catalog with cost index, coordinates, and popularity scores.
- `gt.activity`: Master activity catalog with category and cost estimations.
- `gt.expense`: User-entered manual expenses with category tagging.
- `gt.share.link`: UUID-based token generator with atomic view counter increments.
- `res.users`: Inherited model for saved destinations, bio, and preferences.

---

## 🔒 Security Architecture

- **`globetrotter.group_user`**: Standard portal user group with record rules restricting read/write access to their own trips, stops, activities, expenses, and share links.
- **`globetrotter.group_admin`**: Full admin access with visibility over all trips, master data management, and the analytics dashboard.
- **`base.group_public`**: Read-only access to `/trip/shared/<token>` for unauthenticated visitors.
