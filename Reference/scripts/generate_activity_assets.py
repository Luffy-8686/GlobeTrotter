import os

# Activity category SVGs dictionary
activity_categories = {
    "sightseeing": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <defs>
    <linearGradient id="sightSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF6B6B"/>
      <stop offset="60%" stop-color="#FECA57"/>
      <stop offset="100%" stop-color="#48DBFB"/>
    </linearGradient>
  </defs>
  <rect width="400" height="250" fill="url(#sightSky)"/>
  <circle cx="200" cy="110" r="55" fill="#FFF" opacity="0.8"/>
  <polygon points="120,200 200,80 280,200" fill="#2C3E50"/>
  <polygon points="170,200 200,120 230,200" fill="#E74C3C"/>
  <rect y="195" width="400" height="55" fill="#1B1464"/>
  <text x="200" y="232" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">🏛️ SIGHTSEEING TOUR</text>
</svg>""",

    "culture": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <defs>
    <linearGradient id="cultSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#5F27CD"/>
      <stop offset="60%" stop-color="#341F97"/>
      <stop offset="100%" stop-color="#FF9FF3"/>
    </linearGradient>
  </defs>
  <rect width="400" height="250" fill="url(#cultSky)"/>
  <circle cx="200" cy="95" r="45" fill="#FECA57" opacity="0.85"/>
  <!-- Temple / Museum Pillars -->
  <g fill="#FFFFFF" opacity="0.9">
    <polygon points="100,110 200,60 300,110"/>
    <rect x="120" y="110" width="16" height="85"/>
    <rect x="160" y="110" width="16" height="85"/>
    <rect x="224" y="110" width="16" height="85"/>
    <rect x="264" y="110" width="16" height="85"/>
    <rect x="90" y="190" width="220" height="15"/>
  </g>
  <rect y="195" width="400" height="55" fill="#130F40"/>
  <text x="200" y="232" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">🎨 ART &amp; HERITAGE</text>
</svg>""",

    "food": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <defs>
    <linearGradient id="foodSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#EE5253"/>
      <stop offset="60%" stop-color="#FF9F43"/>
      <stop offset="100%" stop-color="#F368E0"/>
    </linearGradient>
  </defs>
  <rect width="400" height="250" fill="url(#foodSky)"/>
  <circle cx="200" cy="100" r="60" fill="#FFF" opacity="0.9"/>
  <!-- Bowl / Plate -->
  <path d="M150 110 Q200 160 250 110 Z" fill="#E74C3C"/>
  <ellipse cx="200" cy="110" rx="50" ry="12" fill="#2ECC71"/>
  <!-- Chopsticks / Fork -->
  <line x1="170" y1="60" x2="210" y2="120" stroke="#2C3E50" stroke-width="5" stroke-linecap="round"/>
  <line x1="185" y1="55" x2="225" y2="115" stroke="#2C3E50" stroke-width="5" stroke-linecap="round"/>
  <rect y="195" width="400" height="55" fill="#222F3E"/>
  <text x="200" y="232" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">🍜 GOURMET &amp; STREET FOOD</text>
</svg>""",

    "nature": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <defs>
    <linearGradient id="natSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10AC84"/>
      <stop offset="60%" stop-color="#1DD1A1"/>
      <stop offset="100%" stop-color="#48DBFB"/>
    </linearGradient>
  </defs>
  <rect width="400" height="250" fill="url(#natSky)"/>
  <circle cx="300" cy="70" r="35" fill="#FFF" opacity="0.75"/>
  <!-- Mountains -->
  <polygon points="40,200 160,80 280,200" fill="#006266"/>
  <polygon points="120,120 160,80 200,120" fill="#FFF"/>
  <polygon points="180,200 280,100 380,200" fill="#1B1464"/>
  <polygon points="250,130 280,100 310,130" fill="#FFF"/>
  <!-- Forest trees -->
  <polygon points="80,200 100,150 120,200" fill="#009432"/>
  <polygon points="140,200 160,140 180,200" fill="#009432"/>
  <rect y="195" width="400" height="55" fill="#006266"/>
  <text x="200" y="232" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">🌲 NATURE &amp; PARKS</text>
</svg>""",

    "adventure": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <defs>
    <linearGradient id="advSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#EE5253"/>
      <stop offset="60%" stop-color="#FF9F43"/>
      <stop offset="100%" stop-color="#54A0FF"/>
    </linearGradient>
  </defs>
  <rect width="400" height="250" fill="url(#advSky)"/>
  <circle cx="200" cy="85" r="45" fill="#FECA57" opacity="0.9"/>
  <!-- Adventure Mountains & Compass -->
  <polygon points="60,200 200,90 340,200" fill="#2C3E50"/>
  <polygon points="150,130 200,90 250,130" fill="#FFFFFF"/>
  <circle cx="200" cy="145" r="22" fill="#E74C3C"/>
  <polygon points="200,128 206,145 200,162 194,145" fill="#FFF"/>
  <rect y="195" width="400" height="55" fill="#2C3E50"/>
  <text x="200" y="232" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">⚡ OUTDOOR ADVENTURE</text>
</svg>""",

    "wellness": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <defs>
    <linearGradient id="wellSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00D2D3"/>
      <stop offset="50%" stop-color="#54A0FF"/>
      <stop offset="100%" stop-color="#5F27CD"/>
    </linearGradient>
  </defs>
  <rect width="400" height="250" fill="url(#wellSky)"/>
  <circle cx="200" cy="100" r="50" fill="#FFF" opacity="0.6"/>
  <!-- Lotus Flower -->
  <path d="M200 80 Q220 120 200 150 Q180 120 200 80 Z" fill="#FF9FF3"/>
  <path d="M180 100 Q150 130 180 150 Q195 130 180 100 Z" fill="#FDA7DF"/>
  <path d="M220 100 Q250 130 220 150 Q205 130 220 100 Z" fill="#FDA7DF"/>
  <rect y="195" width="400" height="55" fill="#341F97"/>
  <text x="200" y="232" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">🧘 SPA &amp; WELLNESS</text>
</svg>""",

    "nightlife": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <defs>
    <linearGradient id="nightSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0A3D62"/>
      <stop offset="50%" stop-color="#3C40C6"/>
      <stop offset="100%" stop-color="#575FCF"/>
    </linearGradient>
  </defs>
  <rect width="400" height="250" fill="url(#nightSky)"/>
  <!-- Neon Lights & Stage -->
  <circle cx="120" cy="70" r="3" fill="#FF3838"/><circle cx="280" cy="60" r="3" fill="#FF9F1A"/><circle cx="200" cy="40" r="3" fill="#67E6DC"/>
  <polygon points="120,70 160,195 80,195" fill="#FF3838" opacity="0.25"/>
  <polygon points="280,60 320,195 240,195" fill="#FF9F1A" opacity="0.25"/>
  <polygon points="200,40 240,195 160,195" fill="#67E6DC" opacity="0.25"/>
  <rect y="195" width="400" height="55" fill="#1E272E"/>
  <text x="200" y="232" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">🎭 SHOWS &amp; NIGHTLIFE</text>
</svg>"""
}

os.makedirs("public/images/activities", exist_ok=True)
for cat, svg in activity_categories.items():
    with open(f"public/images/activities/{cat}.svg", "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"Generated public/images/activities/{cat}.svg")

print("All activity category assets generated successfully.")
