"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function ContactForm() {
  const t = useTranslations("Contact");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
      locale: locale === "en" ? "en" : "es",
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="block font-sans text-sm font-medium text-white/90 mb-1">
          {t("name")}
        </label>
        <input
          id="contact-name"
          type="text"
          name="name"
          required
          placeholder={t("placeholder_name")}
          className="w-full min-h-[44px] px-4 rounded-lg border border-[#C5A059]/30 bg-white/10 text-white placeholder:text-white/50 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="block font-sans text-sm font-medium text-white/90 mb-1">
          {t("email")}
        </label>
        <input
          id="contact-email"
          type="email"
          name="email"
          required
          placeholder={t("placeholder_email")}
          className="w-full min-h-[44px] px-4 rounded-lg border border-[#C5A059]/30 bg-white/10 text-white placeholder:text-white/50 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block font-sans text-sm font-medium text-white/90 mb-1">
          {t("message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          placeholder={t("placeholder_message")}
          className="w-full min-h-[100px] px-4 py-3 rounded-lg border border-[#C5A059]/30 bg-white/10 text-white placeholder:text-white/50 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 resize-y"
        />
      </div>
      {status === "success" && (
        <p className="font-sans text-sm text-emerald-400" role="status">
          {t("success")}
        </p>
      )}
      {status === "error" && (
        <p className="font-sans text-sm text-red-400" role="alert">
          {t("error")}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full min-h-[48px] rounded-lg bg-[#C5A059] text-[#0A0A0A] font-sans font-semibold hover:bg-[#C5A059]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
      >
        {status === "sending" ? "…" : t("button_send")}
      </button>
    </form>
  );
}
