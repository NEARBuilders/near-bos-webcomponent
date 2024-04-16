import { create } from "zustand";

export const useStore = create((set) => ({
  src: "",
  setSrc: (value) => set(() => ({ src: value })),
  playbackId: "",
  setPlaybackId: (value) => set(() => ({ playbackId: value })),
  livepeer: {},
  setLivepeer: (value) => set(() => ({ livepeer: value })),
  uploadUrl: "",
  setUploadUrl: (value) => set(() => ({ uploadUrl: value })),
  resumableUploadUrl: "",
  setResumableUploadUrl: (value) => set(() => ({ resumableUploadUrl: value })),
}));
