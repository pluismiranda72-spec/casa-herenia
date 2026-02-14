import type { Metadata } from "next";
import NosotrosContent from "./NosotrosContent";

export const metadata: Metadata = {
  title: "Nuestra Historia | Casa Herenia y Pedro",
  description:
    "Conoce a Pedro y Herenia, el alma de Viñales. La historia detrás de tu estancia en el Valle.",
};

export default function NosotrosPage() {
  return <NosotrosContent />;
}
