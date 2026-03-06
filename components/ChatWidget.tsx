"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { useChat } from "ai/react";
import { useLocale, useTranslations } from "next-intl";

type ChatWidgetProps = {
  /** When provided, open state is controlled by parent (e.g. AuraFAQButton). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Aura chat — floating panel. Can be controlled externally (open/onOpenChange)
 * so the "Haz una Pregunta" button can open it. Renders only the panel (no trigger button).
 */
export default function ChatWidget({ open, onOpenChange }: ChatWidgetProps) {
  const locale = useLocale();
  const t = useTranslations("Chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? open : internalOpen;

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useChat({
    api: "/api/chat",
    body: { locale },
    onError: (err) => {
      console.warn("[Aura]", err?.message ?? t("error"));
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleClose = () => {
    if (isControlled) onOpenChange?.(false);
    else setInternalOpen(false);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(e);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2 w-[min(100vw-2rem,380px)]"
      role="dialog"
      aria-label={t("ariaChat")}
    >
      <div
        className="flex flex-col w-full h-[min(70vh,520px)] rounded-xl border border-[#C5A059]/30 bg-white/95 backdrop-blur-md shadow-2xl overflow-hidden"
        role="document"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-[#0A0A0A]/5 border-b border-[#C5A059]/20 shrink-0">
          <span className="font-serif text-lg text-brand-black">
            {t("title")}
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-[#C5A059] touch-target min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={t("close")}
          >
            <X className="w-5 h-5 text-brand-black" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !error && (
            <p className="font-sans text-sm text-brand-black/60 text-center py-4">
              {t("greeting")}
            </p>
          )}
          {error && (
            <p className="font-sans text-sm text-red-600/80 text-center py-2">
              {t("error")}
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                  m.role === "user"
                    ? "bg-[#C5A059]/20 text-brand-black"
                    : "bg-gray-100 text-brand-black"
                }`}
              >
                <p className="font-sans text-sm whitespace-pre-wrap">
                  {typeof m.content === "string"
                    ? m.content
                    : String(m.content)}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg px-4 py-2.5 bg-gray-100 text-brand-black/70 font-sans text-sm italic">
                {t("writing")}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={onSubmit}
          className="p-3 border-t border-[#C5A059]/20 bg-white/80 shrink-0"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={t("placeholder")}
              className="flex-1 min-h-[44px] px-4 rounded-lg border border-[#C5A059]/30 bg-white font-sans text-sm text-brand-black placeholder:text-brand-black/50 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
              disabled={isLoading}
              aria-label={t("messageAria")}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="min-h-[44px] px-4 rounded-lg bg-[#C5A059] text-brand-black font-sans font-medium text-sm hover:bg-[#C5A059]/90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 touch-target"
              aria-label={t("send")}
            >
              {t("send")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
