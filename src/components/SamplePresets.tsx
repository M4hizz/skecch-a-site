'use client';

interface Preset {
  id: string;
  name: string;
  prompt: string;
  // A simple 1x1 transparent PNG data URL to act as placeholder
  // In a real scenario, this would be an actual sample sketch image
  imageSrc: string; 
}

const PRESETS: Preset[] = [
  {
    id: 'saas-pricing',
    name: 'SaaS Pricing Card',
    prompt: 'Make it a modern SaaS pricing card with 3 tiers (Basic, Pro, Enterprise). Use a dark mode theme with a blue primary color. Add a toggle for monthly/yearly billing.',
    imageSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  },
  {
    id: 'kanban-board',
    name: 'Kanban Task Board',
    prompt: 'Build a sleek Kanban board with 3 columns: To Do, In Progress, Done. Add some sample tasks and a "New Task" button. Use an airy light theme with rounded corners.',
    imageSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  },
  {
    id: 'crypto-dashboard',
    name: 'Crypto Dashboard',
    prompt: 'Design a crypto portfolio dashboard. Show a balance at the top, a chart area, and a list of assets (BTC, ETH, SOL) with their current prices and 24h change.',
    imageSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
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
