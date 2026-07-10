/**
 * KnowledgeGraphView — Learning OS interactive SVG dependency graph
 * Visualizes topics as nodes with prerequisite edges using a layered SVG layout.
 * No external libraries — pure SVG with CSS animations.
 *
 * Node states:
 *   green  = Mastered
 *   blue   = Current / In Progress
 *   gray   = Locked
 *   white  = Available
 *
 * Data: existing knowledge-graph.json + topic-dependencies.json
 */
import React, { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveLearningStatus, LearningStatus } from '../../../domain/models/LearningStatus';

const NODE_W = 140;
const NODE_H = 44;
const H_GAP = 40;
const V_GAP = 30;
const COLS = 3;

const NODE_COLORS = {
  [LearningStatus.MASTERED]:  { fill: '#10b981', stroke: '#059669', text: '#fff' },
  [LearningStatus.READING]:   { fill: '#6366f1', stroke: '#4f46e5', text: '#fff' },
  [LearningStatus.STARTED]:   { fill: '#6366f1', stroke: '#4f46e5', text: '#fff' },
  [LearningStatus.PRACTICE]:  { fill: '#3b82f6', stroke: '#2563eb', text: '#fff' },
  [LearningStatus.QUIZ]:      { fill: '#f59e0b', stroke: '#d97706', text: '#fff' },
  [LearningStatus.REVISION]:  { fill: '#8b5cf6', stroke: '#7c3aed', text: '#fff' },
  [LearningStatus.AVAILABLE]: { fill: '#1e293b', stroke: '#334155', text: '#94a3b8' },
  [LearningStatus.LOCKED]:    { fill: '#0f172a', stroke: '#1e293b', text: '#475569' },
};

function buildLayout(nodes) {
  // Simple grid layout: assign x,y positions per node
  return nodes.map((node, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return {
      ...node,
      x: col * (NODE_W + H_GAP),
      y: row * (NODE_H + V_GAP)
    };
  });
}

export function KnowledgeGraphView({
  graph = [],
  progressMap = new Map(),
  dependencyMap = new Map(),
  currentTopicId,
  maxNodes = 60,
  className = ''
}) {
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef(null);

  // Limit to first N nodes for performance
  const displayNodes = useMemo(() => graph.slice(0, maxNodes), [graph, maxNodes]);
  const positioned = useMemo(() => buildLayout(displayNodes), [displayNodes]);

  const totalW = COLS * (NODE_W + H_GAP);
  const totalH = Math.ceil(displayNodes.length / COLS) * (NODE_H + V_GAP);

  const handleMouseDown = (e) => {
    setIsPanning(true);
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const handleMouseMove = (e) => {
    if (!isPanning || !panStart.current) return;
    setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
  };
  const handleMouseUp = () => { setIsPanning(false); panStart.current = null; };

  return (
    <div
      className={`relative overflow-hidden bg-surface rounded-2xl border border-surface-border ${className}`}
      style={{ cursor: isPanning ? 'grabbing' : 'grab', userSelect: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${totalW + 40} ${totalH + 40}`}
        style={{ transform: `translate(${pan.x}px, ${pan.y}px)`, transition: isPanning ? 'none' : 'transform 0.1s' }}
      >
        {/* Edges */}
        {positioned.map(node => {
          const prereqs = dependencyMap.get(node.id) || [];
          return prereqs.map(preId => {
            const source = positioned.find(n => n.id === preId);
            if (!source) return null;
            const x1 = source.x + NODE_W / 2;
            const y1 = source.y + NODE_H;
            const x2 = node.x + NODE_W / 2;
            const y2 = node.y;
            return (
              <line
                key={`${preId}-${node.id}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="4,3"
                markerEnd="url(#arrow)"
              />
            );
          });
        })}

        {/* Arrow marker */}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#334155" />
          </marker>
        </defs>

        {/* Nodes */}
        {positioned.map(node => {
          const prerequisites = dependencyMap.get(node.id) || [];
          const status = resolveLearningStatus(node.id, prerequisites, progressMap, new Map());
          const colors = NODE_COLORS[status] || NODE_COLORS[LearningStatus.AVAILABLE];
          const isCurrent = node.id === currentTopicId;
          const isLocked = status === LearningStatus.LOCKED;

          return (
            <g key={node.id}>
              {/* Glow ring for current */}
              {isCurrent && (
                <rect
                  x={node.x - 3} y={node.y - 3}
                  width={NODE_W + 6} height={NODE_H + 6}
                  rx="10" ry="10"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeOpacity="0.5"
                >
                  <animate attributeName="strokeOpacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                </rect>
              )}

              <rect
                x={node.x} y={node.y}
                width={NODE_W} height={NODE_H}
                rx="8" ry="8"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="1"
                className="transition-opacity"
                style={{ opacity: isLocked ? 0.4 : 1 }}
                onClick={() => !isLocked && navigate(`/courses/java/topics/${node.slug}`)}
                onMouseEnter={() => setTooltip({ id: node.id, title: node.title, status, x: node.x, y: node.y })}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.4 : 1 }}
              />

              <text
                x={node.x + NODE_W / 2}
                y={node.y + NODE_H / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="600"
                fill={colors.text}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {node.title.length > 18 ? node.title.substring(0, 17) + '…' : node.title}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-10 bg-surface-secondary border border-surface-border rounded-lg px-3 py-2 text-xs shadow-lg pointer-events-none"
          style={{ left: 20, top: 20 }}
        >
          <p className="font-bold text-text">{tooltip.title}</p>
          <p className="text-text/50 capitalize">{tooltip.status}</p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-surface/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-surface-border">
        {[
          { color: '#10b981', label: 'Mastered' },
          { color: '#6366f1', label: 'In Progress' },
          { color: '#1e293b', label: 'Available' },
          { color: '#0f172a', label: 'Locked' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color, border: '1px solid rgba(255,255,255,0.1)' }} />
            <span className="text-[10px] text-text/50 font-semibold">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KnowledgeGraphView;
