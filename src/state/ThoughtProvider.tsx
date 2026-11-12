import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { loadGraph, saveGraph } from "../data/storage.ts";
import { linksThoughts, nextPosition } from "../lib/graph.ts";
import type { CategoryFilter, Position, Relationship, Thought, ThoughtDraft } from "../types.ts";
import { ThoughtContext, type ThoughtContextValue } from "./useThoughts.ts";

type GraphState = {
  thoughts: Thought[];
  relationships: Relationship[];
};

type Action =
  | { type: "create"; thought: Thought }
  | { type: "update"; id: string; draft: ThoughtDraft }
  | { type: "delete"; id: string }
  | { type: "move"; id: string; position: Position }
  | { type: "connect"; relationship: Relationship }
  | { type: "disconnect"; id: string };

function reducer(state: GraphState, action: Action): GraphState {
  switch (action.type) {
    case "create":
      return { ...state, thoughts: [...state.thoughts, action.thought] };
    case "update":
      return {
        ...state,
        thoughts: state.thoughts.map((thought) =>
          thought.id === action.id
            ? { ...thought, ...action.draft, updatedAt: new Date().toISOString() }
            : thought,
        ),
      };
    case "delete":
      return {
        thoughts: state.thoughts.filter((thought) => thought.id !== action.id),
        relationships: state.relationships.filter(
          (relationship) =>
            relationship.sourceId !== action.id && relationship.targetId !== action.id,
        ),
      };
    case "move":
      return {
        ...state,
        thoughts: state.thoughts.map((thought) =>
          thought.id === action.id ? { ...thought, position: action.position } : thought,
        ),
      };
    case "connect": {
      const { sourceId, targetId } = action.relationship;
      if (sourceId === targetId) return state;
      const hasSource = state.thoughts.some((thought) => thought.id === sourceId);
      const hasTarget = state.thoughts.some((thought) => thought.id === targetId);
      if (!hasSource || !hasTarget) return state;
      const exists = state.relationships.some((relationship) =>
        linksThoughts(relationship, sourceId, targetId),
      );
      if (exists) return state;
      return { ...state, relationships: [...state.relationships, action.relationship] };
    }
    case "disconnect":
      return {
        ...state,
        relationships: state.relationships.filter(
          (relationship) => relationship.id !== action.id,
        ),
      };
    default:
      return state;
  }
}

const emptyGraph: GraphState = { thoughts: [], relationships: [] };

export function ThoughtProvider({ children }: { children: ReactNode }) {
  const [storage] = useState(loadGraph);
  const [state, dispatch] = useReducer(reducer, emptyGraph, () => ({
    thoughts: storage.document.thoughts,
    relationships: storage.document.relationships,
  }));
  const hasMounted = useRef(false);

  // Selection, search, and the open draft are session UI. They are not part of the notebook.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [focusRequest, setFocusRequest] = useState<{ id: string; nonce: number } | null>(null);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (!storage.writable) return;
    saveGraph({
      version: 1,
      thoughts: state.thoughts,
      relationships: state.relationships,
    });
  }, [state, storage.writable]);

  const selectThought = (id: string, focus = false) => {
    setDrafting(false);
    setSelectedId(id);
    if (focus) setFocusRequest({ id, nonce: Date.now() });
  };

  const clearSelection = () => {
    setDrafting(false);
    setSelectedId(null);
  };

  const beginDraft = () => {
    setSelectedId(null);
    setDrafting(true);
  };

  const createThought = (draft: ThoughtDraft) => {
    const now = new Date().toISOString();
    const thought: Thought = {
      id: crypto.randomUUID(),
      ...draft,
      createdAt: now,
      updatedAt: now,
      position: nextPosition(state.thoughts.length),
    };
    dispatch({ type: "create", thought });
    setDrafting(false);
    setSelectedId(thought.id);
    setSearchQuery("");
    setCategoryFilter("all");
    setFocusRequest({ id: thought.id, nonce: Date.now() });
  };

  const updateThought = (id: string, draft: ThoughtDraft) => {
    dispatch({ type: "update", id, draft });
  };

  const deleteThought = (id: string) => {
    dispatch({ type: "delete", id });
    if (selectedId === id) {
      setSelectedId(null);
      setDrafting(false);
    }
  };

  const moveThought = (id: string, position: Position) => {
    dispatch({ type: "move", id, position });
  };

  const connectThoughts = (sourceId: string, targetId: string) => {
    dispatch({
      type: "connect",
      relationship: {
        id: crypto.randomUUID(),
        sourceId,
        targetId,
        createdAt: new Date().toISOString(),
      },
    });
  };

  const disconnectThoughts = (relationshipId: string) => {
    dispatch({ type: "disconnect", id: relationshipId });
  };

  const value: ThoughtContextValue = {
    thoughts: state.thoughts,
    relationships: state.relationships,
    selectedId,
    drafting,
    searchQuery,
    categoryFilter,
    focusRequest,
    setSearchQuery,
    setCategoryFilter,
    selectThought,
    clearSelection,
    beginDraft,
    createThought,
    updateThought,
    deleteThought,
    moveThought,
    connectThoughts,
    disconnectThoughts,
  };

  return <ThoughtContext value={value}>{children}</ThoughtContext>;
}
