"use client";

import { useState } from "react";
import AuraFAQButton from "@/components/AuraFAQButton";
import ChatWidget from "@/components/ChatWidget";

/**
 * Aura trigger + chat panel. When embedded, button is positioned by parent (FAQ section).
 */
type Props = { embedded?: boolean };

export default function AuraFAQFloating({ embedded }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AuraFAQButton onOpenAura={() => setOpen(true)} embedded={embedded} />
      <ChatWidget open={open} onOpenChange={setOpen} />
    </>
  );
}
