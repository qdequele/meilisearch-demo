import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Settings {
  url: string;
  apiKey: string;
  index: string;
  embedder: string;
  hybridRatio: number;
  titleAttr: string;
  descAttr: string;
  imageAttr: string;
}

interface SearchState {
  searchText: string;
  settings: Settings;
  setSearchText: (text: string) => void;
  setSettings: (settings: Settings) => void;
}

const defaultSettings: Settings = {
  url: "",
  apiKey: "",
  index: "",
  embedder: "",
  hybridRatio: 0.5,
  titleAttr: "",
  descAttr: "",
  imageAttr: "",
};

export const useStore = create<SearchState>()(
  persist(
    (set) => ({
      searchText: "",
      settings: defaultSettings,
      setSearchText: (text) => set({ searchText: text }),
      setSettings: (settings) => set({ settings }),
    }),
    {
      name: "search-store",
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
