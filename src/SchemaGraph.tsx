import { useMemo } from "react";
import {
  Background, BackgroundVariant, Controls, Handle, MarkerType, Position, ReactFlow,
  type Edge, type Node, type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import type { SchemaIR, Table } from "./types";
import { useTheme } from "./theme";

const WIDTH = 230;
const ROW = 24;
const HEAD = 44;
const PAD = 8;

export const ROLE_COLOR: Record<string, string> = {
  fact: "var(--fact)",
  dimension: "var(--dim)",
  bridge: "var(--bridge)",
  unknown: "var(--unknown)",
};

function TableNode({ data }: NodeProps) {
  const { table, selected } = data as { table: Table; selected: boolean };
  return (
    <div className={`tn${selected ? " sel" : ""}`} style={{ ["--c" as string]: ROLE_COLOR[table.role] }}>
      <Handle type="target" position={Position.Left} />
      <div className="tn-head">
        <b>{table.name}</b>
        <span>{table.role}</span>
      </div>
      {table.columns.map((c) => (
        <div className="tn-row" key={c.id}>
          <span>
            {c.semantic_role === "key" ? "🔑 " : c.semantic_role === "foreign_key" ? "🔗 " : ""}
            {c.name}
          </span>
          <em>{c.logical_type}</em>
        </div>
      ))}
      <div className="tn-pad" />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { table: TableNode };

type Props = {
  ir: SchemaIR;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function SchemaGraph({ ir, selectedId, onSelect }: Props) {
  const { theme } = useTheme();

  const layout = useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 120 });
    g.setDefaultEdgeLabel(() => ({}));
    const heights: Record<string, number> = {};
    ir.tables.forEach((t) => {
      heights[t.id] = HEAD + t.columns.length * ROW + PAD + 4;
      g.setNode(t.id, { width: WIDTH, height: heights[t.id] });
    });
    ir.relationships.forEach((r) => g.setEdge(r.from_table, r.to_table));
    dagre.layout(g);
    return ir.tables.map((t) => {
      const p = g.node(t.id);
      return { table: t, x: p.x - WIDTH / 2, y: p.y - heights[t.id] / 2 };
    });
  }, [ir]);

  const edgeColor = theme === "dark" ? "#94a3bb" : "#14213d";

  const nodes: Node[] = layout.map(({ table, x, y }) => ({
    id: table.id,
    type: "table",
    position: { x, y },
    data: { table, selected: table.id === selectedId },
  }));

  const edges: Edge[] = ir.relationships.map((r) => ({
    id: r.id,
    source: r.from_table,
    target: r.to_table,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
    style: { stroke: edgeColor, strokeWidth: 1.6 },
  }));

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      colorMode={theme}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      nodesConnectable={false}
      onNodeClick={(_, n) => onSelect(n.id)}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.4} color={theme === "dark" ? "#2a3856" : "#b9c4d4"} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}