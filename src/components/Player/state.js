import { create } from "zustand";

export const useStore = create((set) => ({
	playbackId: "",
	setPlaybackId: (value) => set(() => ({ playbackId: value })),
}));
