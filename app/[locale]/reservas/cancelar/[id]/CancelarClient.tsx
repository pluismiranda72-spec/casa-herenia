"use client";

import { useState } from "react";
import { cancelBooking } from "@/app/actions/cancelBooking";

type Props = {
  bookingId: string;
  email: string;
  refundable: boolean;
};

export default function CancelarClient({ bookingId, email, refundable }: Props) {
  const [step, setStep] = useState<"idle" | "confirm" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleConfirmCancel = async () => {
    setStep("loading");
    setErrorMessage("");
    const result = await cancelBooking(bookingId, email);
    if (result.success) {
      setStep("done");
    } else {
      setErrorMessage(result.error);
      setStep("error");
    }
  };

  if (step === "done") {
    return (
      <div className="rounded-lg p-4 bg-white/10 text-center">
        <p className="font-sans text-white">
          Su reserva ha sido cancelada. Recibirá un email de confirmación.
        </p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="space-y-3">
        <p className="font-sans text-sm text-red-400" role="alert">
          {errorMessage}
        </p>
        <button
          type="button"
          onClick={() => setStep("idle")}
          className="w-full min-h-[48px] rounded-lg border border-white/30 text-white font-sans hover:bg-white/10 transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="space-y-3">
        <p className="font-sans text-sm text-white/90 text-center">
          ¿Está seguro de que desea cancelar esta reserva?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep("idle")}
            className="flex-1 min-h-[48px] rounded-lg border border-white/30 text-white font-sans hover:bg-white/10 transition-colors"
          >
            No, volver
          </button>
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={step === "loading"}
            className="flex-1 min-h-[48px] rounded-lg bg-red-600 text-white font-sans font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {step === "loading" ? "Cancelando…" : "Sí, cancelar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setStep("confirm")}
      className="w-full min-h-[48px] rounded-lg bg-[#C5A059] text-[#0A0A0A] font-sans font-semibold hover:bg-[#C5A059]/90 transition-colors"
    >
      Confirmar cancelación
    </button>
  );
}
