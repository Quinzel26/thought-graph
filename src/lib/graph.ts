import type { Edge, Node } from "@xyflow/react";
import type { Category, CategoryFilter, Relationship, Thought } from "../types.ts";

export type ThoughtNodeData = Record<string, unknown> & {
  title: string;
  category: Category;
  tags: string[];
};

export type ThoughtFlowNode = Node<ThoughtNodeData, "thought">;

const edgeStyle = { stroke: "#52525b", strokeWidth: 1 };

export function isThoughtVisible(
  thought: Thought,
  query: string,
  category: CategoryFilter,
): boolean {
  if (category !== "all" && thought.category !== category) return false;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [thought.title, thought.body, ...thought.tags].join("\n").toLowerCase();
  return haystack.includes(needle);
}

export function toFlowNodes(thoughts: Thought[]): ThoughtFlowNode[] {
  return thoughts.map((thought) => ({
    id: thought.id,
    type: "thought",
    position: thought.position,
    deletable: false,
    data: {
      title: thought.title,
      category: thought.category,
      tags: thought.tags,
    },
  }));
}

export function toFlowEdges(relationships: Relationship[], visibleIds: Set<string>): Edge[] {
  return relationships
    .filter(
      (relationship) =>
        visibleIds.has(relationship.sourceId) && visibleIds.has(relationship.targetId),
    )
    .map((relationship) => ({
      id: relationship.id,
      source: relationship.sourceId,
      target: relationship.targetId,
      style: edgeStyle,
    }));
}

// Stored links have a source and a target because React Flow needs both.
// The idea is undirected: A→B is the same connection as B→A.
export function linksThoughts(
  relationship: Relationship,
  sourceId: string,
  targetId: string,
): boolean {
  return (
    (relationship.sourceId === sourceId && relationship.targetId === targetId) ||
    (relationship.sourceId === targetId && relationship.targetId === sourceId)
  );
}

export function nextPosition(index: number) {
  const column = index % 4;
  const row = Math.floor(index / 4);
  return { x: 48 + column * 260, y: 48 + row * 160 };
}

export function parseTags(input: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of input.split(",")) {
    const tag = part.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  return tags;
}

export function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
