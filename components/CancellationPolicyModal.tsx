"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CANCELLATION_POLICY_TEXT } from "@/data/cancellation-policy";

export default function CancellationPolicyModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-sans text-sm text-white/60 underline underline-offset-2 hover:text-[#C5A059] transition-colors"
      >
        Ver política de cancelación
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10050] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0A0A0A] border border-[#C5A059]/30 rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="font-serif text-lg text-[#C5A059] mb-3">
                Política de cancelación
              </h3>
              <p className="font-sans text-sm text-white/90 whitespace-pre-line leading-relaxed">
                {CANCELLATION_POLICY_TEXT}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-4 font-sans text-sm text-[#C5A059] hover:underline underline-offset-2"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
