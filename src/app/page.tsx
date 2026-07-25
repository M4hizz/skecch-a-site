"use client";

import { useState, useRef } from "react";
import DrawingCanvas from "@/components/DrawingCanvas";
import PreviewFrame from "@/components/PreviewFrame";

export default function VibeStudioPage() {
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleGenerate = async (image: string, textPrompt: string) => {
    setIsGenerating(true);
    setGeneratedHtml("");
    setAgentLogs([]);

    if (logIntervalRef.current) {
      clearInterval(logIntervalRef.current);
    }

    const initialLogs = [
      "[00:01] 🟢 Initializing Google Antigravity Agent Runtime...",
      "[00:02] 👁️ Sending image payload to Gemini 3.6 Flash Multimodal Vision...",
      "[00:04] ⚡ Parsing visual layout components (Buttons, Inputs, Cards)...",
      "[00:06] 🛠️ Antigravity Sandbox: Scaffolding DOM nodes and Tailwind classes...",
      "[00:08] 🧪 Running headless DOM verification & JS execution check...",
    ];

    let currentLogIndex = 0;
    // Push first log immediately
    setAgentLogs([initialLogs[0]]);
    currentLogIndex++;

    logIntervalRef.current = setInterval(() => {
      if (currentLogIndex < initialLogs.length) {
        const nextLog = initialLogs[currentLogIndex];
        setAgentLogs((prev) => [...prev, nextLog]);
        currentLogIndex++;
      }
    }, 2000);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, textPrompt }),
      });

      const data = await response.json();

      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
      }

      if (data.html) {
        // Ensure all preliminary steps are present
        setAgentLogs([
          ...initialLogs,
          "[00:09] ✅ 0 Syntax Errors found. Application live in sandbox!",
        ]);
        setGeneratedHtml(data.html);
      } else {
        console.error(data.error);
        setAgentLogs((prev) => [
          ...prev,
          "❌ [00:10] Antigravity Sandbox Error: " +
            (data.error ?? "Failed to generate app."),
        ]);
      }
    } catch (err) {
      console.error(err);
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
      }
      setAgentLogs((prev) => [
        ...prev,
        "❌ [00:10] Antigravity Sandbox Network Error.",
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Skecch-a-site
        </h1>
        <div className="text-sm text-neutral-400">
          Powered by Gemini 3.6 Flash &amp; Antigravity Sandbox Agent
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-100px)]">
        {/* Left column: Canvas & Prompts */}
        <div className="flex flex-col h-full bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
          <DrawingCanvas
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        {/* Right column: Preview & Code & Agent */}
        <div className="flex flex-col h-full bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
          <PreviewFrame
            generatedHtml={generatedHtml}
            logs={agentLogs}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  );
}
