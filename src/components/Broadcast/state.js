import { create } from "zustand";

export const useStore = create((set) => ({
	streamKey: "",
	setStreamKey: (value) => set(() => ({ streamKey: value })),
}));
