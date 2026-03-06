"use client";

import { useState } from "react";
import AuraFAQButton from "@/components/AuraFAQButton";
import ChatWidget from "@/components/ChatWidget";

/**
 * Aura floating trigger + chat panel — visible on all pages.
 */
export default function AuraFAQFloating() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AuraFAQButton onOpenAura={() => setOpen(true)} />
      <ChatWidget open={open} onOpenChange={setOpen} />
    </>
  );
}
