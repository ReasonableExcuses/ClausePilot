import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  Position,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GraphData } from '../../types';
import {
  Layers,
  User,
  CheckCircle2,
  Zap,
  Clock,
  AlertTriangle,
  Flame,
  X,
  Sparkles,
} from 'lucide-react';

interface ObligationGraphTabProps {
  graphData: GraphData | null;
}

// Custom Editorial Node Components
const ClauseNode = ({ data }: any) => (
  <div className="px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-obsidian-700 hover:border-obsidian-600 transition-colors shadow-lg text-white min-w-[170px] text-xs font-editorial">
    <Handle type="target" position={Position.Top} className="!bg-indigo-400 !w-1.5 !h-1.5 !border-0" />
    <div className="flex items-center gap-1.5 text-obsidian-400 text-[10px] uppercase tracking-wider mb-1 font-mono font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
      <span>Clause</span>
    </div>
    <div className="font-semibold text-white tracking-tight">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-indigo-400 !w-1.5 !h-1.5 !border-0" />
  </div>
);

const PartyNode = ({ data }: any) => (
  <div className="px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-obsidian-700 hover:border-obsidian-600 transition-colors shadow-lg text-white min-w-[150px] text-xs font-editorial">
    <Handle type="target" position={Position.Top} className="!bg-sky-400 !w-1.5 !h-1.5 !border-0" />
    <div className="flex items-center gap-1.5 text-obsidian-400 text-[10px] uppercase tracking-wider mb-1 font-mono font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
      <span>Party</span>
    </div>
    <div className="font-semibold text-obsidian-100 tracking-tight">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-sky-400 !w-1.5 !h-1.5 !border-0" />
  </div>
);

const ObligationNode = ({ data }: any) => (
  <div className="px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-obsidian-700 hover:border-obsidian-600 transition-colors shadow-lg text-white min-w-[180px] text-xs font-editorial">
    <Handle type="target" position={Position.Top} className="!bg-emerald-400 !w-1.5 !h-1.5 !border-0" />
    <div className="flex items-center gap-1.5 text-obsidian-400 text-[10px] uppercase tracking-wider mb-1 font-mono font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
      <span>Obligation</span>
    </div>
    <div className="font-semibold text-emerald-200 tracking-tight">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-emerald-400 !w-1.5 !h-1.5 !border-0" />
  </div>
);

const TriggerNode = ({ data }: any) => (
  <div className="px-3.5 py-2 rounded-xl bg-obsidian-900 border border-obsidian-700 hover:border-obsidian-600 transition-colors shadow-lg text-white min-w-[150px] text-xs font-editorial">
    <Handle type="target" position={Position.Top} className="!bg-purple-400 !w-1.5 !h-1.5 !border-0" />
    <div className="flex items-center gap-1.5 text-obsidian-400 text-[10px] uppercase tracking-wider mb-0.5 font-mono font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
      <span>Trigger</span>
    </div>
    <div className="font-medium text-obsidian-200 line-clamp-2">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-purple-400 !w-1.5 !h-1.5 !border-0" />
  </div>
);

const DeadlineNode = ({ data }: any) => (
  <div className="px-3.5 py-2 rounded-xl bg-obsidian-900 border border-obsidian-700 hover:border-obsidian-600 transition-colors shadow-lg text-white min-w-[150px] text-xs font-editorial">
    <Handle type="target" position={Position.Top} className="!bg-rose-400 !w-1.5 !h-1.5 !border-0" />
    <div className="flex items-center gap-1.5 text-obsidian-400 text-[10px] uppercase tracking-wider mb-0.5 font-mono font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
      <span>Deadline</span>
    </div>
    <div className="font-mono text-rose-300 font-semibold">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-rose-400 !w-1.5 !h-1.5 !border-0" />
  </div>
);

const ConditionNode = ({ data }: any) => (
  <div className="px-3.5 py-2 rounded-xl bg-obsidian-900 border border-obsidian-700 hover:border-obsidian-600 transition-colors shadow-lg text-white min-w-[150px] text-xs font-editorial">
    <Handle type="target" position={Position.Top} className="!bg-amber-400 !w-1.5 !h-1.5 !border-0" />
    <div className="flex items-center gap-1.5 text-obsidian-400 text-[10px] uppercase tracking-wider mb-0.5 font-mono font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
      <span>Condition</span>
    </div>
    <div className="font-medium text-obsidian-200 line-clamp-2">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-amber-400 !w-1.5 !h-1.5 !border-0" />
  </div>
);

const ConsequenceNode = ({ data }: any) => (
  <div className="px-3.5 py-2 rounded-xl bg-obsidian-900 border border-obsidian-700 hover:border-obsidian-600 transition-colors shadow-lg text-white min-w-[150px] text-xs font-editorial">
    <Handle type="target" position={Position.Top} className="!bg-red-400 !w-1.5 !h-1.5 !border-0" />
    <div className="flex items-center gap-1.5 text-obsidian-400 text-[10px] uppercase tracking-wider mb-0.5 font-mono font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
      <span>Consequence</span>
    </div>
    <div className="font-medium text-red-200 line-clamp-2">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-red-400 !w-1.5 !h-1.5 !border-0" />
  </div>
);

export const ObligationGraphTab: React.FC<ObligationGraphTabProps> = ({ graphData }) => {
  const [selectedNodeData, setSelectedNodeData] = useState<any | null>(null);

  const nodeTypes = useMemo(
    () => ({
      clause: ClauseNode,
      party: PartyNode,
      obligation: ObligationNode,
      trigger: TriggerNode,
      deadline: DeadlineNode,
      condition: ConditionNode,
      consequence: ConsequenceNode,
    }),
    []
  );

  // Position calculation for grid layout
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!graphData) return { initialNodes: [], initialEdges: [] };

    const clauses = graphData.nodes.filter((n) => n.type === 'clause');
    const parties = graphData.nodes.filter((n) => n.type === 'party');
    const obligations = graphData.nodes.filter((n) => n.type === 'obligation');
    const triggers = graphData.nodes.filter((n) => n.type === 'trigger');
    const deadlines = graphData.nodes.filter((n) => n.type === 'deadline');
    const conditions = graphData.nodes.filter((n) => n.type === 'condition');
    const consequences = graphData.nodes.filter((n) => n.type === 'consequence');

    const nodesWithPositions: Node[] = [];

    // Tier 0: Clauses (y = 50)
    clauses.forEach((c, idx) => {
      nodesWithPositions.push({
        id: c.id,
        type: 'clause',
        position: { x: idx * 260 + 50, y: 50 },
        data: { label: c.label, ...c.data },
      });
    });

    // Tier 1: Parties (y = 190)
    parties.forEach((p, idx) => {
      nodesWithPositions.push({
        id: p.id,
        type: 'party',
        position: { x: idx * 360 + 200, y: 190 },
        data: { label: p.label, ...p.data },
      });
    });

    // Tier 2: Triggers (y = 320)
    triggers.forEach((t, idx) => {
      nodesWithPositions.push({
        id: t.id,
        type: 'trigger',
        position: { x: idx * 240 + 60, y: 320 },
        data: { label: t.label, ...t.data },
      });
    });

    // Tier 3: Obligations (y = 450)
    obligations.forEach((o, idx) => {
      nodesWithPositions.push({
        id: o.id,
        type: 'obligation',
        position: { x: idx * 260 + 50, y: 450 },
        data: { label: o.label, ...o.data },
      });
    });

    // Tier 4: Deadlines (y = 600)
    deadlines.forEach((d, idx) => {
      nodesWithPositions.push({
        id: d.id,
        type: 'deadline',
        position: { x: idx * 250 + 50, y: 600 },
        data: { label: d.label, ...d.data },
      });
    });

    // Tier 5: Conditions & Consequences (y = 730)
    conditions.forEach((cd, idx) => {
      nodesWithPositions.push({
        id: cd.id,
        type: 'condition',
        position: { x: idx * 260 + 80, y: 730 },
        data: { label: cd.label, ...cd.data },
      });
    });

    consequences.forEach((cq, idx) => {
      nodesWithPositions.push({
        id: cq.id,
        type: 'consequence',
        position: { x: idx * 260 + 380, y: 730 },
        data: { label: cq.label, ...cq.data },
      });
    });

    const edges: Edge[] = graphData.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.animated ?? true,
      style: { stroke: '#2D313B', strokeWidth: 1.5 },
      labelStyle: { fill: '#8C92A4', fontSize: 10, fontFamily: 'monospace' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#4B5563',
        width: 12,
        height: 12,
      },
    }));

    return { initialNodes: nodesWithPositions, initialEdges: edges };
  }, [graphData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((event: any, node: Node) => {
    setSelectedNodeData(node.data);
  }, []);

  return (
    <div className="space-y-4 font-editorial">
      {/* Visual Legend */}
      <div className="editorial-panel p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-medium text-obsidian-200">
          <span className="text-white font-semibold">Graph Ontology</span>
          <span className="text-obsidian-600">/</span>
          <span className="text-obsidian-400">Interactive Node Topology</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-800/80 border border-obsidian-750 text-obsidian-300 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Clause
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-800/80 border border-obsidian-750 text-obsidian-300 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> Party
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-800/80 border border-obsidian-750 text-obsidian-300 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Obligation
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-800/80 border border-obsidian-750 text-obsidian-300 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Trigger
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-800/80 border border-obsidian-750 text-obsidian-300 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Deadline
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-800/80 border border-obsidian-750 text-obsidian-300 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Condition
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-800/80 border border-obsidian-750 text-obsidian-300 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Consequence
          </span>
        </div>

        <span className="text-obsidian-400 text-[11px] hidden lg:block font-mono">
          Click node to inspect metadata
        </span>
      </div>

      {/* Main Graph Canvas */}
      <div className="relative w-full h-[620px] rounded-2xl bg-obsidian-950 border border-obsidian-750 overflow-hidden shadow-2xl">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background color="#1A1D24" gap={20} size={1} />
          <Controls className="!bg-obsidian-900 !border-obsidian-750 !fill-obsidian-200 [&>button]:!border-obsidian-750 [&>button]:!bg-obsidian-900 [&>button]:!text-obsidian-300 hover:[&>button]:!text-white" />
          <MiniMap
            nodeColor={(n) => {
              if (n.type === 'clause') return '#6366f1';
              if (n.type === 'party') return '#38bdf8';
              if (n.type === 'obligation') return '#10b981';
              if (n.type === 'trigger') return '#a855f7';
              if (n.type === 'deadline') return '#f43f5e';
              if (n.type === 'condition') return '#f59e0b';
              return '#ef4444';
            }}
            className="!bg-obsidian-950 !border-obsidian-750 rounded-xl overflow-hidden"
          />
        </ReactFlow>

        {/* Selected Node Inspector Drawer */}
        {selectedNodeData && (
          <div className="absolute top-4 right-4 w-84 bg-obsidian-900/95 backdrop-blur-md p-4 rounded-xl border border-obsidian-700 shadow-2xl z-10 text-xs animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-obsidian-750">
              <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                {selectedNodeData.badge || 'Node Inspector'}
              </span>
              <button
                onClick={() => setSelectedNodeData(null)}
                className="p-1 text-obsidian-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="text-sm font-semibold text-white mb-3 tracking-tight">{selectedNodeData.label}</h4>

            {selectedNodeData.actor && (
              <div className="mb-2.5">
                <span className="text-obsidian-400 block text-[10px] uppercase font-mono mb-0.5">Bound Actor</span>
                <span className="text-obsidian-100 font-medium">{selectedNodeData.actor}</span>
              </div>
            )}

            {selectedNodeData.amount && (
              <div className="mb-2.5">
                <span className="text-obsidian-400 block text-[10px] uppercase font-mono mb-0.5">Amount</span>
                <span className="text-emerald-400 font-mono font-medium">{selectedNodeData.amount}</span>
              </div>
            )}

            {selectedNodeData.deadline && (
              <div className="mb-2.5">
                <span className="text-obsidian-400 block text-[10px] uppercase font-mono mb-0.5">Normalized Deadline</span>
                <span className="text-rose-300 font-mono">{selectedNodeData.deadline}</span>
              </div>
            )}

            {selectedNodeData.evidence && (
              <div className="mt-3 pt-2.5 border-t border-obsidian-750">
                <span className="text-obsidian-400 block text-[10px] uppercase font-mono mb-1">Contract Evidence</span>
                <p className="text-obsidian-300 italic font-mono-code leading-relaxed text-[11px] bg-obsidian-950 p-2.5 rounded-lg border border-obsidian-800">
                  "{selectedNodeData.evidence}"
                </p>
                {selectedNodeData.source_page && (
                  <span className="text-[10px] text-obsidian-400 block mt-1 font-mono">
                    Page {selectedNodeData.source_page}
                  </span>
                )}
              </div>
            )}

            {selectedNodeData.preview && (
              <p className="text-obsidian-300 italic leading-relaxed mt-2 text-[11px]">
                {selectedNodeData.preview}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
