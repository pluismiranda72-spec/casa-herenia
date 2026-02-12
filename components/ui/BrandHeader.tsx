"use client";

import Link from "next/link";
import { useScroll, useTransform, motion } from "framer-motion";

export function BrandHeader() {
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 100], [1, 0.9]);

  return (
    <header
      className="sticky top-0 z-[999] bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#C5A059]/30"
      role="banner"
    >
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[60px]">
        <motion.div style={{ scale }}>
          <Link
            href="/"
            className="font-serif text-xl md:text-2xl text-[#C5A059] transition-opacity duration-300 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] touch-target flex items-center justify-center"
            aria-label="Casa Herenia y Pedro - Inicio"
          >
            Casa Herenia y Pedro
          </Link>
        </motion.div>
      </div>
    </header>
  );
}
