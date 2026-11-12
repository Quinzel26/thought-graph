import { CATEGORIES } from "./constants.ts";

export type Category = (typeof CATEGORIES)[number];

export type CategoryFilter = "all" | Category;

export type Position = {
  x: number;
  y: number;
};

export type Thought = {
  id: string;
  title: string;
  body: string;
  category: Category;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  position: Position;
};

export type Relationship = {
  id: string;
  sourceId: string;
  targetId: string;
  createdAt: string;
};

export type GraphDocument = {
  version: 1;
  thoughts: Thought[];
  relationships: Relationship[];
};

export type ThoughtDraft = {
  title: string;
  body: string;
  category: Category;
  tags: string[];
};
