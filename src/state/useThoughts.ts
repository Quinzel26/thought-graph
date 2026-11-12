import { createContext, useContext } from "react";
import type { CategoryFilter, Position, Relationship, Thought, ThoughtDraft } from "../types.ts";

export type ThoughtContextValue = {
  thoughts: Thought[];
  relationships: Relationship[];
  selectedId: string | null;
  drafting: boolean;
  searchQuery: string;
  categoryFilter: CategoryFilter;
  focusRequest: { id: string; nonce: number } | null;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: CategoryFilter) => void;
  selectThought: (id: string, focus?: boolean) => void;
  clearSelection: () => void;
  beginDraft: () => void;
  createThought: (draft: ThoughtDraft) => void;
  updateThought: (id: string, draft: ThoughtDraft) => void;
  deleteThought: (id: string) => void;
  moveThought: (id: string, position: Position) => void;
  connectThoughts: (sourceId: string, targetId: string) => void;
  disconnectThoughts: (relationshipId: string) => void;
};

export const ThoughtContext = createContext<ThoughtContextValue | null>(null);

export function useThoughts() {
  const context = useContext(ThoughtContext);
  if (!context) {
    throw new Error("useThoughts must be used within ThoughtProvider");
  }
  return context;
}
