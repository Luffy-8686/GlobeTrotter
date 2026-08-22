import os

# Destination SVGs dictionary
city_svgs = {
    "paris": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="parisSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF7E5F"/>
      <stop offset="40%" stop-color="#FEB47B"/>
      <stop offset="80%" stop-color="#FFECCC"/>
      <stop offset="100%" stop-color="#D4E6F1"/>
    </linearGradient>
    <linearGradient id="eiffelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2C3E50"/>
      <stop offset="100%" stop-color="#1A252F"/>
    </linearGradient>
    <linearGradient id="riverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#85C1E9"/>
      <stop offset="100%" stop-color="#2E86C1"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#parisSky)"/>
  <circle cx="400" cy="240" r="140" fill="#FFF275" opacity="0.45" />
  <!-- Distant Paris Buildings -->
  <path d="M0 380 L60 380 L60 350 L100 350 L100 380 L180 380 L180 340 L220 340 L220 380 L580 380 L580 330 L640 330 L640 380 L720 380 L720 350 L800 350 L800 420 L0 420 Z" fill="#D5D8DC" opacity="0.7"/>
  <!-- Seine River -->
  <rect y="400" width="800" height="100" fill="url(#riverGrad)"/>
  <!-- River reflections -->
  <ellipse cx="400" cy="430" rx="120" ry="8" fill="#FFF275" opacity="0.3"/>
  <!-- Eiffel Tower -->
  <g fill="url(#eiffelGrad)">
    <!-- Base legs -->
    <path d="M340 400 L360 400 L378 280 L350 280 Z"/>
    <path d="M460 400 L440 400 L422 280 L450 280 Z"/>
    <!-- Bottom Arch -->
    <path d="M360 400 Q400 340 440 400 Q400 355 360 400 Z" fill="#1A252F"/>
    <!-- 1st platform -->
    <rect x="345" y="275" width="110" height="12" rx="3"/>
    <!-- Middle tier -->
    <path d="M352 275 L372 170 L428 170 L448 275 Z"/>
    <!-- 2nd platform -->
    <rect x="368" y="165" width="64" height="10" rx="2"/>
    <!-- Spire tower -->
    <path d="M375 165 L395 60 L405 60 L425 165 Z"/>
    <!-- Spire top dome and antenna -->
    <rect x="396" y="40" width="8" height="20" rx="2"/>
    <line x1="400" y1="40" x2="400" y2="15" stroke="#1A252F" stroke-width="4" stroke-linecap="round"/>
  </g>
  <!-- City Trees -->
  <circle cx="280" cy="385" r="22" fill="#27AE60" opacity="0.85"/>
  <circle cx="310" cy="390" r="16" fill="#1E8449" opacity="0.9"/>
  <circle cx="490" cy="390" r="18" fill="#27AE60" opacity="0.85"/>
  <circle cx="520" cy="385" r="24" fill="#1E8449" opacity="0.9"/>
  <!-- Flying birds -->
  <path d="M150 120 Q160 110 170 120 Q180 110 190 120" stroke="#2C3E50" stroke-width="2.5" fill="none"/>
  <path d="M210 95 Q218 87 226 95 Q234 87 242 95" stroke="#2C3E50" stroke-width="2" fill="none"/>
  <path d="M620 130 Q630 120 640 130 Q650 120 660 130" stroke="#2C3E50" stroke-width="2.5" fill="none"/>
</svg>""",

    "tokyo": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="tokyoSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1B1464"/>
      <stop offset="40%" stop-color="#EA2027"/>
      <stop offset="80%" stop-color="#FDA7DF"/>
      <stop offset="100%" stop-color="#FFF0F5"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#tokyoSky)"/>
  <!-- Rising Sun -->
  <circle cx="400" cy="220" r="120" fill="#EE5253" opacity="0.9" />
  <!-- Mount Fuji -->
  <polygon points="120,420 400,160 680,420" fill="#2C3E50"/>
  <!-- Fuji Snowcap -->
  <polygon points="320,230 400,160 480,230 440,245 400,235 360,245" fill="#FFFFFF"/>
  <!-- Foreground Silhouette Pagoda -->
  <g fill="#130F40">
    <rect x="580" y="240" width="100" height="180"/>
    <path d="M540 240 Q630 200 720 240 L700 250 L560 250 Z"/>
    <path d="M550 280 Q630 245 710 280 L695 290 L565 290 Z"/>
    <path d="M560 320 Q630 290 700 320 L690 330 L570 330 Z"/>
    <line x1="630" y1="200" x2="630" y2="150" stroke="#130F40" stroke-width="5"/>
  </g>
  <!-- Cherry Blossom silhouettes -->
  <g fill="#FF9FF3">
    <circle cx="120" cy="180" r="14"/><circle cx="140" cy="165" r="12"/><circle cx="160" cy="190" r="16"/>
    <circle cx="190" cy="170" r="10"/><circle cx="210" cy="185" r="15"/>
    <path d="M0 240 Q100 190 220 180" stroke="#3D1C02" stroke-width="8" fill="none"/>
  </g>
  <rect y="420" width="800" height="80" fill="#0A3D62"/>
</svg>""",

    "new_york": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="nySky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0F2027"/>
      <stop offset="50%" stop-color="#203A43"/>
      <stop offset="100%" stop-color="#2C5364"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#nySky)"/>
  <!-- Moon -->
  <circle cx="680" cy="100" r="40" fill="#F4F6F6" opacity="0.8"/>
  <!-- Manhattan Skyline -->
  <g fill="#17202A">
    <rect x="40" y="260" width="70" height="190"/>
    <rect x="130" y="200" width="80" height="250"/>
    <rect x="230" y="140" width="90" height="310"/>
    <!-- Empire State Building -->
    <rect x="340" y="160" width="120" height="290"/>
    <rect x="365" y="100" width="70" height="60"/>
    <rect x="385" y="50" width="30" height="50"/>
    <line x1="400" y1="50" x2="400" y2="10" stroke="#17202A" stroke-width="4"/>
    <!-- Chrysler Building / other towers -->
    <rect x="480" y="180" width="85" height="270"/>
    <polygon points="480,180 522,120 565,180"/>
    <line x1="522" y1="120" x2="522" y2="70" stroke="#17202A" stroke-width="3"/>
    <rect x="585" y="220" width="90" height="230"/>
    <rect x="695" y="270" width="70" height="180"/>
  </g>
  <!-- Window Lights -->
  <g fill="#F39C12" opacity="0.75">
    <rect x="245" y="160" width="8" height="10"/><rect x="265" y="160" width="8" height="10"/><rect x="285" y="160" width="8" height="10"/>
    <rect x="360" y="190" width="8" height="10"/><rect x="380" y="190" width="8" height="10"/><rect x="410" y="190" width="8" height="10"/><rect x="430" y="190" width="8" height="10"/>
    <rect x="360" y="220" width="8" height="10"/><rect x="380" y="220" width="8" height="10"/><rect x="410" y="220" width="8" height="10"/><rect x="430" y="220" width="8" height="10"/>
    <rect x="500" y="210" width="8" height="10"/><rect x="525" y="210" width="8" height="10"/><rect x="500" y="240" width="8" height="10"/>
  </g>
  <!-- Hudson River -->
  <rect y="440" width="800" height="60" fill="#0E1A24"/>
  <ellipse cx="400" cy="460" rx="200" ry="6" fill="#F39C12" opacity="0.3"/>
</svg>""",

    "london": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="londonSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4B6584"/>
      <stop offset="60%" stop-color="#778CA3"/>
      <stop offset="100%" stop-color="#D1D8E0"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#londonSky)"/>
  <!-- London Eye Silhouette -->
  <circle cx="620" cy="260" r="100" stroke="#2D3A4B" stroke-width="6" fill="none" opacity="0.5"/>
  <line x1="620" y1="260" x2="620" y2="400" stroke="#2D3A4B" stroke-width="8" opacity="0.5"/>
  <!-- Palace of Westminster & Big Ben -->
  <g fill="#2C3E50">
    <rect x="60" y="300" width="340" height="110"/>
    <!-- Big Ben Tower -->
    <rect x="400" y="100" width="90" height="310"/>
    <polygon points="390,100 445,20 500,100"/>
    <!-- Clock face -->
    <circle cx="445" cy="145" r="25" fill="#F5F6FA"/>
    <circle cx="445" cy="145" r="3" fill="#2C3E50"/>
    <line x1="445" y1="145" x2="445" y2="130" stroke="#2C3E50" stroke-width="3"/>
    <line x1="445" y1="145" x2="455" y2="145" stroke="#2C3E50" stroke-width="3"/>
  </g>
  <!-- Red Double Decker Bus on Westminster Bridge -->
  <g>
    <rect x="140" y="370" width="90" height="40" rx="6" fill="#EB3B5A"/>
    <rect x="145" y="376" width="16" height="14" fill="#FFFFFF"/>
    <rect x="167" y="376" width="16" height="14" fill="#FFFFFF"/>
    <rect x="189" y="376" width="16" height="14" fill="#FFFFFF"/>
    <circle cx="160" cy="412" r="8" fill="#2C3E50"/>
    <circle cx="210" cy="412" r="8" fill="#2C3E50"/>
  </g>
  <!-- Thames River -->
  <rect y="415" width="800" height="85" fill="#2C3E50"/>
</svg>""",

    "rome": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="romeSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E15F41"/>
      <stop offset="50%" stop-color="#F19066"/>
      <stop offset="100%" stop-color="#F7D794"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#romeSky)"/>
  <circle cx="400" cy="180" r="100" fill="#FFF275" opacity="0.6"/>
  <!-- Colosseum Structure -->
  <g fill="#574B90">
    <path d="M120 400 L120 250 C120 220 220 200 400 200 C580 200 680 220 680 250 L680 400 Z"/>
    <!-- Colosseum Arches Top Tier -->
    <g fill="#F7D794">
      <rect x="160" y="240" width="22" height="35" rx="10"/>
      <rect x="210" y="240" width="22" height="35" rx="10"/>
      <rect x="260" y="240" width="22" height="35" rx="10"/>
      <rect x="310" y="240" width="22" height="35" rx="10"/>
      <rect x="360" y="240" width="22" height="35" rx="10"/>
      <rect x="410" y="240" width="22" height="35" rx="10"/>
      <rect x="460" y="240" width="22" height="35" rx="10"/>
      <rect x="510" y="240" width="22" height="35" rx="10"/>
      <rect x="560" y="240" width="22" height="35" rx="10"/>
      <rect x="610" y="240" width="22" height="35" rx="10"/>
    </g>
    <!-- Colosseum Arches Bottom Tier -->
    <g fill="#F7D794">
      <rect x="160" y="300" width="28" height="55" rx="14"/>
      <rect x="220" y="300" width="28" height="55" rx="14"/>
      <rect x="280" y="300" width="28" height="55" rx="14"/>
      <rect x="340" y="300" width="28" height="55" rx="14"/>
      <rect x="400" y="300" width="28" height="55" rx="14"/>
      <rect x="460" y="300" width="28" height="55" rx="14"/>
      <rect x="520" y="300" width="28" height="55" rx="14"/>
      <rect x="580" y="300" width="28" height="55" rx="14"/>
    </g>
  </g>
  <!-- Italian Cypress Trees -->
  <polygon points="80,410 70,280 90,280" fill="#2C3A29"/>
  <polygon points="105,410 98,310 112,310" fill="#1B241A"/>
  <polygon points="710,410 700,270 720,270" fill="#2C3A29"/>
  <rect y="400" width="800" height="100" fill="#303952"/>
</svg>""",

    "barcelona": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="barcaSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00A8FF"/>
      <stop offset="60%" stop-color="#9C88FF"/>
      <stop offset="100%" stop-color="#FBC531"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#barcaSky)"/>
  <!-- Sun -->
  <circle cx="400" cy="200" r="90" fill="#FBC531" opacity="0.6"/>
  <!-- Sagrada Familia Silhouette -->
  <g fill="#273C75">
    <rect x="320" y="240" width="160" height="180"/>
    <!-- 4 main Towers -->
    <path d="M330 240 L345 80 L360 240 Z"/>
    <path d="M365 240 L380 60 L395 240 Z"/>
    <path d="M405 240 L420 60 L435 240 Z"/>
    <path d="M440 240 L455 80 L470 240 Z"/>
    <!-- Crosses on top -->
    <circle cx="345" cy="75" r="6" fill="#FBC531"/>
    <circle cx="380" cy="55" r="8" fill="#FBC531"/>
    <circle cx="420" cy="55" r="8" fill="#FBC531"/>
    <circle cx="455" cy="75" r="6" fill="#FBC531"/>
  </g>
  <!-- Park Guell Mosaic elements -->
  <path d="M0 420 Q200 380 400 420 Q600 460 800 420 L800 500 L0 500 Z" fill="#E84118"/>
  <circle cx="180" cy="410" r="15" fill="#44BD32"/>
  <circle cx="220" cy="405" r="12" fill="#00A8FF"/>
  <circle cx="580" cy="425" r="14" fill="#FBC531"/>
  <circle cx="620" cy="420" r="16" fill="#9C88FF"/>
</svg>""",

    "bali": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="baliSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF9F43"/>
      <stop offset="40%" stop-color="#EE5253"/>
      <stop offset="80%" stop-color="#0ABDE3"/>
      <stop offset="100%" stop-color="#10AC84"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#baliSky)"/>
  <!-- Sacred Mount Agung Silhouette -->
  <polygon points="100,400 400,180 700,400" fill="#222F3E"/>
  <!-- Balinese Temple Gate (Candi Bentar) -->
  <g fill="#341F97">
    <!-- Left Wing -->
    <path d="M280 400 L280 180 L310 180 L310 210 L330 210 L330 250 L350 250 L350 400 Z"/>
    <!-- Right Wing -->
    <path d="M520 400 L520 180 L490 180 L490 210 L470 210 L470 250 L450 250 L450 400 Z"/>
  </g>
  <!-- Palm Trees -->
  <g fill="#10AC84">
    <path d="M120 400 Q140 300 160 220" stroke="#5F27CD" stroke-width="7" fill="none"/>
    <ellipse cx="160" cy="220" rx="40" ry="12" transform="rotate(-30 160 220)"/>
    <ellipse cx="160" cy="220" rx="40" ry="12" transform="rotate(30 160 220)"/>
    <ellipse cx="160" cy="220" rx="40" ry="12" transform="rotate(90 160 220)"/>
  </g>
  <!-- Emerald Rice Terrace Foregrounds -->
  <path d="M0 380 Q200 340 400 380 Q600 420 800 380 L800 500 L0 500 Z" fill="#10AC84"/>
  <path d="M0 430 Q300 390 800 430 L800 500 L0 500 Z" fill="#1DD1A1"/>
</svg>""",

    "dubai": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="dubaiSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E272E"/>
      <stop offset="50%" stop-color="#485460"/>
      <stop offset="100%" stop-color="#D2DAE2"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#dubaiSky)"/>
  <!-- Stars -->
  <circle cx="150" cy="80" r="2" fill="#FFF"/><circle cx="280" cy="60" r="2" fill="#FFF"/><circle cx="650" cy="90" r="2" fill="#FFF"/>
  <!-- Burj Khalifa Tower -->
  <g fill="#00D2D3">
    <!-- Base -->
    <rect x="360" y="260" width="80" height="160"/>
    <!-- Tier 2 -->
    <rect x="375" y="160" width="50" height="100"/>
    <!-- Tier 3 -->
    <rect x="388" y="80" width="24" height="80"/>
    <!-- Spire -->
    <line x1="400" y1="80" x2="400" y2="15" stroke="#00D2D3" stroke-width="4"/>
  </g>
  <!-- Burj Al Arab Silhouette -->
  <path d="M160 420 L160 260 Q240 320 160 420 Z" fill="#54A0FF"/>
  <!-- Surrounding Skyscrapers -->
  <g fill="#2C3E50">
    <rect x="220" y="240" width="50" height="180"/>
    <rect x="290" y="200" width="60" height="220"/>
    <rect x="455" y="210" width="55" height="210"/>
    <rect x="530" y="250" width="65" height="170"/>
    <rect x="620" y="280" width="70" height="140"/>
  </g>
  <!-- Golden Desert Dunes -->
  <path d="M0 420 Q200 390 450 430 Q650 400 800 420 L800 500 L0 500 Z" fill="#FF9F43"/>
</svg>""",

    "bangkok": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bkkSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#5F27CD"/>
      <stop offset="50%" stop-color="#FF6B6B"/>
      <stop offset="100%" stop-color="#FECA57"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bkkSky)"/>
  <!-- Wat Arun Temple Pagoda Spire -->
  <g fill="#222F3E">
    <rect x="360" y="260" width="80" height="140"/>
    <polygon points="340,260 400,100 460,260"/>
    <polygon points="370,100 400,30 430,100"/>
    <!-- Small flanking spires -->
    <polygon points="280,300 310,180 340,300"/>
    <polygon points="460,300 490,180 520,300"/>
  </g>
  <!-- Chao Phraya River -->
  <rect y="400" width="800" height="100" fill="#01A3A4"/>
  <!-- Thai Longtail Boat -->
  <path d="M160 430 Q220 440 280 430 L270 415 L170 415 Z" fill="#EE5253"/>
  <line x1="280" y1="430" x2="315" y2="400" stroke="#341F97" stroke-width="4"/>
</svg>""",

    "sydney": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="sydSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00D2D3"/>
      <stop offset="50%" stop-color="#54A0FF"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#sydSky)"/>
  <!-- Sydney Harbour Bridge Arch -->
  <path d="M80 380 Q260 140 440 380" stroke="#2C3E50" stroke-width="12" fill="none"/>
  <path d="M100 380 Q260 180 420 380" stroke="#2C3E50" stroke-width="6" fill="none"/>
  <!-- Sydney Opera House Shells -->
  <g fill="#F5F6FA" stroke="#DCDDE1" stroke-width="2">
    <path d="M420 380 Q480 240 540 380 Z"/>
    <path d="M480 380 Q540 210 600 380 Z"/>
    <path d="M540 380 Q600 230 660 380 Z"/>
  </g>
  <!-- Harbour Water -->
  <rect y="380" width="800" height="120" fill="#2E86DE"/>
</svg>""",

    "mumbai": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="mumSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF9F43"/>
      <stop offset="60%" stop-color="#EE5253"/>
      <stop offset="100%" stop-color="#0ABDE3"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#mumSky)"/>
  <!-- Gateway of India Arch -->
  <g fill="#2C3A47">
    <rect x="260" y="200" width="280" height="190"/>
    <path d="M340 390 L340 280 Q400 220 460 280 L460 390 Z" fill="#FF9F43"/>
    <!-- Domes -->
    <circle cx="400" cy="180" r="35"/>
    <circle cx="280" cy="190" r="20"/>
    <circle cx="520" cy="190" r="20"/>
  </g>
  <!-- Arabian Sea Water -->
  <rect y="390" width="800" height="110" fill="#10AC84"/>
</svg>""",

    "cape_town": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="cptSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#48DBFB"/>
      <stop offset="60%" stop-color="#FF9FF3"/>
      <stop offset="100%" stop-color="#FECA57"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#cptSky)"/>
  <!-- Table Mountain Flat Peak Silhouette -->
  <polygon points="100,380 220,200 580,200 700,380" fill="#222F3E"/>
  <!-- Tablecloth Cloud on top -->
  <rect x="200" y="190" width="400" height="18" rx="8" fill="#FFFFFF" opacity="0.85"/>
  <!-- Ocean Waves -->
  <rect y="380" width="800" height="120" fill="#0ABDE3"/>
</svg>""",

    "cairo": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="cairoSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF6B6B"/>
      <stop offset="50%" stop-color="#FFA502"/>
      <stop offset="100%" stop-color="#FFEAA7"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#cairoSky)"/>
  <!-- Sun -->
  <circle cx="500" cy="180" r="70" fill="#FFF275" opacity="0.8"/>
  <!-- Great Pyramids of Giza -->
  <polygon points="140,400 320,160 500,400" fill="#D35400"/>
  <polygon points="320,160 500,400 430,400" fill="#E67E22"/>
  <polygon points="420,400 560,220 700,400" fill="#BA4A00"/>
  <!-- Desert Dunes -->
  <path d="M0 380 Q300 320 800 400 L800 500 L0 500 Z" fill="#F39C12"/>
</svg>""",

    "queenstown": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="qtSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1B9CFC"/>
      <stop offset="60%" stop-color="#D2DAE2"/>
      <stop offset="100%" stop-color="#55E6C1"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#qtSky)"/>
  <!-- Remarkables Alpine Peaks -->
  <polygon points="40,380 200,120 360,380" fill="#2C3A47"/>
  <polygon points="150,190 200,120 250,190" fill="#FFFFFF"/>
  <polygon points="260,380 440,80 620,380" fill="#182C61"/>
  <polygon points="380,160 440,80 500,160" fill="#FFFFFF"/>
  <polygon points="520,380 660,150 800,380" fill="#2C3A47"/>
  <!-- Turquoise Lake Wakatipu -->
  <rect y="380" width="800" height="120" fill="#00D2D3"/>
</svg>""",

    "rio_de_janeiro": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="rioSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FD7272"/>
      <stop offset="50%" stop-color="#F8EFBA"/>
      <stop offset="100%" stop-color="#25CCF7"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#rioSky)"/>
  <!-- Corcovado Mountain Peak -->
  <path d="M250 400 L350 160 L450 160 L550 400 Z" fill="#1B9CFC"/>
  <!-- Christ the Redeemer Silhouette -->
  <g fill="#2C3A47">
    <rect x="390" y="90" width="20" height="70"/>
    <rect x="330" y="105" width="140" height="12" rx="4"/>
    <circle cx="400" cy="78" r="12"/>
  </g>
  <!-- Copacabana Beach and Waves -->
  <rect y="400" width="800" height="100" fill="#25CCF7"/>
</svg>""",

    "vancouver": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="vanSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1B1464"/>
      <stop offset="60%" stop-color="#006266"/>
      <stop offset="100%" stop-color="#C4E538"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#vanSky)"/>
  <!-- Snowy Mountain Range -->
  <polygon points="80,380 240,160 400,380" fill="#006266"/>
  <polygon points="190,230 240,160 290,230" fill="#FFFFFF"/>
  <polygon points="340,380 520,130 700,380" fill="#1B1464"/>
  <polygon points="460,210 520,130 580,210" fill="#FFFFFF"/>
  <!-- Pacific Ocean Water -->
  <rect y="380" width="800" height="120" fill="#12CBC4"/>
</svg>""",

    "mexico_city": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="mexSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#EE5A24"/>
      <stop offset="60%" stop-color="#FFC312"/>
      <stop offset="100%" stop-color="#C4E538"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#mexSky)"/>
  <!-- Aztec Sun Pyramid -->
  <g fill="#A3CB38">
    <polygon points="180,400 400,200 620,400"/>
    <rect x="360" y="190" width="80" height="20" fill="#EA2027"/>
  </g>
  <rect y="400" width="800" height="100" fill="#009432"/>
</svg>""",

    "buenos_aires": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="baSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1289A7"/>
      <stop offset="60%" stop-color="#D980FA"/>
      <stop offset="100%" stop-color="#FDA7DF"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#baSky)"/>
  <!-- Obelisco Monument -->
  <polygon points="380,400 395,100 405,100 420,400" fill="#F8EFBA"/>
  <polygon points="395,100 400,70 405,100" fill="#F8EFBA"/>
  <!-- City buildings -->
  <g fill="#1B1464" opacity="0.8">
    <rect x="120" y="260" width="90" height="140"/>
    <rect x="230" y="210" width="110" height="190"/>
    <rect x="460" y="230" width="120" height="170"/>
    <rect x="610" y="280" width="80" height="120"/>
  </g>
  <rect y="400" width="800" height="100" fill="#0652DD"/>
</svg>""",

    "marrakech": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="marSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#B53471"/>
      <stop offset="60%" stop-color="#ED4C67"/>
      <stop offset="100%" stop-color="#F79F1F"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#marSky)"/>
  <!-- Koutoubia Minaret & Riad Silhouettes -->
  <g fill="#833471">
    <!-- Minaret -->
    <rect x="360" y="140" width="80" height="260"/>
    <polygon points="350,140 400,80 450,140"/>
    <rect x="395" y="60" width="10" height="20"/>
    <!-- Medina Terracotta Walls -->
    <rect x="80" y="300" width="250" height="100"/>
    <rect x="470" y="320" width="260" height="80"/>
  </g>
  <!-- Palms -->
  <polygon points="160,400 150,260 170,260" fill="#009432"/>
  <polygon points="620,400 610,280 630,280" fill="#009432"/>
  <rect y="400" width="800" height="100" fill="#5758BB"/>
</svg>""",

    "istanbul": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="istSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#12CBC4"/>
      <stop offset="60%" stop-color="#1289A7"/>
      <stop offset="100%" stop-color="#F79F1F"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#istSky)"/>
  <!-- Hagia Sophia Domes & Minarets -->
  <g fill="#1E272E">
    <!-- Central Dome -->
    <path d="M280 340 Q400 180 520 340 Z"/>
    <rect x="300" y="340" width="200" height="60"/>
    <!-- Minarets -->
    <polygon points="210,400 220,120 230,400"/>
    <polygon points="270,400 278,160 286,400"/>
    <polygon points="514,400 522,160 530,400"/>
    <polygon points="570,400 580,120 590,400"/>
  </g>
  <!-- Bosphorus Strait -->
  <rect y="400" width="800" height="100" fill="#006266"/>
</svg>"""
}

# Write all SVGs into public/images/cities/
os.makedirs("public/images/cities", exist_ok=True)
for city, svg in city_svgs.items():
    with open(f"public/images/cities/{city}.svg", "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"Generated public/images/cities/{city}.svg")

print("All 20 city assets generated successfully.")
