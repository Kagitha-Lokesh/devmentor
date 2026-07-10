import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2, RefreshCw, Network } from 'lucide-react';
import { container } from '../../../infrastructure/di/container';
import { useAuthStore } from '../../store/useAuthStore';
import revisionIndex from '../../../shared/generated/revision-index.json';

// ─────────────────────────────────────────────────────────────────────────────
// Pure SVG Mind Map Renderer — no external dependencies.
// Implements a radial tree layout via BFS + polar coordinate conversion.
// Supports: Pan (click-drag), Zoom (mouse wheel + buttons), collapse/expand.
// ─────────────────────────────────────────────────────────────────────────────

const NODE_RADIUS = 6;
const LEVEL_GAP = 200; // px between levels
const ARC_GAP = 110;   // minimum px between sibling nodes (horizontal arc)

/**
 * Converts a flat nodes array (with parentId) into a tree structure.
 * @param {object[]} flatNodes
 * @returns {{ root: object, nodeMap: Map }}
 */
function buildTree(flatNodes) {
  const nodeMap = new Map();
  flatNodes.forEach((n) => {
    nodeMap.set(n.id, { ...n, children: [] });
  });

  let root = null;
  nodeMap.forEach((node) => {
    if (!node.parentId) {
      root = node;
    } else {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  return { root, nodeMap };
}

/**
 * Compute (x, y) layout positions for each node using a top-down layered layout.
 * @param {object} root - root node
 * @returns {Map<string, {x: number, y: number}>} positions map by id
 */
function computeLayout(root) {
  const positions = new Map();

  function countLeaves(node) {
    if (!node.children || node.children.length === 0) return 1;
    return node.children.reduce((sum, c) => sum + countLeaves(c), 0);
  }

  function assignPositions(node, xStart, xEnd, depth) {
    const x = (xStart + xEnd) / 2;
    const y = depth * LEVEL_GAP + 80;
    positions.set(node.id, { x, y, depth });

    if (node.children && node.children.length > 0) {
      let cursor = xStart;
      node.children.forEach((child) => {
        const leafCount = countLeaves(child);
        const fraction = (xEnd - xStart) * (leafCount / countLeaves(node));
        assignPositions(child, cursor, cursor + fraction, depth + 1);
        cursor += fraction;
      });
    }
  }

  if (root) {
    const totalLeaves = countLeaves(root);
    const totalWidth = Math.max(totalLeaves * ARC_GAP, 800);
    assignPositions(root, 0, totalWidth, 0);
  }

  return positions;
}

/**
 * A single rendered SVG node.
 */
function MindMapNode({ node, positions, collapsed, onToggle, isDark = true }) {
  const pos = positions.get(node.id);
  if (!pos) return null;

  const isCollapsed = collapsed.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isRoot = !node.parentId;

  const nodeColor = isRoot
    ? '#6366f1' // indigo/brand root
    : pos.depth === 1
    ? '#0ea5e9' // sky level-1
    : pos.depth === 2
    ? '#10b981' // emerald level-2
    : '#94a3b8'; // slate leaf

  const bgColor = isRoot ? '#1e1b4b' : pos.depth === 1 ? '#082f49' : pos.depth === 2 ? '#052e16' : '#1e293b';

  const labelPadX = 14;
  const labelPadY = 7;
  const fontSize = isRoot ? 13 : pos.depth === 1 ? 11 : 10;
  const maxLabelWidth = isRoot ? 200 : 180;

  // Word-wrap calculation (approximate chars per line)
  const charsPerLine = Math.floor(maxLabelWidth / (fontSize * 0.6));
  const words = node.label.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    if ((currentLine + ' ' + word).trim().length <= charsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);

  const approxWidth = Math.min(maxLabelWidth, Math.max(...lines.map((l) => l.length * fontSize * 0.6)) + labelPadX * 2);
  const approxHeight = lines.length * (fontSize + 4) + labelPadY * 2;

  const rectX = pos.x - approxWidth / 2;
  const rectY = pos.y - approxHeight / 2;

  return (
    <g
      onClick={() => hasChildren && onToggle(node.id)}
      style={{ cursor: hasChildren ? 'pointer' : 'default' }}
      role={hasChildren ? 'button' : undefined}
      aria-expanded={hasChildren ? !isCollapsed : undefined}
      aria-label={node.label}
    >
      {/* Node rectangle */}
      <rect
        x={rectX}
        y={rectY}
        width={approxWidth}
        height={approxHeight}
        rx={isRoot ? 10 : 7}
        fill={bgColor}
        stroke={nodeColor}
        strokeWidth={isRoot ? 2 : 1.5}
        opacity={0.97}
      />

      {/* Label text, multi-line */}
      {lines.map((line, idx) => (
        <text
          key={idx}
          x={pos.x}
          y={rectY + labelPadY + fontSize + idx * (fontSize + 4)}
          textAnchor="middle"
          fill={isRoot ? '#e0e7ff' : pos.depth <= 2 ? '#cbd5e1' : '#94a3b8'}
          fontSize={fontSize}
          fontWeight={isRoot ? 700 : pos.depth === 1 ? 600 : 400}
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {line}
        </text>
      ))}

      {/* Collapse/expand indicator */}
      {hasChildren && (
        <circle
          cx={pos.x + approxWidth / 2 - 6}
          cy={pos.y - approxHeight / 2 + 6}
          r={5}
          fill={isCollapsed ? nodeColor : bgColor}
          stroke={nodeColor}
          strokeWidth={1.5}
        />
      )}
    </g>
  );
}

/**
 * Main SVG mind map canvas.
 */
function MindMapCanvas({ nodes }) {
  const svgRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.85);
  const [collapsed, setCollapsed] = useState(new Set());
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPoint = useRef(null);

  const { root, nodeMap } = buildTree(nodes);
  const positions = root ? computeLayout(root) : new Map();

  // Compute canvas size from positions
  let maxX = 800, maxY = 600;
  positions.forEach(({ x, y }) => {
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  });
  const canvasWidth = maxX + 200;
  const canvasHeight = maxY + 200;

  // Toggle collapse
  const handleToggle = useCallback((id) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Pan handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    lastPanPoint.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isPanning || !lastPanPoint.current) return;
    const dx = e.clientX - lastPanPoint.current.x;
    const dy = e.clientY - lastPanPoint.current.y;
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPanPoint.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    lastPanPoint.current = null;
  };

  // Zoom via mouse wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((prev) => Math.min(2.5, Math.max(0.3, prev + delta)));
  };

  // Touch support for mobile pan
  const lastTouchRef = useRef(null);
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };
  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && lastTouchRef.current) {
      const dx = e.touches[0].clientX - lastTouchRef.current.x;
      const dy = e.touches[0].clientY - lastTouchRef.current.y;
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };
  const handleTouchEnd = () => { lastTouchRef.current = null; };

  const resetView = () => {
    setZoom(0.85);
    setPan({ x: 0, y: 0 });
    setCollapsed(new Set());
  };

  /**
   * Recursively render nodes (respecting collapsed state).
   */
  function renderTree(node) {
    if (!node) return null;
    const pos = positions.get(node.id);
    const isCollapsed = collapsed.has(node.id);

    return (
      <g key={node.id}>
        {/* Edges to children */}
        {!isCollapsed && node.children && node.children.map((child) => {
          const childPos = positions.get(child.id);
          if (!childPos || !pos) return null;
          return (
            <line
              key={`edge-${node.id}-${child.id}`}
              x1={pos.x}
              y1={pos.y}
              x2={childPos.x}
              y2={childPos.y}
              stroke="#334155"
              strokeWidth={1.5}
              strokeDasharray={child.children?.length === 0 ? '4,3' : undefined}
            />
          );
        })}

        {/* Node itself */}
        <MindMapNode
          node={node}
          positions={positions}
          collapsed={collapsed}
          onToggle={handleToggle}
        />

        {/* Recurse children */}
        {!isCollapsed && node.children && node.children.map((child) => renderTree(child))}
      </g>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-surface border border-default shadow-2xl" style={{ height: '620px' }}>
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
          className="p-2 bg-surface border border-default rounded-lg text-muted hover:text-primary hover:bg-surface-secondary transition-colors cursor-pointer shadow"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}
          className="p-2 bg-surface border border-default rounded-lg text-muted hover:text-primary hover:bg-surface-secondary transition-colors cursor-pointer shadow"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={resetView}
          className="p-2 bg-surface border border-default rounded-lg text-muted hover:text-primary hover:bg-surface-secondary transition-colors cursor-pointer shadow"
          title="Reset View"
          aria-label="Reset View"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 z-10 text-[10px] font-bold text-muted uppercase tracking-wider">
        {Math.round(zoom * 100)}%
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10 text-[10px] text-secondary font-medium">
        Drag to pan · Scroll to zoom · Click nodes to expand/collapse
      </div>

      {/* SVG canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isPanning ? 'grabbing' : 'grab', userSelect: 'none' }}
        role="img"
        aria-label="Mind map visualization"
      >
        {/* Dot grid background pattern */}
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#1e293b" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />

        {/* Transformed content group */}
        <g transform={`translate(${pan.x + 60}, ${pan.y + 40}) scale(${zoom})`}>
          {root && renderTree(root)}
        </g>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────────────────

export default function MindMapViewer() {
  const { topicSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const uid = user?.uid || 'anonymous';

  const [isLoading, setIsLoading] = useState(true);
  const [mindMap, setMindMap] = useState(null);

  const revisionUseCase = container.resolve('RevisionUseCase');

  const match = revisionIndex.find((r) => r.slug === topicSlug);
  const topicId = match ? match.topicId : null;

  useEffect(() => {
    if (!topicId) {
      navigate('/revision');
      return;
    }

    async function loadMindMap() {
      setIsLoading(true);
      try {
        const mm = await revisionUseCase.getMindMap(uid, topicId);
        if (!mm) {
          navigate('/revision');
          return;
        }
        setMindMap(mm);
      } catch (err) {
        console.error('Error loading mind map:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMindMap();
  }, [topicId, uid]);

  if (isLoading) {
    return <MindMapViewerSkeleton />;
  }

  if (!mindMap || mindMap.nodes.length === 0) {
    return (
      <div className="max-w-5xl mx-auto pb-12">
        <button
          onClick={() => navigate('/revision')}
          className="flex items-center gap-1 text-xs font-bold text-muted hover:text-primary uppercase tracking-wider mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
        <div className="bg-surface border border-default rounded-2xl p-12 text-center space-y-4">
          <Network className="h-10 w-10 text-muted mx-auto" />
          <h3 className="text-lg font-bold text-primary">No Mind Map Available</h3>
          <p className="text-xs text-muted max-w-xs mx-auto">
            This topic does not have a mind map configured yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-default pb-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/revision')}
            className="flex items-center gap-1 text-xs font-bold text-muted hover:text-primary uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-primary flex items-center gap-2">
            <Network className="h-6 w-6 text-brand-400" />
            {mindMap.title}
          </h1>
        </div>
        <div className="flex gap-2 text-[10px] text-muted font-bold uppercase tracking-wider">
          <span>{mindMap.nodes.length} Nodes</span>
          <span>·</span>
          <span>{mindMap.nodes.filter((n) => !n.parentId).length} Root</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 flex-wrap text-[10px] font-bold uppercase tracking-wider">
        {[
          { label: 'Root', color: 'bg-indigo-500' },
          { label: 'Level 1', color: 'bg-sky-500' },
          { label: 'Level 2', color: 'bg-emerald-500' },
          { label: 'Leaf', color: 'bg-surface-tertiary' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5 text-muted">
            <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
            {label}
          </div>
        ))}
      </div>

      {/* Canvas */}
      <MindMapCanvas nodes={mindMap.nodes} />
    </div>
  );
}

function MindMapViewerSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-pulse">
      <div className="h-10 border-b border-default/40" />
      <div className="bg-surface/50 border border-default/40 rounded-2xl" style={{ height: '620px' }} />
    </div>
  );
}
