import { useState, type FormEvent } from "react";
import { CATEGORIES, DEFAULT_CATEGORY } from "../constants.ts";
import { formatWhen, parseTags } from "../lib/graph.ts";
import type { Category, Thought, ThoughtDraft } from "../types.ts";
import { useThoughts } from "../state/useThoughts.ts";

const fieldClass =
  "w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-600";

export function ThoughtPanel() {
  const { thoughts, selectedId, drafting } = useThoughts();
  const selected = thoughts.find((thought) => thought.id === selectedId) ?? null;

  if (!drafting && !selected) {
    return (
      <aside className="flex h-full w-[380px] shrink-0 flex-col border-l border-zinc-800">
        <div className="flex flex-1 items-center px-6">
          <p className="text-sm leading-relaxed text-zinc-500">
            Select a thought, or start a new one. The panel is where a thought keeps its full text.
          </p>
        </div>
      </aside>
    );
  }

  // Remount when the open record changes. A drag updates position only, so an unsaved edit stays put.
  const formKey = drafting || !selected ? "draft" : `${selected.id}:${selected.updatedAt}`;

  return (
    <aside className="flex h-full w-[380px] shrink-0 flex-col border-l border-zinc-800">
      <ThoughtForm key={formKey} drafting={drafting} thought={drafting ? null : selected} />
    </aside>
  );
}

function ThoughtForm({
  drafting,
  thought,
}: {
  drafting: boolean;
  thought: Thought | null;
}) {
  const {
    thoughts,
    relationships,
    selectThought,
    createThought,
    updateThought,
    deleteThought,
    disconnectThoughts,
  } = useThoughts();

  const [title, setTitle] = useState(thought?.title ?? "");
  const [body, setBody] = useState(thought?.body ?? "");
  const [category, setCategory] = useState<Category>(thought?.category ?? DEFAULT_CATEGORY);
  const [tagsText, setTagsText] = useState(thought?.tags.join(", ") ?? "");
  const [error, setError] = useState("");

  const links = thought
    ? relationships.filter(
        (relationship) =>
          relationship.sourceId === thought.id || relationship.targetId === thought.id,
      )
    : [];

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) {
      setError("A title is required.");
      return;
    }
    const draft: ThoughtDraft = {
      title: nextTitle,
      body: body.trim(),
      category,
      tags: parseTags(tagsText),
    };
    if (drafting || !thought) {
      createThought(draft);
      return;
    }
    updateThought(thought.id, draft);
  };

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            {drafting ? "New thought" : "Thought"}
          </p>
          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs text-zinc-500">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={`${fieldClass} font-serif text-base`}
              autoFocus
            />
          </label>
          {error && <p className="mt-1.5 text-xs text-zinc-400">{error}</p>}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs text-zinc-500">Body</span>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={10}
            className={`${fieldClass} resize-y leading-relaxed`}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs text-zinc-500">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            className={fieldClass}
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs text-zinc-500">Tags</span>
          <input
            value={tagsText}
            onChange={(event) => setTagsText(event.target.value)}
            placeholder="Separate with commas"
            className={fieldClass}
          />
        </label>

        {thought && (
          <dl className="space-y-1 text-xs text-zinc-500">
            <div className="flex justify-between gap-4">
              <dt>Created</dt>
              <dd className="text-zinc-400">{formatWhen(thought.createdAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Updated</dt>
              <dd className="text-zinc-400">{formatWhen(thought.updatedAt)}</dd>
            </div>
          </dl>
        )}

        {thought && (
          <section>
            <h2 className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Connected</h2>
            {links.length === 0 ? (
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Drag from one side of this node to another thought. A link has no direction.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-zinc-900 border border-zinc-800">
                {links.map((relationship) => {
                  const otherId =
                    relationship.sourceId === thought.id
                      ? relationship.targetId
                      : relationship.sourceId;
                  const other = thoughts.find((item) => item.id === otherId);
                  if (!other) return null;
                  return (
                    <li key={relationship.id} className="flex items-center gap-2 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => selectThought(other.id, true)}
                        className="min-w-0 flex-1 truncate text-left font-serif text-sm text-zinc-200"
                      >
                        {other.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => disconnectThoughts(relationship.id)}
                        className="text-xs text-zinc-500 hover:text-zinc-200"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-zinc-800 px-5 py-4">
        {thought ? (
          <button
            type="button"
            onClick={() => deleteThought(thought.id)}
            className="text-sm text-zinc-500 hover:text-zinc-200"
          >
            Delete thought
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          className="border border-zinc-600 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-900"
        >
          Save
        </button>
      </div>
    </form>
  );
}
