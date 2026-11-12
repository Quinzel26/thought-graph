import { useEffect, useMemo, useRef } from "react";
import {
  Background,
  ConnectionMode,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
} from "@xyflow/react";
import {
  isThoughtVisible,
  linksThoughts,
  toFlowEdges,
  toFlowNodes,
  type ThoughtFlowNode,
} from "../lib/graph.ts";
import { useThoughts } from "../state/useThoughts.ts";
import { ThoughtNodeView } from "./ThoughtNode.tsx";

const nodeTypes = { thought: ThoughtNodeView };

function CanvasBridge({ nodeCount }: { nodeCount: number }) {
  const { setCenter, getNode, fitView } = useReactFlow();
  const { focusRequest } = useThoughts();
  const fitted = useRef(false);

  useEffect(() => {
    if (!focusRequest) return;
    const frame = window.requestAnimationFrame(() => {
      const node = getNode(focusRequest.id);
      if (!node) return;
      const width = node.measured?.width ?? 208;
      const height = node.measured?.height ?? 72;
      setCenter(node.position.x + width / 2, node.position.y + height / 2, {
        zoom: 1,
        duration: 0,
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusRequest, getNode, setCenter]);

  useEffect(() => {
    if (nodeCount === 0 || fitted.current) return;
    const frame = window.requestAnimationFrame(() => {
      fitted.current = true;
      fitView({ padding: 0.2, duration: 0 });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [fitView, nodeCount]);

  return null;
}

export function GraphCanvas() {
  const {
    thoughts,
    relationships,
    searchQuery,
    categoryFilter,
    selectedId,
    selectThought,
    clearSelection,
    moveThought,
    connectThoughts,
    disconnectThoughts,
  } = useThoughts();

  const visible = useMemo(
    () => thoughts.filter((thought) => isThoughtVisible(thought, searchQuery, categoryFilter)),
    [categoryFilter, searchQuery, thoughts],
  );
  const visibleIds = useMemo(() => new Set(visible.map((thought) => thought.id)), [visible]);
  const flowNodes = useMemo(
    () =>
      toFlowNodes(visible).map((node) => ({
        ...node,
        selected: node.id === selectedId,
      })),
    [selectedId, visible],
  );
  const flowEdges = useMemo(
    () => toFlowEdges(relationships, visibleIds),
    [relationships, visibleIds],
  );

  // Local node state lets a drag move smoothly. The domain is updated only when the drag ends.
  const [nodes, setNodes, onNodesChange] = useNodesState<ThoughtFlowNode>(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  const onConnect = (connection: Connection) => {
    if (!connection.source || !connection.target) return;
    connectThoughts(connection.source, connection.target);
  };

  return (
    <main className="relative min-w-0 flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => selectThought(node.id)}
        onPaneClick={clearSelection}
        onNodeDragStop={(_, node) => moveThought(node.id, node.position)}
        onConnect={onConnect}
        onEdgesDelete={(deleted) => {
          for (const edge of deleted) disconnectThoughts(edge.id);
        }}
        isValidConnection={(connection) => {
          const source = connection.source;
          const target = connection.target;
          if (!source || !target || source === target) return false;
          return !relationships.some((relationship) => linksThoughts(relationship, source, target));
        }}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        deleteKeyCode={["Backspace", "Delete"]}
        nodesFocusable
        edgesFocusable
        elementsSelectable
      >
        <Background color="#27272a" gap={28} size={1} />
        <Controls showInteractive={false} />
        <CanvasBridge nodeCount={flowNodes.length} />
      </ReactFlow>
      {thoughts.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="max-w-xs text-center text-sm text-zinc-500">
            The graph is empty. Create a thought to begin.
          </p>
        </div>
      )}
      {thoughts.length > 0 && visible.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="max-w-xs text-center text-sm text-zinc-500">
            No thoughts match this search or category.
          </p>
        </div>
      )}
    </main>
  );
}
