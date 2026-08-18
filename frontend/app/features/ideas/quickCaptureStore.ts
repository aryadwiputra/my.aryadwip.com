import { create } from "zustand";

interface QuickCaptureState {
  open: boolean;
  text: string;
  submitting: boolean;
  setOpen: (open: boolean) => void;
  setText: (text: string) => void;
  setSubmitting: (submitting: boolean) => void;
}

export const useQuickCaptureStore = create<QuickCaptureState>((set) => ({
  open: false,
  text: "",
  submitting: false,
  setOpen: (open) => set({ open }),
  setText: (text) => set({ text }),
  setSubmitting: (submitting) => set({ submitting }),
}));