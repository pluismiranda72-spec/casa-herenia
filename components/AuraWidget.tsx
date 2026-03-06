"use client";

import Script from "next/script";
import { useState } from "react";
import ChatWidget from "@/components/ChatWidget";

/**
 * Aura widget — FAQ page only.
 * Client-only: trigger button + chat panel, fixed bottom-left.
 * Uses Next.js Script for init; mount container is #aura-container.
 */
export default function AuraWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Script
        id="aura-init"
        strategy="afterInteractive"
      >
        {`
          (function() {
            if (typeof window !== 'undefined') {
              window.__AURA_FAQ_READY = true;
              var el = document.getElementById('aura-container');
              if (el) el.setAttribute('data-aura-ready', 'true');
            }
          })();
        `}
      </Script>
      <div
        id="aura-container"
        className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2"
        data-aura-ready="false"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 flex items-center justify-center cursor-pointer text-sm font-medium transition-colors hover:bg-gray-100/10 rounded-none border border-gray-500 bg-transparent text-white"
          aria-label="Haz una pregunta a Aura"
        >
          Haz una Pregunta
        </button>
        <ChatWidget open={open} onOpenChange={setOpen} />
      </div>
    </>
  );
}
