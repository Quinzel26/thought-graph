import { CATEGORIES, STORAGE_KEY } from "../constants.ts";
import type { Category, GraphDocument, Relationship, Thought } from "../types.ts";

export function emptyDocument(): GraphDocument {
  return { version: 1, thoughts: [], relationships: [] };
}

export type LoadResult = {
  document: GraphDocument;
  writable: boolean;
};

function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}

function isThought(value: unknown): value is Thought {
  if (!value || typeof value !== "object") return false;
  const thought = value as Thought;
  return (
    typeof thought.id === "string" &&
    typeof thought.title === "string" &&
    typeof thought.body === "string" &&
    isCategory(thought.category) &&
    Array.isArray(thought.tags) &&
    thought.tags.every((tag) => typeof tag === "string") &&
    typeof thought.createdAt === "string" &&
    typeof thought.updatedAt === "string" &&
    typeof thought.position?.x === "number" &&
    typeof thought.position?.y === "number"
  );
}

function isRelationship(value: unknown): value is Relationship {
  if (!value || typeof value !== "object") return false;
  const relationship = value as Relationship;
  return (
    typeof relationship.id === "string" &&
    typeof relationship.sourceId === "string" &&
    typeof relationship.targetId === "string" &&
    typeof relationship.createdAt === "string"
  );
}

// One JSON document is the whole notebook. A version field lets a future
// shape change refuse to overwrite data this build does not understand.
export function loadGraph(): LoadResult {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { document: emptyDocument(), writable: true };

  try {
    const parsed = JSON.parse(raw) as Partial<GraphDocument>;
    if (parsed.version !== 1) return { document: emptyDocument(), writable: false };
    if (!Array.isArray(parsed.thoughts) || !Array.isArray(parsed.relationships)) {
      return { document: emptyDocument(), writable: true };
    }
    if (!parsed.thoughts.every(isThought) || !parsed.relationships.every(isRelationship)) {
      return { document: emptyDocument(), writable: true };
    }
    return {
      document: {
        version: 1,
        thoughts: parsed.thoughts,
        relationships: parsed.relationships,
      },
      writable: true,
    };
  } catch {
    return { document: emptyDocument(), writable: true };
  }
}

export function saveGraph(document: GraphDocument) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
}
