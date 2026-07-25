"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AgentLogTerminalProps {
  logs: string[];
}

export default function AgentLogTerminal({ logs }: AgentLogTerminalProps) {
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endOfLogsRef.current) {
      endOfLogsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div className="w-full h-full bg-gray-950 p-4 overflow-y-auto font-mono text-sm">
      {logs.length === 0 ? (
        <div className="text-neutral-500 flex flex-col items-center justify-center h-full">
          Waiting for generation to start...
          <span className="mt-2 text-xs text-neutral-600 text-center max-w-xs">
            This app uses the local /api/generate route and Gemini. No external
            agent runtime is connected.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {logs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="text-green-400 break-words"
              >
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endOfLogsRef} />
        </div>
      )}
    </div>
  );
}
