'use client';

import { useState } from 'react';
import AgentLogTerminal from './AgentLogTerminal';
import { Copy, Check, Layout, Code, Terminal } from 'lucide-react';

interface PreviewFrameProps {
  generatedHtml: string;
  logs: string[];
  isGenerating: boolean;
}

export default function PreviewFrame({ generatedHtml, logs, isGenerating }: PreviewFrameProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'logs'>('preview');
  const [copied, setCopied] = useState(false);

  // Auto-switch to logs when generating starts
  if (isGenerating && activeTab !== 'logs' && logs.length > 0) {
    setActiveTab('logs');
  }

  // Auto-switch to preview when generation completes successfully
  if (!isGenerating && generatedHtml && activeTab === 'logs') {
    setActiveTab('preview');
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-white">
      {/* Tabs */}
      <div className="flex bg-neutral-950 border-b border-neutral-800">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'preview' ? 'bg-neutral-900 text-white border-t-2 border-t-blue-500' : 'text-neutral-400 hover:text-white border-t-2 border-transparent'}`}
        >
          <Layout size={16} />
          App Preview
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'code' ? 'bg-neutral-900 text-white border-t-2 border-t-blue-500' : 'text-neutral-400 hover:text-white border-t-2 border-transparent'}`}
        >
          <Code size={16} />
          Source Code
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'logs' ? 'bg-neutral-900 text-white border-t-2 border-t-blue-500' : 'text-neutral-400 hover:text-white border-t-2 border-transparent'}`}
        >
          <Terminal size={16} />
          Agent Logs
          {isGenerating && <span className="ml-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow relative bg-white">
        {activeTab === 'preview' && (
          <div className="w-full h-full bg-white relative">
            {!generatedHtml && !isGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center text-neutral-400 bg-neutral-900">
                <div className="text-center">
                  <Layout className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Draw a wireframe and click "Vibe Code App" to see it here.</p>
                </div>
              </div>
            ) : (
              <iframe
                title="App Preview"
                srcDoc={generatedHtml}
                sandbox="allow-scripts allow-forms allow-modals"
                className="w-full h-full border-0 bg-white"
              />
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="w-full h-full bg-[#1e1e1e] overflow-auto relative p-4 group">
            {!generatedHtml ? (
              <div className="h-full flex items-center justify-center text-neutral-500">
                No code generated yet.
              </div>
            ) : (
              <>
                <button
                  onClick={copyCode}
                  className="absolute top-4 right-4 bg-neutral-700 hover:bg-neutral-600 p-2 rounded text-white transition-opacity opacity-0 group-hover:opacity-100 flex items-center gap-2 text-sm"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <pre className="text-sm font-mono text-neutral-300">
                  <code>{generatedHtml}</code>
                </pre>
              </>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <AgentLogTerminal logs={logs} />
        )}
      </div>
    </div>
  );
}
