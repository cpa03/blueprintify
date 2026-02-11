import { create } from "zustand";
import type { RefineRequest } from "@blueprint/shared";
import type { StoredSession } from "../types/storage";

interface RefinementStore {
  // State
  isRefining: boolean;
  currentInstruction: string;
  selectedContent: string;
  selectedSection: "blueprint" | "tasks" | "section";
  refinementHistory: Array<{
    id: string;
    instruction: string;
    originalContent: string;
    refinedContent: string;
    timestamp: string;
  }>;

  // Actions
  setInstruction: (instruction: string) => void;
  setSelectedContent: (
    content: string,
    section: "blueprint" | "tasks" | "section",
  ) => void;
  startRefinement: (request: RefineRequest) => Promise<void>;
  clearHistory: () => void;
  reset: () => void;
}

export const useRefinementStore = create<RefinementStore>((set, get) => ({
  // Initial state
  isRefining: false,
  currentInstruction: "",
  selectedContent: "",
  selectedSection: "blueprint",
  refinementHistory: [],

  // Actions
  setInstruction: (instruction) => set({ currentInstruction: instruction }),

  setSelectedContent: (content, section) =>
    set({
      selectedContent: content,
      selectedSection: section,
    }),

  startRefinement: async (request) => {
    set({ isRefining: true });

    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Refinement failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body received");
      }

      let refinedContent = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              set({ isRefining: false });
              return;
            }
            if (data.startsWith("[ERROR]")) {
              throw new Error(data.slice(7));
            }
            refinedContent += data;
          }
        }
      }

      // Add to history
      const historyEntry = {
        id: `refine_${Date.now()}`,
        instruction: request.instruction,
        originalContent: request.content,
        refinedContent,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        refinementHistory: [historyEntry, ...state.refinementHistory],
        isRefining: false,
      }));
    } catch (error) {
      console.error("Refinement error:", error);
      set({ isRefining: false });
      throw error;
    }
  },

  clearHistory: () => set({ refinementHistory: [] }),

  reset: () =>
    set({
      isRefining: false,
      currentInstruction: "",
      selectedContent: "",
      selectedSection: "blueprint",
      refinementHistory: [],
    }),
}));
