/**
 * SkillRadar — Learning OS SVG radar visualization
 * 8-axis polygon showing module readiness scores.
 * Zero external dependencies — pure SVG.
 */
import React, { useRef, useEffect, useState } from 'react';
import curriculumWeights from '../../../shared/config/curriculum-weights.json';

const MODULE_KEYS = Object.keys(curriculumWeights).filter(k => k !== '_meta');

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function buildPolygon(cx, cy, r, values, count) {
  const angleStep = 360 / count;
  return values
    .map((v, i) => {
      const pt = polarToCartesian(cx, cy, r * (v / 100), i * angleStep);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');
}

function buildGrid(cx, cy, r, count, rings = 4) {
  const angleStep = 360 / count;
  const lines = [];
  for (let i = 0; i < count; i++) {
    const pt = polarToCartesian(cx, cy, r, i * angleStep);
    lines.push(`M${cx},${cy} L${pt.x},${pt.y}`);
  }
  const circles = Array.from({ length: rings }, (_, ri) => {
    const frac = ((ri + 1) / rings) * r;
    const pts = Array.from({ length: count }, (_, i) => {
      const p = polarToCartesian(cx, cy, frac, i * angleStep);
      return `${p.x},${p.y}`;
    }).join(' ');
    return pts;
  });
  return { lines, circles };
}

export function SkillRadar({ readinessMap, size = 280 }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const count = MODULE_KEYS.length;
  const angleStep = 360 / count;

  const values = MODULE_KEYS.map(k => readinessMap?.get(k) ?? 0);
  const { lines, circles } = buildGrid(cx, cy, r, count);

  const polygon = buildPolygon(cx, cy, r, animated ? values : values.map(() => 0), count);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label="Skill radar chart"
        role="img"
      >
        {/* Grid circles */}
        {circles.map((pts, i) => (
          <polygon
            key={`grid-${i}`}
            points={pts}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth="1"
            className="text-text"
          />
        ))}

        {/* Grid spokes */}
        {lines.map((d, i) => (
          <path key={`spoke-${i}`} d={d} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" className="text-text" />
        ))}

        {/* Skill polygon */}
        <polygon
          points={polygon}
          fill="rgba(99,102,241,0.15)"
          stroke="rgb(99,102,241)"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ transition: 'points 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}
        />

        {/* Data point dots */}
        {values.map((v, i) => {
          const pt = polarToCartesian(cx, cy, r * ((animated ? v : 0) / 100), i * angleStep);
          return (
            <circle
              key={`dot-${i}`}
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill="rgb(99,102,241)"
              stroke="white"
              strokeWidth="1.5"
              style={{ transition: `cx 0.8s, cy 0.8s` }}
            />
          );
        })}

        {/* Labels */}
        {MODULE_KEYS.map((key, i) => {
          const angle = i * angleStep;
          const labelR = r + 22;
          const pt = polarToCartesian(cx, cy, labelR, angle);
          const config = curriculumWeights[key];
          return (
            <text
              key={`label-${key}`}
              x={pt.x}
              y={pt.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontWeight="700"
              className="fill-current text-text/50"
              style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {config?.label?.split(' ')[0] || key}
            </text>
          );
        })}
      </svg>

      <div className="grid grid-cols-3 gap-x-4 gap-y-1">
        {MODULE_KEYS.map(key => {
          const config = curriculumWeights[key];
          const val = readinessMap?.get(key) ?? 0;
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: config?.color || '#6366f1' }}
              />
              <span className="text-[10px] text-text/50 font-semibold truncate">
                {config?.label?.split(' ')[0]}
              </span>
              <span className="text-[10px] text-text/70 font-bold tabular-nums ml-auto">
                {val}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SkillRadar;
