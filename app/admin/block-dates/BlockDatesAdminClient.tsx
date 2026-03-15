"use client";

import { useState, useEffect, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import { Calendar, Lock, Trash2 } from "lucide-react";
import "react-day-picker/style.css";
import {
  insertManualBlock,
  deleteManualBlock,
  getManualBlockBookings,
  type ManualBlockBookingRow,
  type PropertyUnit,
} from "@/app/actions/blockDatesAdmin";

const ADMIN_PASSWORD = "Pedro2026";
const SESSION_KEY = "admin_block_dates_session";

const ROOM_OPTIONS: { value: PropertyUnit; label: string }[] = [
  { value: "room_1", label: "Room 1" },
  { value: "room_2", label: "Room 2" },
  { value: "full_villa", label: "Full Villa" },
];

function dateToYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Toast = { id: number; type: "success" | "error"; message: string };

function ToastList({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`rounded-lg border px-4 py-3 shadow-lg font-sans text-sm ${
            t.type === "success"
              ? "border-green-500/50 bg-green-950/90 text-green-100"
              : "border-red-500/50 bg-red-950/90 text-red-100"
          }`}
        >
          {t.message}
          <button
            type="button"
            onClick={() => remove(t.id)}
            className="ml-2 text-current opacity-70 hover:opacity-100"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

type Props = { initialBlocks: ManualBlockBookingRow[] };

export default function BlockDatesAdminClient({ initialBlocks }: Props) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [blocks, setBlocks] = useState<ManualBlockBookingRow[]>(initialBlocks);
  const [roomId, setRoomId] = useState<PropertyUnit>("room_1");
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  const [pending, setPending] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastId, setToastId] = useState(0);

  useEffect(() => {
    const ok = typeof window !== "undefined" && localStorage.getItem(SESSION_KEY) === "1";
    setAuthenticated(ok);
  }, []);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = toastId + 1;
    setToastId(id);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, [toastId]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshBlocks = useCallback(async () => {
    const list = await getManualBlockBookings();
    setBlocks(list);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === ADMIN_PASSWORD) {
      localStorage.setItem(SESSION_KEY, "1");
      setAuthenticated(true);
      setPassword("");
    } else {
      addToast("error", "Contraseña incorrecta.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
  };

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!range.from) {
      addToast("error", "Selecciona al menos la fecha de entrada.");
      return;
    }
    const checkIn = dateToYmd(range.from);
    const checkOut = range.to ? dateToYmd(range.to) : checkIn;
    setPending(true);
    const result = await insertManualBlock(roomId, checkIn, checkOut);
    setPending(false);
    if (result.success) {
      addToast("success", "Fechas bloqueadas en el calendario correctamente.");
      setRange({});
      await refreshBlocks();
    } else {
      addToast("error", result.error);
    }
  };

  const handleDelete = async (id: string) => {
    setPending(true);
    const result = await deleteManualBlock(id);
    setPending(false);
    if (result.success) {
      addToast("success", "Bloqueo eliminado; las fechas quedan liberadas.");
      await refreshBlocks();
    } else {
      addToast("error", result.error);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 mb-4">
            <Lock className="w-5 h-5" aria-hidden />
            <h1 className="text-lg font-semibold font-sans">Acceso administración</h1>
          </div>
          <p className="text-slate-300 text-sm font-sans mb-4">
            Introduce la contraseña para gestionar bloqueos de fechas.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 font-sans focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-amber-500 text-slate-900 py-3 font-sans font-semibold hover:bg-amber-400 transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
        <ToastList toasts={toasts} remove={removeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-400" aria-hidden />
            <h1 className="text-xl font-semibold">Bloquear fechas en calendario</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-amber-400 mb-4">Nuevo bloqueo</h2>
          <form onSubmit={handleBlock} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Habitación
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value as PropertyUnit)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white font-sans focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {ROOM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rango de fechas
              </label>
              <div className="rounded-xl border border-slate-600 bg-slate-700/30 p-4 inline-block">
                <DayPicker
                  mode="range"
                  defaultMonth={new Date()}
                  selected={range}
                  onSelect={(r) => setRange(r ?? {})}
                  locale={es}
                  className="text-slate-200 [--rdp-accent:#f59e0b] [--rdp-accent-foreground:#0f172a]"
                />
              </div>
              {range.from && (
                <p className="mt-2 text-sm text-slate-400">
                  {dateToYmd(range.from)}
                  {range.to && ` → ${dateToYmd(range.to)}`}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pending || !range.from}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-amber-500/20"
            >
              {pending ? "Guardando…" : "Bloquear fechas en calendario"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-amber-400 mb-4">Bloqueos manuales actuales</h2>
          {blocks.length === 0 ? (
            <p className="text-slate-400 text-sm">No hay bloqueos manuales.</p>
          ) : (
            <ul className="space-y-2">
              {blocks.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-600 bg-slate-700/30 px-4 py-3"
                >
                  <span className="text-sm">
                    <span className="font-medium text-amber-400/90">
                      {ROOM_OPTIONS.find((o) => o.value === b.room_id)?.label ?? b.room_id}
                    </span>
                    {" · "}
                    {b.check_in} → {b.check_out}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    disabled={pending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/50 text-red-400 text-sm hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <ToastList toasts={toasts} remove={removeToast} />
    </div>
  );
}
