"use client";

/**
 * Minimal Aura trigger — bottom-left, FAQ page only.
 * Sharp edges, transparent background, opens Aura chat on click.
 */
type Props = { onOpenAura: () => void };

export default function AuraFAQButton({ onOpenAura }: Props) {
  return (
    <button
      type="button"
      onClick={onOpenAura}
      className="fixed bottom-6 left-6 z-50 px-4 py-2 flex items-center justify-center cursor-pointer text-sm font-medium transition-colors hover:bg-gray-100/10 rounded-none border border-gray-500 bg-transparent text-white"
      aria-label="Haz una pregunta a Aura"
    >
      Haz una Pregunta
    </button>
  );
}
