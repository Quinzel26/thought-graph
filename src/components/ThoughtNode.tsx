import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ThoughtFlowNode } from "../lib/graph.ts";

export function ThoughtNodeView({ data, selected }: NodeProps<ThoughtFlowNode>) {
  const tags = data.tags.slice(0, 3);

  return (
    <div
      className={`w-52 border bg-zinc-900 px-3 py-2.5 ${
        selected ? "border-zinc-400" : "border-zinc-800"
      }`}
    >
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        role="button"
        aria-label={`Connect left of ${data.title}`}
      />
      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{data.category}</p>
      <h3 className="mt-1 font-serif text-sm leading-snug text-zinc-100">
        {data.title || "Untitled"}
      </h3>
      {tags.length > 0 && (
        <p className="mt-2 truncate text-[11px] text-zinc-500">{tags.join(" · ")}</p>
      )}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        role="button"
        aria-label={`Connect right of ${data.title}`}
      />
    </div>
  );
}
