import { create } from "zustand";

export type CreateType = "idea" | "task" | "note";

interface CreateStore {
  open: boolean;
  type: CreateType | null;
  setOpen: (open: boolean) => void;
  setType: (type: CreateType) => void;
  close: () => void;
}

export const useCreateStore = create<CreateStore>((set) => ({
  open: false,
  type: null,
  setOpen: (open) => set({ open, type: open ? null : null }),
  setType: (type) => set({ type }),
  close: () => set({ open: false, type: null }),
}));