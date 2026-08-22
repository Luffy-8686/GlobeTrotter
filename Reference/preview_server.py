#!/usr/bin/env python3
"""
GlobeTrotter — Standalone Interactive Preview Server
Allows instant testing and visual exploration of all 14 screens without needing a full Odoo installation.
Runs with standard Python 3 (no pip dependencies required).
"""

import http.server
import json
import os
import re
import socketserver
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import date, datetime, timedelta

PORT = 8069
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# Load Master & Demo Data
# ---------------------------------------------------------------------------
cities_db = []
activities_db = []
trips_db = []

def load_data():
    global cities_db, activities_db, trips_db
    # 1. Parse cities & activities from XML seed
    seed_path = os.path.join(BASE_DIR, 'data', 'gt_city_activity_seed.xml')
    if os.path.exists(seed_path):
        tree = ET.parse(seed_path)
        root = tree.getroot()
        for rec in root.findall('.//record'):
            model = rec.get('model')
            rec_id = rec.get('id')
            data = {'id_str': rec_id}
            for f in rec.findall('field'):
                name = f.get('name')
                ref = f.get('ref')
                val = f.text or (ref if ref else '')
                data[name] = val

            if model == 'gt.city':
                data['id'] = len(cities_db) + 1
                data['popularity_score'] = int(data.get('popularity_score', 50))
                data['activity_count'] = 0
                cities_db.append(data)
            elif model == 'gt.activity':
                data['id'] = len(activities_db) + 1
                data['estimated_cost'] = float(data.get('estimated_cost', 0))
                data['duration_hours'] = float(data.get('duration_hours', 2.0))
                activities_db.append(data)

    # Link activity city names
    city_map = {c['id_str']: c for c in cities_db}
    for a in activities_db:
        city_ref = a.get('city_id', '')
        if city_ref in city_map:
            a['city_id'] = city_map[city_ref]['id']
            a['city_name'] = city_map[city_ref]['name']
            city_map[city_ref]['activity_count'] += 1

    # 2. Seed Initial Trips
    today = date.today()
    trips_db = [
        {
            'id': 1,
            'name': 'Grand European Discovery',
            'description': 'A dream journey through the iconic capitals of Europe — exploring Parisian art, Roman history, and Catalan culture.',
            'start_date': str(today - timedelta(days=2)),
            'end_date': str(today + timedelta(days=8)),
            'total_budget': 118400,
            'state': 'ongoing',
            'share_token': 'demo-europe-2026',
            'views': 42,
            'stops': [
                {
                    'id': 101,
                    'city_id': 4,
                    'city_name': 'Paris',
                    'city_country': 'France',
                    'arrival_date': str(today - timedelta(days=2)),
                    'departure_date': str(today + timedelta(days=1)),
                    'duration_days': 4,
                    'stop_budget': 5800,
                    'activity_count': 3,
                    'activities': [
                        {'id': 1001, 'activity_id': 1, 'activity_name': 'Eiffel Tower Visit', 'activity_category': 'sightseeing', 'time_slot': 'morning', 'duration_hours': 2.0, 'final_cost': 2600},
                        {'id': 1002, 'activity_id': 2, 'activity_name': 'Louvre Museum', 'activity_category': 'culture', 'time_slot': 'afternoon', 'duration_hours': 4.0, 'final_cost': 1700},
                        {'id': 1003, 'activity_id': 4, 'activity_name': 'Seine River Cruise', 'activity_category': 'sightseeing', 'time_slot': 'evening', 'duration_hours': 1.5, 'final_cost': 1500},
                    ]
                },
                {
                    'id': 102,
                    'city_id': 5,
                    'city_name': 'Rome',
                    'city_country': 'Italy',
                    'arrival_date': str(today + timedelta(days=2)),
                    'departure_date': str(today + timedelta(days=5)),
                    'duration_days': 4,
                    'stop_budget': 4800,
                    'activity_count': 3,
                    'activities': [
                        {'id': 1004, 'activity_id': 5, 'activity_name': 'Colosseum & Roman Forum', 'activity_category': 'culture', 'time_slot': 'morning', 'duration_hours': 3.5, 'final_cost': 1600},
                        {'id': 1005, 'activity_id': 6, 'activity_name': 'Vatican Museums & Sistine Chapel', 'activity_category': 'culture', 'time_slot': 'afternoon', 'duration_hours': 4.0, 'final_cost': 2000},
                        {'id': 1006, 'activity_id': 7, 'activity_name': 'Trastevere Food Walk', 'activity_category': 'food', 'time_slot': 'evening', 'duration_hours': 3.0, 'final_cost': 1200},
                    ]
                },
                {
                    'id': 103,
                    'city_id': 6,
                    'city_name': 'Barcelona',
                    'city_country': 'Spain',
                    'arrival_date': str(today + timedelta(days=6)),
                    'departure_date': str(today + timedelta(days=8)),
                    'duration_days': 3,
                    'stop_budget': 4100,
                    'activity_count': 2,
                    'activities': [
                        {'id': 1007, 'activity_id': 8, 'activity_name': 'La Sagrada Família', 'activity_category': 'sightseeing', 'time_slot': 'morning', 'duration_hours': 2.5, 'final_cost': 2600},
                        {'id': 1008, 'activity_id': 10, 'activity_name': 'La Boqueria Market & Tapas Crawl', 'activity_category': 'food', 'time_slot': 'evening', 'duration_hours': 3.0, 'final_cost': 1500},
                    ]
                }
            ],
            'expenses': [
                {'name': 'International Flights (Round-trip)', 'category': 'transport', 'amount': 45000},
                {'name': 'Paris Boutique Hotel (3 nights)', 'category': 'stay', 'amount': 24000},
                {'name': 'Rome City Center Hotel (3 nights)', 'category': 'stay', 'amount': 21000},
                {'name': 'Dining & Tapas budget', 'category': 'meal', 'amount': 18000},
            ]
        },
        {
            'id': 2,
            'name': 'Wonders of Asia: Tokyo & Bali',
            'description': 'Contrasting ultra-modern Tokyo with the spiritual serenity of Bali rice terraces and beaches.',
            'start_date': str(today + timedelta(days=20)),
            'end_date': str(today + timedelta(days=32)),
            'total_budget': 68500,
            'state': 'upcoming',
            'share_token': 'demo-asia-wonders',
            'views': 18,
            'stops': [
                {
                    'id': 201,
                    'city_id': 1,
                    'city_name': 'Tokyo',
                    'city_country': 'Japan',
                    'arrival_date': str(today + timedelta(days=20)),
                    'departure_date': str(today + timedelta(days=26)),
                    'duration_days': 7,
                    'stop_budget': 6500,
                    'activity_count': 3,
                    'activities': [
                        {'id': 2001, 'activity_id': 1, 'activity_name': 'Visit Senso-ji Temple', 'activity_category': 'culture', 'time_slot': 'morning', 'duration_hours': 2.0, 'final_cost': 0},
                        {'id': 2002, 'activity_id': 2, 'activity_name': 'Tsukiji Outer Market Food Tour', 'activity_category': 'food', 'time_slot': 'afternoon', 'duration_hours': 3.0, 'final_cost': 3500},
                        {'id': 2003, 'activity_id': 4, 'activity_name': 'TeamLab Borderless Digital Art', 'activity_category': 'culture', 'time_slot': 'evening', 'duration_hours': 2.5, 'final_cost': 3000},
                    ]
                },
                {
                    'id': 202,
                    'city_id': 19,
                    'city_name': 'Bali',
                    'city_country': 'Indonesia',
                    'arrival_date': str(today + timedelta(days=27)),
                    'departure_date': str(today + timedelta(days=32)),
                    'duration_days': 6,
                    'stop_budget': 2000,
                    'activity_count': 3,
                    'activities': [
                        {'id': 2004, 'activity_id': 19, 'activity_name': 'Tegallalang Rice Terraces', 'activity_category': 'nature', 'time_slot': 'morning', 'duration_hours': 2.5, 'final_cost': 200},
                        {'id': 2005, 'activity_id': 20, 'activity_name': 'Uluwatu Temple Sunset & Kecak Dance', 'activity_category': 'culture', 'time_slot': 'evening', 'duration_hours': 3.0, 'final_cost': 500},
                        {'id': 2006, 'activity_id': 22, 'activity_name': 'Ubud Spa & Yoga Retreat', 'activity_category': 'wellness', 'time_slot': 'morning', 'duration_hours': 4.0, 'final_cost': 1300},
                    ]
                }
            ],
            'expenses': [
                {'name': 'Flights (Tokyo + Bali)', 'category': 'transport', 'amount': 38000},
                {'name': 'Tokyo Hotel & Bali Villa', 'category': 'stay', 'amount': 22000},
            ]
        }
    ]

load_data()

# ---------------------------------------------------------------------------
# HTML Templates Generator
# ---------------------------------------------------------------------------
def render_layout(title, content, active_nav='home'):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} — GlobeTrotter</title>
    <link rel="stylesheet" href="/static/src/css/globetrotter.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        @font-face {{
            font-family: 'Poppins';
            src: url('/static/src/fonts/Poppins-Regular.woff2') format('woff2');
            font-weight: 400;
        }}
        @font-face {{
            font-family: 'Poppins';
            src: url('/static/src/fonts/Poppins-SemiBold.woff2') format('woff2');
            font-weight: 600;
        }}
        @font-face {{
            font-family: 'Poppins';
            src: url('/static/src/fonts/Poppins-Bold.woff2') format('woff2');
            font-weight: 700;
        }}
        @font-face {{
            font-family: 'Inter';
            src: url('/static/src/fonts/Inter-Regular.woff2') format('woff2');
            font-weight: 400;
        }}
        @font-face {{
            font-family: 'Inter';
            src: url('/static/src/fonts/Inter-SemiBold.woff2') format('woff2');
            font-weight: 600;
        }}
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            background-color: #FFFFFF;
            color: #222222;
        }}
        h1, h2, h3, h4, h5, h6, .gt-h1, .gt-h2, .gt-h3, .gt-btn {{
            font-family: 'Poppins', sans-serif;
        }}
    </style>
</head>
<body class="gt-page">
    <div class="gt-page-wrapper">
        <!-- Top Navbar -->
        <nav class="gt-navbar">
            <div class="gt-navbar-inner">
                <a href="/globetrotter" class="gt-navbar-brand">
                    <svg class="gt-navbar-brand-icon" viewBox="0 0 32 32" fill="none" style="width:28px;height:28px;">
                        <circle cx="16" cy="16" r="14" stroke="#FF5A5F" stroke-width="2"/>
                        <path d="M16 2C16 2 20 10 20 16C20 22 16 30 16 30" stroke="#FF5A5F" stroke-width="1.5"/>
                        <path d="M16 2C16 2 12 10 12 16C12 22 16 30 16 30" stroke="#FF5A5F" stroke-width="1.5"/>
                        <line x1="3" y1="12" x2="29" y2="12" stroke="#FF5A5F" stroke-width="1.5"/>
                        <line x1="3" y1="20" x2="29" y2="20" stroke="#FF5A5F" stroke-width="1.5"/>
                    </svg>
                    GlobeTrotter
                </a>
                <div class="gt-navbar-search">
                    <form action="/globetrotter/explore/cities" method="get" class="gt-search-input">
                        <svg class="gt-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" name="q" placeholder="Search cities, activities..."/>
                    </form>
                </div>
                <div class="gt-navbar-actions">
                    <a href="/globetrotter/explore/cities" class="gt-btn gt-btn--ghost gt-btn--sm">Explore</a>
                    <a href="/globetrotter/community" class="gt-btn gt-btn--ghost gt-btn--sm">Community</a>
                    <a href="/globetrotter/trip/create" class="gt-btn gt-btn--primary gt-btn--sm">+ Plan a Trip</a>
                    <a href="/globetrotter/profile" style="text-decoration:none;">
                        <div class="gt-avatar" style="width:36px;height:36px;background:#00A699;color:#FFF;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;">A</div>
                    </a>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="gt-page-content">
            <div class="gt-container">
                {content}
            </div>
        </main>

        <!-- Mobile Bottom Bar -->
        <nav class="gt-bottom-bar">
            <a href="/globetrotter" class="gt-bottom-bar-item {'active' if active_nav == 'home' else ''}">🏠 Home</a>
            <a href="/globetrotter/trips" class="gt-bottom-bar-item {'active' if active_nav == 'trips' else ''}">🧳 My Trips</a>
            <a href="/globetrotter/explore/cities" class="gt-bottom-bar-item {'active' if active_nav == 'explore' else ''}">🔍 Explore</a>
            <a href="/globetrotter/calendar" class="gt-bottom-bar-item {'active' if active_nav == 'calendar' else ''}">📅 Calendar</a>
            <a href="/globetrotter/profile" class="gt-bottom-bar-item {'active' if active_nav == 'profile' else ''}">👤 Profile</a>
        </nav>
    </div>
</body>
</html>"""

# ---------------------------------------------------------------------------
# Request Handler
# ---------------------------------------------------------------------------
class GlobeTrotterHandler(http.server.SimpleHTTPRequestHandler):

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        # Serve static assets
        if path.startswith('/static/'):
            return super().do_GET()

        # -------------------------------------------------------------------
        # Screen 2: Dashboard
        # -------------------------------------------------------------------
        if path in ['/', '/globetrotter', '/globetrotter/dashboard']:
            top_cities_html = ""
            for c in cities_db[:8]:
                cost_stars = '$' * int(c.get('cost_index', 1))
                top_cities_html += f"""
                <div class="gt-card" style="min-width:240px;background:#FFF;border:1px solid #E5E5E5;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <div style="height:140px;background:linear-gradient(135deg, #00A699, #FF5A5F);display:flex;align-items:center;justify-content:center;color:#FFF;font-size:36px;">
                        🏛️
                    </div>
                    <div class="gt-card-body" style="padding:16px;">
                        <h3 class="gt-card-title" style="margin:0 0 6px 0;font-size:18px;">{c['name']}</h3>
                        <div class="gt-card-meta" style="color:#767676;font-size:13px;">
                            <span>{c['country']}</span> · <span style="color:#FFB020;font-weight:600;">{cost_stars}</span> · <span>{c['activity_count']} activities</span>
                        </div>
                    </div>
                </div>"""

            my_trips_html = ""
            for t in trips_db:
                my_trips_html += f"""
                <div class="gt-card" style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);position:relative;">
                    <span class="gt-chip" style="position:absolute;top:12px;left:12px;background:rgba(255,255,255,0.9);color:#FF5A5F;font-weight:600;font-size:11px;padding:4px 10px;border-radius:20px;">{t['state'].upper()}</span>
                    <div style="height:140px;background:linear-gradient(135deg, #FF5A5F, #00A699);display:flex;align-items:center;justify-content:center;color:#FFF;font-size:40px;">✈️</div>
                    <div class="gt-card-body" style="padding:16px;">
                        <h3 class="gt-card-title" style="margin:0 0 6px 0;font-size:18px;">{t['name']}</h3>
                        <div class="gt-card-meta" style="color:#767676;font-size:13px;margin-bottom:8px;">
                            <span>📅 {t['start_date']} → {t['end_date']}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <span class="gt-chip" style="background:rgba(0,166,153,0.1);color:#00A699;padding:2px 8px;border-radius:4px;font-size:12px;">{len(t['stops'])} stops</span>
                            <span style="font-weight:700;color:#00A699;font-size:15px;">₹{t['total_budget']:,}</span>
                        </div>
                    </div>
                    <div style="display:flex;border-top:1px solid #E5E5E5;padding:8px 12px;gap:8px;">
                        <a href="/globetrotter/trip/{t['id']}" class="gt-btn gt-btn--ghost gt-btn--sm" style="flex:1;text-align:center;">View</a>
                        <a href="/globetrotter/trip/{t['id']}/edit" class="gt-btn gt-btn--ghost gt-btn--sm" style="flex:1;text-align:center;">Edit</a>
                        <a href="/globetrotter/trip/{t['id']}/budget" class="gt-btn gt-btn--ghost gt-btn--sm" style="flex:1;text-align:center;">Budget</a>
                    </div>
                </div>"""

            content = f"""
            <!-- Welcome Banner -->
            <div style="background:linear-gradient(135deg, #FF5A5F 0%, #FF8A80 50%, #00A699 100%);border-radius:16px;padding:36px;color:#FFF;margin-bottom:32px;">
                <h1 style="font-size:32px;margin:0 0 8px 0;">Welcome back, Explorer! ✈️</h1>
                <p style="font-size:18px;margin:0 0 20px 0;opacity:0.95;">Where will your next adventure take you?</p>
                <a href="/globetrotter/trip/create" class="gt-btn gt-btn--primary gt-btn--lg" style="background:#FFF;color:#FF5A5F;font-weight:700;border:none;box-shadow:0 4px 12px rgba(0,0,0,0.15);">+ Plan a New Trip</a>
            </div>

            <!-- Top Destinations -->
            <div class="gt-section" style="margin-bottom:36px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h2 class="gt-h2" style="margin:0;">🌏 Top Destinations</h2>
                    <a href="/globetrotter/explore/cities" class="gt-btn gt-btn--ghost gt-btn--sm">View All ({len(cities_db)})</a>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));gap:16px;">
                    {top_cities_html}
                </div>
            </div>

            <!-- Your Trips -->
            <div class="gt-section">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h2 class="gt-h2" style="margin:0;">🧳 Your Itineraries</h2>
                    <a href="/globetrotter/trips" class="gt-btn gt-btn--ghost gt-btn--sm">All Trips</a>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:20px;">
                    {my_trips_html}
                </div>
            </div>"""

            self.send_html(render_layout("Dashboard", content, 'home'))
            return

        # -------------------------------------------------------------------
        # Screen 3: Create Trip Form
        # -------------------------------------------------------------------
        if path == '/globetrotter/trip/create':
            today_str = str(date.today())
            next_week = str(date.today() + timedelta(days=7))
            content = f"""
            <div style="max-width:600px;margin:0 auto;">
                <h1 class="gt-h1">Plan a New Trip ✨</h1>
                <p style="color:#767676;margin-bottom:24px;">Fill in the details below to start building your itinerary.</p>
                <form action="/globetrotter/trip/create" method="post" style="background:#FFF;padding:24px;border:1px solid #E5E5E5;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <div class="gt-form-group" style="margin-bottom:16px;">
                        <label class="gt-label" style="display:block;font-weight:600;margin-bottom:6px;">Trip Name *</label>
                        <input type="text" name="name" class="gt-input" placeholder="e.g., Swiss Alps Adventure 2026" required style="width:100%;padding:10px;border:1px solid #E5E5E5;border-radius:6px;box-sizing:border-box;"/>
                    </div>
                    <div style="display:flex;gap:16px;margin-bottom:16px;">
                        <div style="flex:1;">
                            <label class="gt-label" style="display:block;font-weight:600;margin-bottom:6px;">Start Date *</label>
                            <input type="date" name="start_date" class="gt-input" value="{today_str}" required style="width:100%;padding:10px;border:1px solid #E5E5E5;border-radius:6px;box-sizing:border-box;"/>
                        </div>
                        <div style="flex:1;">
                            <label class="gt-label" style="display:block;font-weight:600;margin-bottom:6px;">End Date *</label>
                            <input type="date" name="end_date" class="gt-input" value="{next_week}" required style="width:100%;padding:10px;border:1px solid #E5E5E5;border-radius:6px;box-sizing:border-box;"/>
                        </div>
                    </div>
                    <div class="gt-form-group" style="margin-bottom:20px;">
                        <label class="gt-label" style="display:block;font-weight:600;margin-bottom:6px;">Trip Description / Notes</label>
                        <textarea name="description" class="gt-textarea" rows="3" placeholder="What are your goals or bucket list items for this trip?" style="width:100%;padding:10px;border:1px solid #E5E5E5;border-radius:6px;box-sizing:border-box;"></textarea>
                    </div>
                    <div style="display:flex;gap:12px;">
                        <a href="/globetrotter" class="gt-btn gt-btn--ghost">Cancel</a>
                        <button type="submit" class="gt-btn gt-btn--primary gt-btn--lg" style="flex:1;background:#FF5A5F;color:#FFF;border:none;padding:12px;border-radius:6px;font-weight:600;cursor:pointer;">Create Trip &amp; Add Stops →</button>
                    </div>
                </form>
            </div>"""
            self.send_html(render_layout("Create Trip", content, 'home'))
            return

        # -------------------------------------------------------------------
        # Screen 4/5: Itinerary Builder
        # -------------------------------------------------------------------
        match_edit = re.match(r'^/globetrotter/trip/(\d+)/edit$', path)
        if match_edit:
            trip_id = int(match_edit.group(1))
            trip = next((t for t in trips_db if t['id'] == trip_id), None)
            if not trip:
                self.send_error(404, "Trip Not Found")
                return

            stops_html = ""
            for idx, s in enumerate(trip['stops']):
                acts_html = ""
                for sa in s['activities']:
                    acts_html += f"""
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #F1F1F1;">
                        <div>
                            <div style="font-weight:600;font-size:14px;">🎯 {sa['activity_name']}</div>
                            <div style="font-size:12px;color:#767676;">⏱ {sa['duration_hours']}h · ⏰ {sa['time_slot'].title()}</div>
                        </div>
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span style="font-weight:600;color:#00A699;">₹{sa['final_cost']:,}</span>
                            <button onclick="removeActivity({s['id']}, {sa['id']})" style="background:none;border:none;color:#FF6666;cursor:pointer;font-size:16px;">✕</button>
                        </div>
                    </div>"""

                stops_html += f"""
                <div class="gt-stop-card" style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;margin-bottom:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <div style="background:#F9F9F9;padding:16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #E5E5E5;">
                        <div>
                            <span style="font-weight:700;font-size:16px;">📍 Stop {idx+1}: {s['city_name']}, {s['city_country']}</span>
                            <span style="color:#767676;font-size:13px;margin-left:12px;">📅 {s['arrival_date']} → {s['departure_date']} ({s['duration_days']} days)</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span style="font-weight:700;color:#00A699;">₹{s['stop_budget']:,}</span>
                            <button onclick="deleteStop({s['id']})" style="background:none;border:none;color:#FF6666;cursor:pointer;">🗑️ Delete</button>
                        </div>
                    </div>
                    <div style="padding:16px;">
                        {acts_html if acts_html else '<p style="color:#767676;font-size:13px;">No activities added yet.</p>'}
                        <button onclick="openActivityModal({s['id']}, {s['city_id']}, '{s['city_name']}')" class="gt-btn gt-btn--secondary gt-btn--sm" style="margin-top:12px;background:rgba(0,166,153,0.1);color:#00A699;border:1px solid #00A699;padding:6px 14px;border-radius:6px;cursor:pointer;">+ Add Activity</button>
                    </div>
                </div>"""

            content = f"""
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <div>
                    <h1 class="gt-h1" style="margin:0 0 6px 0;">{trip['name']}</h1>
                    <p style="color:#767676;margin:0;">📅 {trip['start_date']} → {trip['end_date']} · Total Budget: <strong style="color:#00A699;">₹{trip['total_budget']:,}</strong></p>
                </div>
                <div style="display:flex;gap:10px;">
                    <a href="/globetrotter/trip/{trip['id']}" class="gt-btn gt-btn--secondary gt-btn--sm">View Mode</a>
                    <a href="/globetrotter/trip/{trip['id']}/budget" class="gt-btn gt-btn--secondary gt-btn--sm">Budget Breakdown</a>
                    <a href="/trip/shared/{trip['share_token']}" target="_blank" class="gt-btn gt-btn--primary gt-btn--sm" style="background:#00A699;border-color:#00A699;">🔗 Public Share Link</a>
                </div>
            </div>

            <!-- Stops List -->
            <div id="stops-container">
                {stops_html}
            </div>

            <!-- Add Section Button -->
            <button onclick="openCityModal()" style="width:100%;border:2px dashed #00A699;background:rgba(0,166,153,0.05);color:#00A699;padding:16px;border-radius:12px;font-weight:600;font-size:15px;cursor:pointer;margin-top:12px;">
                + Add Another City Stop
            </button>

            <!-- Add Stop Modal -->
            <div id="city-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100;align-items:center;justify-content:center;">
                <div style="background:#FFF;padding:24px;border-radius:12px;max-width:480px;width:90%;">
                    <h3 style="margin-top:0;">Select Destination City</h3>
                    <select id="select-city-id" style="width:100%;padding:10px;margin-bottom:16px;border:1px solid #E5E5E5;border-radius:6px;">
                        {''.join([f"<option value='{c['id']}'>{c['name']}, {c['country']}</option>" for c in cities_db])}
                    </select>
                    <div style="display:flex;gap:8px;justify-content:flex-end;">
                        <button onclick="document.getElementById('city-modal').style.display='none'" class="gt-btn gt-btn--ghost">Cancel</button>
                        <button onclick="addStop()" class="gt-btn gt-btn--primary" style="background:#FF5A5F;color:#FFF;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;">Add Stop</button>
                    </div>
                </div>
            </div>

            <!-- Add Activity Modal -->
            <div id="act-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100;align-items:center;justify-content:center;">
                <div style="background:#FFF;padding:24px;border-radius:12px;max-width:540px;width:90%;max-height:80vh;overflow-y:auto;">
                    <h3 style="margin-top:0;" id="act-modal-title">Add Activity</h3>
                    <div id="act-list-container"></div>
                    <div style="display:flex;justify-content:flex-end;margin-top:16px;">
                        <button onclick="document.getElementById('act-modal').style.display='none'" class="gt-btn gt-btn--ghost">Close</button>
                    </div>
                </div>
            </div>

            <script>
                const currentTripId = {trip['id']};
                function openCityModal() {{
                    document.getElementById('city-modal').style.display = 'flex';
                }}
                function addStop() {{
                    const cityId = document.getElementById('select-city-id').value;
                    fetch('/globetrotter/api/stop/create', {{
                        method: 'POST',
                        headers: {{'Content-Type': 'application/json'}},
                        body: JSON.stringify({{trip_id: currentTripId, city_id: cityId}})
                    }}).then(() => window.location.reload());
                }}
                function deleteStop(stopId) {{
                    if (confirm('Delete this stop?')) {{
                        fetch('/globetrotter/api/stop/delete', {{
                            method: 'POST',
                            headers: {{'Content-Type': 'application/json'}},
                            body: JSON.stringify({{stop_id: stopId}})
                        }}).then(() => window.location.reload());
                    }}
                }}
                function openActivityModal(stopId, cityId, cityName) {{
                    document.getElementById('act-modal-title').innerText = 'Add Activities for ' + cityName;
                    document.getElementById('act-modal').style.display = 'flex';
                    fetch('/globetrotter/api/activities/search?city_id=' + cityId)
                        .then(r => r.json())
                        .then(acts => {{
                            let html = '';
                            acts.forEach(a => {{
                                html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #E5E5E5;">
                                    <div>
                                        <div style="font-weight:600;">${{a.name}}</div>
                                        <div style="font-size:12px;color:#767676;">⏱ ${{a.duration_hours}}h · ₹${{a.estimated_cost}}</div>
                                    </div>
                                    <button onclick="addActivityToStop(${{stopId}}, ${{a.id}})" class="gt-btn gt-btn--primary gt-btn--sm" style="background:#FF5A5F;color:#FFF;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;">+ Add</button>
                                </div>`;
                            }});
                            document.getElementById('act-list-container').innerHTML = html || '<p>No activities found.</p>';
                        }});
                }}
                function addActivityToStop(stopId, activityId) {{
                    fetch('/globetrotter/api/stop_activity/add', {{
                        method: 'POST',
                        headers: {{'Content-Type': 'application/json'}},
                        body: JSON.stringify({{stop_id: stopId, activity_id: activityId}})
                    }}).then(() => window.location.reload());
                }}
                function removeActivity(stopId, saId) {{
                    fetch('/globetrotter/api/stop_activity/remove', {{
                        method: 'POST',
                        headers: {{'Content-Type': 'application/json'}},
                        body: JSON.stringify({{stop_activity_id: saId}})
                    }}).then(() => window.location.reload());
                }}
            </script>"""
            self.send_html(render_layout(f"Edit {trip['name']}", content, 'trips'))
            return

        # -------------------------------------------------------------------
        # Screen 6: Itinerary View (Day-wise)
        # -------------------------------------------------------------------
        match_view = re.match(r'^/globetrotter/trip/(\d+)$', path)
        if match_view:
            trip_id = int(match_view.group(1))
            trip = next((t for t in trips_db if t['id'] == trip_id), None)
            if not trip:
                self.send_error(404, "Trip Not Found")
                return

            days_html = ""
            day_counter = 1
            for s in trip['stops']:
                for sa in s['activities']:
                    days_html += f"""
                    <div style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <span class="gt-chip" style="background:#00A699;color:#FFF;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:600;">Day {day_counter} · {s['city_name']}</span>
                                <h3 style="margin:8px 0 4px 0;font-size:18px;">{sa['activity_name']}</h3>
                                <div style="color:#767676;font-size:13px;">⏰ {sa['time_slot'].title()} · ⏱ {sa['duration_hours']} hours · 📍 {s['city_country']}</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-weight:700;color:#00A699;font-size:18px;">₹{sa['final_cost']:,}</div>
                            </div>
                        </div>
                    </div>"""
                    day_counter += 1

            content = f"""
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <div>
                    <h1 class="gt-h1" style="margin:0 0 6px 0;">{trip['name']}</h1>
                    <p style="color:#767676;margin:0;">📅 {trip['start_date']} → {trip['end_date']} · {len(trip['stops'])} destinations</p>
                </div>
                <div style="display:flex;gap:10px;">
                    <a href="/globetrotter/trip/{trip['id']}/edit" class="gt-btn gt-btn--primary gt-btn--sm" style="background:#FF5A5F;color:#FFF;border:none;">✏️ Edit Builder</a>
                    <a href="/globetrotter/trip/{trip['id']}/budget" class="gt-btn gt-btn--secondary gt-btn--sm">💰 Budget Charts</a>
                    <a href="/trip/shared/{trip['share_token']}" target="_blank" class="gt-btn gt-btn--secondary gt-btn--sm">🔗 Share Link</a>
                </div>
            </div>
            <div style="max-width:800px;margin:0 auto;">
                {days_html if days_html else '<p>No activities scheduled yet.</p>'}
            </div>"""
            self.send_html(render_layout(trip['name'], content, 'trips'))
            return

        # -------------------------------------------------------------------
        # Screen 9: Budget & Cost Breakdown (Chart.js)
        # -------------------------------------------------------------------
        match_budget = re.match(r'^/globetrotter/trip/(\d+)/budget$', path)
        if match_budget:
            trip_id = int(match_budget.group(1))
            trip = next((t for t in trips_db if t['id'] == trip_id), None)
            if not trip:
                self.send_error(404, "Trip Not Found")
                return

            act_total = sum(sa['final_cost'] for s in trip['stops'] for sa in s['activities'])
            exp_total = sum(e['amount'] for e in trip.get('expenses', []))

            content = f"""
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <div>
                    <h1 class="gt-h1" style="margin:0 0 6px 0;">Budget &amp; Costs</h1>
                    <p style="color:#767676;margin:0;">{trip['name']}</p>
                </div>
                <a href="/globetrotter/trip/{trip['id']}" class="gt-btn gt-btn--ghost gt-btn--sm">← Back to Itinerary</a>
            </div>

            <!-- Summary Cards -->
            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;margin-bottom:24px;">
                <div style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;padding:20px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <div style="font-size:28px;font-weight:700;color:#FF5A5F;">₹{trip['total_budget']:,}</div>
                    <div style="color:#767676;font-size:13px;margin-top:4px;">Total Budget</div>
                </div>
                <div style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;padding:20px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <div style="font-size:28px;font-weight:700;color:#00A699;">₹{act_total:,}</div>
                    <div style="color:#767676;font-size:13px;margin-top:4px;">Activity Costs</div>
                </div>
                <div style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;padding:20px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <div style="font-size:28px;font-weight:700;color:#222;">₹{exp_total:,}</div>
                    <div style="color:#767676;font-size:13px;margin-top:4px;">Hotels &amp; Flights</div>
                </div>
            </div>

            <!-- Charts -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <h3 style="margin-top:0;">Category Breakdown</h3>
                    <canvas id="pieChart" style="max-height:280px;"></canvas>
                </div>
                <div style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <h3 style="margin-top:0;">Destination Spending</h3>
                    <canvas id="barChart" style="max-height:280px;"></canvas>
                </div>
            </div>

            <script>
                const stops = {json.dumps(trip['stops'])};
                new Chart(document.getElementById('pieChart'), {{
                    type: 'doughnut',
                    data: {{
                        labels: ['Activities', 'Flights & Transport', 'Hotels & Stay', 'Food & Meals'],
                        datasets: [{{
                            data: [{act_total}, 45000, 45000, 18000],
                            backgroundColor: ['#FFB020', '#FF5A5F', '#00A699', '#FF8A80']
                        }}]
                    }},
                    options: {{ responsive: true }}
                }});

                new Chart(document.getElementById('barChart'), {{
                    type: 'bar',
                    data: {{
                        labels: stops.map(s => s.city_name),
                        datasets: [{{
                            label: 'Stop Budget (₹)',
                            data: stops.map(s => s.stop_budget),
                            backgroundColor: '#00A699',
                            borderRadius: 6
                        }}]
                    }},
                    options: {{ responsive: true }}
                }});
            </script>"""
            self.send_html(render_layout(f"Budget — {trip['name']}", content, 'trips'))
            return

        # -------------------------------------------------------------------
        # Screen 7: My Trips (Tabs)
        # -------------------------------------------------------------------
        if path == '/globetrotter/trips':
            trips_html = ""
            for t in trips_db:
                trips_html += f"""
                <div class="gt-card" style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);margin-bottom:16px;display:flex;">
                    <div style="width:160px;background:linear-gradient(135deg, #FF5A5F, #00A699);display:flex;align-items:center;justify-content:center;color:#FFF;font-size:40px;">✈️</div>
                    <div style="padding:20px;flex:1;">
                        <span class="gt-chip" style="background:rgba(255,90,95,0.1);color:#FF5A5F;font-weight:600;font-size:12px;padding:2px 8px;border-radius:4px;">{t['state'].upper()}</span>
                        <h3 style="margin:8px 0 6px 0;font-size:20px;">{t['name']}</h3>
                        <p style="color:#767676;font-size:14px;margin:0 0 12px 0;">📅 {t['start_date']} → {t['end_date']} · {len(t['stops'])} stops · 💰 ₹{t['total_budget']:,}</p>
                        <div style="display:flex;gap:10px;">
                            <a href="/globetrotter/trip/{t['id']}" class="gt-btn gt-btn--secondary gt-btn--sm">View</a>
                            <a href="/globetrotter/trip/{t['id']}/edit" class="gt-btn gt-btn--secondary gt-btn--sm">Edit</a>
                            <a href="/globetrotter/trip/{t['id']}/budget" class="gt-btn gt-btn--secondary gt-btn--sm">Budget</a>
                            <a href="/trip/shared/{t['share_token']}" target="_blank" class="gt-btn gt-btn--ghost gt-btn--sm">Share</a>
                        </div>
                    </div>
                </div>"""

            content = f"""
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 class="gt-h1" style="margin:0;">My Trips</h1>
                <a href="/globetrotter/trip/create" class="gt-btn gt-btn--primary">+ Plan a Trip</a>
            </div>
            <div>{trips_html}</div>"""
            self.send_html(render_layout("My Trips", content, 'trips'))
            return

        # -------------------------------------------------------------------
        # Screen 8: Explore Cities
        # -------------------------------------------------------------------
        if path == '/globetrotter/explore/cities':
            q = params.get('q', [''])[0].lower()
            region = params.get('region', [''])[0]

            filtered = cities_db
            if q:
                filtered = [c for c in filtered if q in c['name'].lower() or q in c['country'].lower()]
            if region:
                filtered = [c for c in filtered if c.get('region') == region]

            cities_html = ""
            for c in filtered:
                cost_stars = '$' * int(c.get('cost_index', 1))
                cities_html += f"""
                <div class="gt-card" style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <div style="height:140px;background:linear-gradient(135deg, #00A699, #FF5A5F);display:flex;align-items:center;justify-content:center;color:#FFF;font-size:36px;">
                        🏛️
                    </div>
                    <div class="gt-card-body" style="padding:16px;">
                        <h3 class="gt-card-title" style="margin:0 0 6px 0;font-size:18px;">{c['name']}</h3>
                        <div class="gt-card-meta" style="color:#767676;font-size:13px;margin-bottom:8px;">
                            <span>{c['country']}</span> · <span style="color:#FFB020;font-weight:600;">{cost_stars}</span> · <span>{c['activity_count']} activities</span>
                        </div>
                        <p style="font-size:13px;color:#666;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                            {c.get('description', '')}
                        </p>
                    </div>
                </div>"""

            content = f"""
            <h1 class="gt-h1">Explore Cities 🌍</h1>
            <form action="/globetrotter/explore/cities" method="get" style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
                <input type="text" name="q" value="{q}" placeholder="Search cities or country..." class="gt-input" style="flex:2;min-width:200px;padding:10px;border:1px solid #E5E5E5;border-radius:6px;"/>
                <select name="region" class="gt-select" style="flex:1;min-width:140px;padding:10px;border:1px solid #E5E5E5;border-radius:6px;">
                    <option value="">All Regions</option>
                    <option value="asia" {'selected' if region=='asia' else ''}>Asia</option>
                    <option value="europe" {'selected' if region=='europe' else ''}>Europe</option>
                    <option value="north_america" {'selected' if region=='north_america' else ''}>North America</option>
                    <option value="south_america" {'selected' if region=='south_america' else ''}>South America</option>
                    <option value="africa" {'selected' if region=='africa' else ''}>Africa</option>
                    <option value="middle_east" {'selected' if region=='middle_east' else ''}>Middle East</option>
                    <option value="oceania" {'selected' if region=='oceania' else ''}>Oceania</option>
                </select>
                <button type="submit" class="gt-btn gt-btn--secondary" style="padding:10px 20px;">Search</button>
            </form>
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:20px;">
                {cities_html if cities_html else '<p>No destinations found.</p>'}
            </div>"""
            self.send_html(render_layout("Explore Cities", content, 'explore'))
            return

        # -------------------------------------------------------------------
        # Screen 10: Calendar Timeline
        # -------------------------------------------------------------------
        if path == '/globetrotter/calendar':
            content = f"""
            <h1 class="gt-h1">Trip Calendar 📅</h1>
            <p style="color:#767676;margin-bottom:24px;">View your upcoming and ongoing itineraries on a monthly calendar timeline.</p>
            <div style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                <div style="display:grid;grid-template-columns:repeat(7, 1fr);gap:1px;background:#E5E5E5;border-radius:8px;overflow:hidden;">
                    {''.join([f'<div style="background:#F9F9F9;padding:12px;text-align:center;font-weight:600;font-size:13px;color:#767676;">{d}</div>' for d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']])}
                    {''.join([f'''
                    <div style="background:#FFF;min-height:90px;padding:8px;position:relative;">
                        <span style="font-size:12px;font-weight:600;color:#999;">{i}</span>
                        {('<div style="background:#FF5A5F;color:#FFF;font-size:11px;font-weight:600;padding:2px 6px;border-radius:4px;margin-top:4px;">Grand European Discovery</div>' if i in [20,21,22,23,24,25,26,27] else '')}
                    </div>''' for i in range(1, 31)])}
                </div>
            </div>"""
            self.send_html(render_layout("Trip Calendar", content, 'calendar'))
            return

        # -------------------------------------------------------------------
        # Screen 11: Public Shared Trip (No Auth Required)
        # -------------------------------------------------------------------
        match_share = re.match(r'^/trip/shared/([a-zA-Z0-9_-]+)$', path)
        if match_share:
            token = match_share.group(1)
            trip = next((t for t in trips_db if t.get('share_token') == token), None)
            if not trip:
                self.send_error(404, "Shared Trip Link Invalid or Expired")
                return

            trip['views'] = trip.get('views', 0) + 1

            days_html = ""
            for s in trip['stops']:
                for sa in s['activities']:
                    days_html += f"""
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #E5E5E5;">
                        <div>
                            <div style="font-weight:600;font-size:15px;">🎯 {sa['activity_name']}</div>
                            <div style="font-size:13px;color:#767676;">📍 {s['city_name']}, {s['city_country']} · ⏱ {sa['duration_hours']}h</div>
                        </div>
                        <div style="font-weight:700;color:#00A699;font-size:15px;">₹{sa['final_cost']:,}</div>
                    </div>"""

            content = f"""
            <div style="text-align:center;padding:32px 0 20px 0;">
                <div style="width:64px;height:64px;background:#00A699;color:#FFF;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;margin:0 auto 12px auto;">A</div>
                <div style="color:#767676;font-size:14px;">Shared by <strong>Admin Traveller</strong> · 👁️ {trip['views']} views</div>
                <h1 style="font-size:36px;margin:8px 0 12px 0;">{trip['name']}</h1>
                <p style="color:#666;max-width:600px;margin:0 auto 16px auto;">{trip.get('description','')}</p>
                <div style="display:flex;justify-content:center;gap:16px;color:#767676;font-size:14px;margin-bottom:24px;">
                    <span>📅 {trip['start_date']} → {trip['end_date']}</span>
                    <span>📍 {len(trip['stops'])} destinations</span>
                    <span>💰 Total: <strong style="color:#00A699;">₹{trip['total_budget']:,}</strong></span>
                </div>
                <div style="display:flex;justify-content:center;gap:12px;">
                    <a href="/globetrotter/trip/{trip['id']}/edit" class="gt-btn gt-btn--primary" style="background:#FF5A5F;color:#FFF;border:none;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600;">📋 Copy This Trip to My Account</a>
                    <button onclick="navigator.clipboard.writeText(window.location.href);alert('Public link copied to clipboard!');" class="gt-btn gt-btn--secondary" style="padding:10px 20px;">🔗 Copy Share Link</button>
                </div>
            </div>

            <div style="max-width:720px;margin:32px auto;background:#FFF;border:1px solid #E5E5E5;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                <h3 style="margin-top:0;border-bottom:2px solid #00A699;padding-bottom:8px;">Itinerary Schedule</h3>
                {days_html}
            </div>"""
            self.send_html(render_layout(f"Shared Itinerary: {trip['name']}", content, ''))
            return

        # -------------------------------------------------------------------
        # Screen 12: Profile & Settings
        # -------------------------------------------------------------------
        if path == '/globetrotter/profile':
            content = f"""
            <div style="max-width:600px;margin:0 auto;">
                <h1 class="gt-h1">Profile &amp; Settings ⚙️</h1>
                <div style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #E5E5E5;">
                        <div style="width:64px;height:64px;background:#00A699;color:#FFF;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;">A</div>
                        <div>
                            <h3 style="margin:0 0 4px 0;">Admin Traveller</h3>
                            <p style="color:#767676;margin:0;font-size:14px;">admin@globetrotter.app</p>
                        </div>
                    </div>
                    <div class="gt-form-group" style="margin-bottom:16px;">
                        <label class="gt-label" style="display:block;font-weight:600;margin-bottom:6px;">Bio</label>
                        <textarea class="gt-textarea" rows="3" style="width:100%;padding:10px;border:1px solid #E5E5E5;border-radius:6px;box-sizing:border-box;">Global wanderer, foodie, and architecture enthusiast. Always planning the next voyage.</textarea>
                    </div>
                    <div class="gt-form-group" style="margin-bottom:20px;">
                        <label class="gt-label" style="display:block;font-weight:600;margin-bottom:6px;">Travel Preferences</label>
                        <input type="text" class="gt-input" value="Culture, Food, Adventure, Architecture" style="width:100%;padding:10px;border:1px solid #E5E5E5;border-radius:6px;box-sizing:border-box;"/>
                    </div>
                    <button class="gt-btn gt-btn--primary" style="background:#00A699;color:#FFF;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;">Save Changes</button>
                </div>
            </div>"""
            self.send_html(render_layout("Profile", content, 'profile'))
            return

        # -------------------------------------------------------------------
        # Screen 13: Community Feed
        # -------------------------------------------------------------------
        if path == '/globetrotter/community':
            community_html = ""
            for t in trips_db:
                community_html += f"""
                <div class="gt-card" style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <div style="height:140px;background:linear-gradient(135deg, #00A699, #FF5A5F);display:flex;align-items:center;justify-content:center;color:#FFF;font-size:40px;">🌍</div>
                    <div style="padding:16px;">
                        <span style="font-size:12px;color:#767676;">Shared by <strong>Traveller</strong> · 👁️ {t.get('views', 0)} views</span>
                        <h3 style="margin:8px 0 6px 0;font-size:18px;">{t['name']}</h3>
                        <p style="color:#666;font-size:13px;margin:0 0 12px 0;">{t.get('description','')}</p>
                        <a href="/trip/shared/{t['share_token']}" class="gt-btn gt-btn--secondary gt-btn--sm" style="display:block;text-align:center;">View Public Itinerary</a>
                    </div>
                </div>"""

            content = f"""
            <h1 class="gt-h1">Community Itineraries 🌐</h1>
            <p style="color:#767676;margin-bottom:24px;">Get inspired by curated trips published by fellow travellers.</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:20px;">
                {community_html}
            </div>"""
            self.send_html(render_layout("Community Feed", content, ''))
            return

        # -------------------------------------------------------------------
        # Screen 14: Admin Analytics
        # -------------------------------------------------------------------
        if path in ['/globetrotter/admin', '/web']:
            content = f"""
            <h1 class="gt-h1">GlobeTrotter Analytics Dashboard 📊</h1>
            <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:16px;margin-bottom:24px;">
                <div style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <div style="font-size:32px;font-weight:700;color:#FF5A5F;">{len(trips_db)}</div>
                    <div style="color:#767676;font-size:13px;">Total Trips Planned</div>
                </div>
                <div style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <div style="font-size:32px;font-weight:700;color:#00A699;">{len(cities_db)}</div>
                    <div style="color:#767676;font-size:13px;">Master Cities</div>
                </div>
                <div style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <div style="font-size:32px;font-weight:700;color:#FFB020;">{len(activities_db)}</div>
                    <div style="color:#767676;font-size:13px;">Curated Activities</div>
                </div>
                <div style="background:#FFF;border:1px solid #E5E5E5;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <div style="font-size:32px;font-weight:700;color:#222;">{sum(t.get('views',0) for t in trips_db)}</div>
                    <div style="color:#767676;font-size:13px;">Public Shares &amp; Views</div>
                </div>
            </div>"""
            self.send_html(render_layout("Admin Analytics", content, ''))
            return

        # -------------------------------------------------------------------
        # JSON APIs
        # -------------------------------------------------------------------
        if path == '/globetrotter/api/activities/search':
            city_id = int(params.get('city_id', [0])[0])
            results = [a for a in activities_db if a['city_id'] == city_id]
            self.send_json(results)
            return

        # Fallback to file serving
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(length)

        # Form submission: create trip
        if path == '/globetrotter/trip/create':
            form = urllib.parse.parse_qs(post_data.decode('utf-8'))
            name = form.get('name', ['New Trip'])[0]
            start_date = form.get('start_date', [str(date.today())])[0]
            end_date = form.get('end_date', [str(date.today() + timedelta(days=7))])[0]
            description = form.get('description', [''])[0]

            new_id = max([t['id'] for t in trips_db] or [0]) + 1
            new_trip = {
                'id': new_id,
                'name': name,
                'start_date': start_date,
                'end_date': end_date,
                'description': description,
                'total_budget': 0,
                'state': 'upcoming',
                'share_token': f'trip-{new_id}-preview',
                'views': 0,
                'stops': [],
                'expenses': []
            }
            trips_db.append(new_trip)

            self.send_response(303)
            self.send_header('Location', f'/globetrotter/trip/{new_id}/edit')
            self.end_headers()
            return

        # JSON RPC APIs
        try:
            data = json.loads(post_data.decode('utf-8'))
        except:
            data = {}

        if path == '/globetrotter/api/stop/create':
            trip_id = int(data.get('trip_id'))
            city_id = int(data.get('city_id'))
            city = next((c for c in cities_db if c['id'] == city_id), None)
            trip = next((t for t in trips_db if t['id'] == trip_id), None)
            if trip and city:
                new_stop = {
                    'id': len(trip['stops']) + 101,
                    'city_id': city['id'],
                    'city_name': city['name'],
                    'city_country': city['country'],
                    'arrival_date': trip['start_date'],
                    'departure_date': trip['end_date'],
                    'duration_days': 3,
                    'stop_budget': 0,
                    'activity_count': 0,
                    'activities': []
                }
                trip['stops'].append(new_stop)
                self.send_json({'success': True, 'stop': new_stop})
                return

        if path == '/globetrotter/api/stop/delete':
            stop_id = int(data.get('stop_id'))
            for t in trips_db:
                t['stops'] = [s for s in t['stops'] if s['id'] != stop_id]
                t['total_budget'] = sum(sa['final_cost'] for s in t['stops'] for sa in s['activities'])
            self.send_json({'success': True})
            return

        if path == '/globetrotter/api/stop_activity/add':
            stop_id = int(data.get('stop_id'))
            activity_id = int(data.get('activity_id'))
            act = next((a for a in activities_db if a['id'] == activity_id), None)
            for t in trips_db:
                for s in t['stops']:
                    if s['id'] == stop_id and act:
                        new_sa = {
                            'id': len(s['activities']) + 1001,
                            'activity_id': act['id'],
                            'activity_name': act['name'],
                            'activity_category': act.get('category', 'sightseeing'),
                            'time_slot': 'morning',
                            'duration_hours': act.get('duration_hours', 2.0),
                            'final_cost': act.get('estimated_cost', 0)
                        }
                        s['activities'].append(new_sa)
                        s['stop_budget'] = sum(a['final_cost'] for a in s['activities'])
                        s['activity_count'] = len(s['activities'])
                t['total_budget'] = sum(sa['final_cost'] for s in t['stops'] for sa in s['activities'])
            self.send_json({'success': True})
            return

        if path == '/globetrotter/api/stop_activity/remove':
            sa_id = int(data.get('stop_activity_id'))
            for t in trips_db:
                for s in t['stops']:
                    s['activities'] = [a for a in s['activities'] if a['id'] != sa_id]
                    s['stop_budget'] = sum(a['final_cost'] for a in s['activities'])
                    s['activity_count'] = len(s['activities'])
                t['total_budget'] = sum(sa['final_cost'] for s in t['stops'] for sa in s['activities'])
            self.send_json({'success': True})
            return

        self.send_json({'status': 'ok'})

    def send_html(self, html):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(html.encode('utf-8'))

    def send_json(self, obj):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(obj).encode('utf-8'))


if __name__ == '__main__':
    import sys
    if sys.stdout.encoding != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except:
            pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), GlobeTrotterHandler) as httpd:
        print("============================================================")
        print("  GlobeTrotter Standalone Preview Server Running")
        print(f"  --> http://localhost:{PORT}/globetrotter")
        print(f"  --> http://localhost:{PORT}/trip/shared/demo-europe-2026")
        print("============================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
