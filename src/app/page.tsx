"use client";

import { useState } from "react";
import DrawingCanvas from "@/components/DrawingCanvas";
import PreviewFrame from "@/components/PreviewFrame";

export default function VibeStudioPage() {
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);

  const pushLog = (message: string) => {
    setAgentLogs((prev) => [...prev, message]);
  };

  const handleGenerate = async (image: string, textPrompt: string) => {
    setIsGenerating(true);
    setGeneratedHtml("");
    setAgentLogs([]);

    pushLog("[00:00] Captured canvas snapshot from the drawing area.");
    pushLog(
      "[00:01] Sending request to /api/generate with the image and prompt.",
    );
    pushLog("[00:02] Waiting for Gemini response...");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, textPrompt }),
      });

      const data = await response.json();
      if (data.html) {
        setGeneratedHtml(data.html);
        pushLog("[00:03] Generated HTML received from the API.");
        pushLog("[00:04] Preview updated successfully.");
      } else {
        console.error(data.error);
        pushLog(
          "[00:03] Generation failed: " + (data.error ?? "Unknown API error."),
        );
      }
    } catch (err) {
      console.error(err);
      pushLog("[00:03] Network or server error while generating the app.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Napkin-to-App (Vibe Studio)
        </h1>
        <div className="text-sm text-neutral-400">
          Powered by Gemini via /api/generate
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
