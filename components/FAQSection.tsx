"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

const FAQ_KEYS = ["q1", "q2", "q3"] as const;

export default function FAQSection() {
  const t = useTranslations("FAQ");

  const faqItems = FAQ_KEYS.map((key) => ({
    question: t(`${key}.question`),
    answer: t(`${key}.answer`),
  }));

  return (
    <section
      id="faq-section"
      className="w-full bg-[#0A0A0A]/95 border-t border-[#C5A059]/20 py-16 px-4"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-4xl mx-auto">
        <h2
          id="faq-heading"
          className="font-serif text-xl md:text-2xl text-white mb-8"
        >
          {t("title")}
        </h2>
        <div className="divide-y divide-gray-700/80">
          {faqItems.map((item, index) => (
            <details
              key={index}
              className="group border-b border-gray-700/80 last:border-b-0"
            >
              <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center justify-between gap-4 py-4 text-left transition-colors duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059]">
                <span className="font-sans text-lg font-medium text-white pr-4 select-none break-words min-w-0">
                  {item.question}
                </span>
                <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#C5A059]/20 text-[#C5A059] transition-transform duration-300 group-open:rotate-180">
                  <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
                </span>
              </summary>
              <div className="pb-4 pr-12">
                <p className="font-sans text-base text-gray-400 leading-relaxed break-words">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
