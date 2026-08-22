const fs = require('fs');
let content = fs.readFileSync('src/pages/UserProfile.tsx', 'utf8');

content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';");
content = content.replace("export default function UserProfile() {", `export default function UserProfile() {\n  const [badges, setBadges] = useState<any[]>([]);\n  useEffect(() => {\n    axios.get('http://localhost:5000/api/badges').then(res => setBadges(res.data)).catch(console.error);\n  }, []);`);

const badgeJSX = `
      <div className="bg-white shadow rounded-lg overflow-hidden mt-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Travel Badges</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Earn badges by visiting new cities around the world.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {badges.map(b => (
              <div key={b.id} className={\`flex flex-col items-center text-center p-4 rounded-xl border \${b.earned ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100 grayscale opacity-60'}\`}>
                 <div className="text-4xl mb-3">{b.icon_url}</div>
                 <h4 className={\`text-sm font-bold \${b.earned ? 'text-indigo-900' : 'text-slate-500'}\`}>{b.name}</h4>
                 <p className="text-xs text-slate-500 mt-1 h-8">{b.earned ? b.description : \`Visit \${b.city?.name || b.name.split(' ')[0]} to unlock\`}</p>
                 {b.earned && <div className="text-[10px] font-semibold text-indigo-400 mt-2">Earned {new Date(b.earned_at).toLocaleDateString()}</div>}
              </div>
            ))}
            {badges.length === 0 && <div className="col-span-full text-sm text-gray-500">No badges available.</div>}
          </div>
        </div>
      </div>
    </div>
`;

content = content.replace("    </div>\n  );\n}", badgeJSX + "  );\n}");

fs.writeFileSync('src/pages/UserProfile.tsx', content);
