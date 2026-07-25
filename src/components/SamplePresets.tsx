'use client';

interface Preset {
  id: string;
  name: string;
  prompt: string;
  imageSrc: string;
}

const saasSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#000000"/>
  <text x="400" y="70" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">Simple &amp; Flexible Pricing</text>
  <text x="400" y="105" fill="#888888" font-family="sans-serif" font-size="16" text-anchor="middle">Monthly [X]   Yearly [ ]</text>
  <rect x="70" y="140" width="200" height="380" fill="none" stroke="#ffffff" stroke-width="3" rx="12"/>
  <text x="170" y="185" fill="#ffffff" font-family="sans-serif" font-size="22" text-anchor="middle">Basic</text>
  <text x="170" y="235" fill="#ffffff" font-family="sans-serif" font-size="32" font-weight="bold" text-anchor="middle">$9/mo</text>
  <line x1="90" y1="260" x2="250" y2="260" stroke="#444444" stroke-width="2"/>
  <text x="90" y="300" fill="#cccccc" font-family="sans-serif" font-size="14">✓ 1 User</text>
  <text x="90" y="335" fill="#cccccc" font-family="sans-serif" font-size="14">✓ 5GB Storage</text>
  <text x="90" y="370" fill="#cccccc" font-family="sans-serif" font-size="14">✓ Email Support</text>
  <rect x="90" y="440" width="160" height="45" fill="none" stroke="#ffffff" stroke-width="2" rx="8"/>
  <text x="170" y="468" fill="#ffffff" font-family="sans-serif" font-size="16" text-anchor="middle">Get Started</text>
  <rect x="300" y="140" width="200" height="380" fill="#111111" stroke="#3b82f6" stroke-width="4" rx="12"/>
  <rect x="350" y="150" width="100" height="24" fill="#3b82f6" rx="12"/>
  <text x="400" y="167" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">MOST POPULAR</text>
  <text x="400" y="205" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">Pro</text>
  <text x="400" y="250" fill="#3b82f6" font-family="sans-serif" font-size="36" font-weight="bold" text-anchor="middle">$29/mo</text>
  <line x1="320" y1="275" x2="480" y2="275" stroke="#444444" stroke-width="2"/>
  <text x="320" y="310" fill="#ffffff" font-family="sans-serif" font-size="14">✓ 10 Users</text>
  <text x="320" y="345" fill="#ffffff" font-family="sans-serif" font-size="14">✓ 100GB Storage</text>
  <text x="320" y="380" fill="#ffffff" font-family="sans-serif" font-size="14">✓ Priority Support</text>
  <rect x="320" y="445" width="160" height="45" fill="#3b82f6" stroke="#3b82f6" stroke-width="2" rx="8"/>
  <text x="400" y="473" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">Start Free Trial</text>
  <rect x="530" y="140" width="200" height="380" fill="none" stroke="#ffffff" stroke-width="3" rx="12"/>
  <text x="630" y="185" fill="#ffffff" font-family="sans-serif" font-size="22" text-anchor="middle">Enterprise</text>
  <text x="630" y="235" fill="#ffffff" font-family="sans-serif" font-size="32" font-weight="bold" text-anchor="middle">$99/mo</text>
  <line x1="550" y1="260" x2="710" y2="260" stroke="#444444" stroke-width="2"/>
  <text x="550" y="300" fill="#cccccc" font-family="sans-serif" font-size="14">✓ Unlimited Users</text>
  <text x="550" y="335" fill="#cccccc" font-family="sans-serif" font-size="14">✓ 1TB Storage</text>
  <rect x="550" y="440" width="160" height="45" fill="none" stroke="#ffffff" stroke-width="2" rx="8"/>
  <text x="630" y="468" fill="#ffffff" font-family="sans-serif" font-size="16" text-anchor="middle">Contact Sales</text>
</svg>`;

const kanbanSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#000000"/>
  <text x="50" y="55" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="bold">Project Kanban</text>
  <rect x="650" y="30" width="100" height="35" fill="#3b82f6" rx="6"/>
  <text x="700" y="53" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">+ New Task</text>
  <rect x="40" y="90" width="220" height="470" fill="#111111" stroke="#333333" stroke-width="2" rx="10"/>
  <text x="60" y="125" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold">To Do (3)</text>
  <rect x="55" y="145" width="190" height="90" fill="#222222" stroke="#444444" stroke-width="1.5" rx="8"/>
  <text x="70" y="175" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold">Design wireframe</text>
  <text x="70" y="200" fill="#888888" font-family="sans-serif" font-size="12">High Priority • UI</text>
  <rect x="55" y="250" width="190" height="90" fill="#222222" stroke="#444444" stroke-width="1.5" rx="8"/>
  <text x="70" y="280" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold">Setup Gemini API</text>
  <text x="70" y="305" fill="#888888" font-family="sans-serif" font-size="12">Backend • AI</text>
  <rect x="290" y="90" width="220" height="470" fill="#111111" stroke="#333333" stroke-width="2" rx="10"/>
  <text x="310" y="125" fill="#3b82f6" font-family="sans-serif" font-size="18" font-weight="bold">In Progress (2)</text>
  <rect x="305" y="145" width="190" height="90" fill="#222222" stroke="#3b82f6" stroke-width="1.5" rx="8"/>
  <text x="320" y="175" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold">Build Canvas UI</text>
  <text x="320" y="200" fill="#3b82f6" font-family="sans-serif" font-size="12">Frontend • Active</text>
  <rect x="540" y="90" width="220" height="470" fill="#111111" stroke="#333333" stroke-width="2" rx="10"/>
  <text x="560" y="125" fill="#22c55e" font-family="sans-serif" font-size="18" font-weight="bold">Done (1)</text>
  <rect x="555" y="145" width="190" height="90" fill="#222222" stroke="#22c55e" stroke-width="1.5" rx="8"/>
  <text x="570" y="175" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold">Init Next.js App</text>
  <text x="570" y="200" fill="#22c55e" font-family="sans-serif" font-size="12">✓ Completed</text>
</svg>`;

const cryptoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#000000"/>
  <rect x="40" y="30" width="720" height="120" fill="#111111" stroke="#333333" stroke-width="2" rx="12"/>
  <text x="70" y="70" fill="#888888" font-family="sans-serif" font-size="14">Total Portfolio Balance</text>
  <text x="70" y="115" fill="#ffffff" font-family="sans-serif" font-size="36" font-weight="bold">$48,290.50</text>
  <text x="320" y="115" fill="#22c55e" font-family="sans-serif" font-size="18" font-weight="bold">+12.4% (24h)</text>
  <rect x="40" y="170" width="720" height="200" fill="#111111" stroke="#333333" stroke-width="2" rx="12"/>
  <text x="70" y="205" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold">Price Analytics</text>
  <polyline points="70,320 180,280 280,310 380,240 480,260 580,210 720,230" fill="none" stroke="#3b82f6" stroke-width="4"/>
  <rect x="40" y="390" width="720" height="180" fill="#111111" stroke="#333333" stroke-width="2" rx="12"/>
  <text x="70" y="425" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold">Your Assets</text>
  <text x="70" y="465" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold">Bitcoin (BTC)</text>
  <text x="450" y="465" fill="#ffffff" font-family="sans-serif" font-size="16">$64,200.00</text>
  <text x="650" y="465" fill="#22c55e" font-family="sans-serif" font-size="16">+3.2%</text>
  <line x1="70" y1="485" x2="730" y2="485" stroke="#222222" stroke-width="1"/>
  <text x="70" y="515" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold">Ethereum (ETH)</text>
  <text x="450" y="515" fill="#ffffff" font-family="sans-serif" font-size="16">$3,450.00</text>
  <text x="650" y="515" fill="#22c55e" font-family="sans-serif" font-size="16">+5.8%</text>
</svg>`;

const toDataUrl = (svgStr: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;

const PRESETS: Preset[] = [
  {
    id: 'saas-pricing',
    name: 'SaaS Pricing Card',
    prompt: 'Make it a modern SaaS pricing card with 3 tiers (Basic, Pro, Enterprise). Use a dark mode theme with a blue primary color. Add a toggle for monthly/yearly billing.',
    imageSrc: toDataUrl(saasSvg)
  },
  {
    id: 'kanban-board',
    name: 'Kanban Task Board',
    prompt: 'Build a sleek Kanban board with 3 columns: To Do, In Progress, Done. Add some sample tasks and a "New Task" button. Use an airy dark theme with rounded corners.',
    imageSrc: toDataUrl(kanbanSvg)
  },
  {
    id: 'crypto-dashboard',
    name: 'Crypto Dashboard',
    prompt: 'Design a crypto portfolio dashboard. Show a balance at the top, a chart area, and a list of assets (BTC, ETH) with their current prices and 24h change.',
    imageSrc: toDataUrl(cryptoSvg)
  }
];

interface SamplePresetsProps {
  onLoadPreset: (imageSrc: string, prompt: string) => void;
}

export default function SamplePresets({ onLoadPreset }: SamplePresetsProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Demo Presets</span>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => onLoadPreset(preset.imageSrc, preset.prompt)}
            className="flex-shrink-0 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded p-2 text-sm text-left transition-colors whitespace-nowrap text-white"
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
}
