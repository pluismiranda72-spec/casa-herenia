"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const paragraphs = [
  "Cuba no es solo un destino; es el latido de nuestra familia. Desde hace años soñamos con abrir las puertas de este rincón del Valle de Viñales y compartir con quienes nos visitan la calma de los mogotes, el olor del tabaco recién cortado y las mañanas que empiezan con un café en el portal. Aquí nació nuestra vocación por la hospitalidad.",
  "La casa que hoy acoge a nuestros huéspedes fue restaurada con paciencia y cariño. Cada ventana, cada baldosa y cada mueble cuentan una historia: la de un lugar que queremos que se sienta vivo y acogedor. No buscamos el lujo ostentoso, sino el confort auténtico y el detalle que hace que uno se sienta en casa lejos de casa.",
  "Recibir a viajeros de todo el mundo nos llena de alegría. Nuestro propósito es simple: que tu estancia sea memorable y que te lleves en la maleta algo más que fotos: el recuerdo de unas vistas únicas, una conversación en la mesa del desayuno y la sensación de haber formado parte, aunque sea unos días, de esta pequeña gran familia que es Viñales.",
];

export default function NosotrosContent() {
  return (
    <motion.article
      variants={container}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] py-12 md:py-20"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            variants={item}
            className="font-serif text-3xl md:text-4xl text-[#0A0A0A] mb-8 md:mb-10"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Nuestra Historia
          </motion.h1>

          <div className="relative">
            <motion.div
              variants={item}
              className="float-right ml-6 mb-6 w-48 sm:w-56 md:w-64 shrink-0 rounded-lg overflow-hidden aspect-[3/4] bg-[#e8e6e1]"
            >
              <Image
                src="/fondo.jpg"
                alt="Casa Herenia y Pedro, Viñales"
                width={256}
                height={341}
                className="w-full h-full object-cover"
                sizes="(max-width: 640px) 192px, 224px"
              />
            </motion.div>

            <div className="space-y-6">
              {paragraphs.map((text, i) => (
                <motion.p
                  key={i}
                  variants={item}
                  className="font-sans text-[#0A0A0A]/90 leading-relaxed"
                  style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  {text}
                </motion.p>
              ))}
            </div>

            <div className="clear-both pt-8 md:pt-10 flex flex-wrap gap-4">
              <motion.div variants={item}>
                <Link
                  href="/"
                  className="inline-block font-sans text-sm font-medium text-[#0A0A0A] underline decoration-1 underline-offset-4 hover:text-[#C5A059] transition-colors"
                >
                  Volver al Inicio
                </Link>
              </motion.div>
              <motion.div variants={item}>
                <Link
                  href="/reservas"
                  className="inline-block font-sans text-sm font-semibold bg-[#C5A059] text-[#0A0A0A] px-4 py-2 rounded-none hover:bg-[#C5A059]/90 transition-colors"
                >
                  Reservar
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
