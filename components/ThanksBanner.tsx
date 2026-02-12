"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";

type ThanksBannerProps = { thanks: string | null };

export default function ThanksBanner({ thanks }: ThanksBannerProps) {
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (thanks === "review") setShow(true);
  }, [thanks]);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => {
      setShow(false);
      router.replace("/", { scroll: false });
    }, 5000);
    return () => clearTimeout(t);
  }, [show, router]);

  if (!show) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] bg-[#C5A059] text-[#0A0A0A] font-sans text-sm font-medium text-center py-3 px-4 shadow-lg"
      role="status"
      aria-live="polite"
    >
      ¡Gracias por publicar tu opinión! Nos ayuda mucho.
    </div>
  );
}
