import { useMemo } from "react";
import { CATEGORIES } from "../constants.ts";
import { isThoughtVisible } from "../lib/graph.ts";
import type { CategoryFilter } from "../types.ts";
import { useThoughts } from "../state/useThoughts.ts";

const filters: CategoryFilter[] = ["all", ...CATEGORIES];

function filterLabel(filter: CategoryFilter) {
  return filter === "all" ? "All" : filter;
}

export function Sidebar() {
  const {
    thoughts,
    selectedId,
    searchQuery,
    categoryFilter,
    setSearchQuery,
    setCategoryFilter,
    selectThought,
    beginDraft,
  } = useThoughts();

  const visible = useMemo(
    () =>
      thoughts
        .filter((thought) => isThoughtVisible(thought, searchQuery, categoryFilter))
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [categoryFilter, searchQuery, thoughts],
  );

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-zinc-800">
      <div className="border-b border-zinc-800 px-4 py-5">
        <h1 className="font-serif text-xl tracking-tight text-zinc-100">Thought Graph</h1>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">A notebook of connected ideas.</p>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4">
        <button
          type="button"
          onClick={beginDraft}
          className="border border-zinc-700 px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
        >
          New thought
        </button>
        <label className="block">
          <span className="sr-only">Search thoughts</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search thoughts"
            className="w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 pb-4">
        {filters.map((filter) => {
          const active = filter === categoryFilter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setCategoryFilter(filter)}
              className={`border px-2 py-1 text-[11px] tracking-wide ${
                active
                  ? "border-zinc-500 text-zinc-100"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {filterLabel(filter)}
            </button>
          );
        })}
      </div>

      <p className="px-4 pb-2 text-[11px] uppercase tracking-[0.14em] text-zinc-600">
        {visible.length} {visible.length === 1 ? "thought" : "thoughts"}
      </p>
      <ul className="min-h-0 flex-1 overflow-y-auto border-t border-zinc-800">
        {visible.length === 0 && (
          <li className="px-4 py-6 text-sm text-zinc-500">Nothing in this view.</li>
        )}
        {visible.map((thought) => {
          const selected = thought.id === selectedId;
          return (
            <li key={thought.id} className="border-b border-zinc-900">
              <button
                type="button"
                onClick={() => selectThought(thought.id, true)}
                className={`w-full px-4 py-3 text-left ${selected ? "bg-zinc-900" : "hover:bg-zinc-900/60"}`}
              >
                <span className="block text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                  {thought.category}
                </span>
                <span className="mt-1 block font-serif text-sm text-zinc-200">{thought.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
