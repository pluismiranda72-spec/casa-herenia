"use client";

/**
 * Minimal Aura trigger. Embedded = bottom-right of FAQ section; global = fixed bottom-left.
 */
type Props = { onOpenAura: () => void; embedded?: boolean };

export default function AuraFAQButton({ onOpenAura, embedded }: Props) {
  return (
    <button
      type="button"
      onClick={onOpenAura}
      className={
        embedded
          ? "px-4 py-2 flex items-center justify-center cursor-pointer text-sm font-medium transition-colors hover:bg-gray-100/10 rounded-none border border-gray-500 bg-transparent text-white"
          : "fixed bottom-6 left-6 z-50 px-4 py-2 flex items-center justify-center cursor-pointer text-sm font-medium transition-colors hover:bg-gray-100/10 rounded-none border border-gray-500 bg-transparent text-white"
      }
      aria-label="Haz una pregunta a Aura"
    >
      Haz una Pregunta
    </button>
  );
}
