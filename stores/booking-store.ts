import { create } from "zustand";

export type PropertyUnit = "room_1" | "room_2" | "full_villa";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface BookingState {
  step: number;
  selectedUnit: PropertyUnit | null;
  range: DateRange;
  guests: number;
  setStep: (step: number) => void;
  setSelectedUnit: (unit: PropertyUnit | null) => void;
  setRange: (range: DateRange) => void;
  setGuests: (guests: number) => void;
  clearSelection: () => void;
}

const initialRange: DateRange = { from: undefined, to: undefined };

export const useBookingStore = create<BookingState>((set) => ({
  step: 0,
  selectedUnit: null,
  range: initialRange,
  guests: 1,
  setStep: (step) => set({ step }),
  setSelectedUnit: (selectedUnit) => set({ selectedUnit }),
  setRange: (range) => set({ range }),
  setGuests: (guests) => set({ guests }),
  clearSelection: () =>
    set({ range: initialRange, selectedUnit: null, guests: 1 }),
}));
