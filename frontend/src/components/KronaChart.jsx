import { useState, useMemo } from 'react';
import { ResponsiveSunburst } from '@nivo/sunburst';

/* ── Curated colour palette ──────────────────────────────────────────── */
const SPECIES_COLORS = [
  '#4E79A7', // Steel blue
  '#F28E2B', // Tangerine
  '#9C755F', // Warm brown
  '#76B7B2', // Teal
  '#B07AA1', // Mauve
  '#EDC948', // Gold
  '#59A14F', // Sage green
  '#FF9DA7', // Rose
];

const UPREG_COLOR = '#22c55e';
const DOWNREG_COLOR = '#ef4444';

/**
 * Build a flat colour map keyed by node id.
 * Species  → palette colour
 * Stress   → lighter tint of parent species colour
 * Upreg    → green
 * Downreg  → red
 */
function buildColorMap(data) {
  const map = {};
  if (!data || !data.children) return map;

  data.children.forEach((species, sIdx) => {
    const base = SPECIES_COLORS[sIdx % SPECIES_COLORS.length];
    map[species.name] = base;

    if (species.children) {
      species.children.forEach((stress) => {
        // Stress nodes get a lighter tint of the species colour
        map[`${species.name}::${stress.name}`] = lighten(base, 0.3);

        if (stress.children) {
          stress.children.forEach((leaf) => {
            const key = `${species.name}::${stress.name}::${leaf.name}`;
            if (leaf.name === 'Upregulated') map[key] = UPREG_COLOR;
            else if (leaf.name === 'Downregulated') map[key] = DOWNREG_COLOR;
            else map[key] = '#9ca3af';
          });
        }
      });
    }
  });

  return map;
}

/** Lighten a hex colour by `amount` (0–1). */
function lighten(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/**
 * Walk the tree and tag every node with a `_path` key so we can look up
 * colours unambiguously even when names repeat (e.g. "Upregulated").
 */
function tagPaths(node, prefix = '') {
  const path = prefix ? `${prefix}::${node.name}` : node.name;
  const tagged = { ...node, _path: path };
  if (node.children) {
    tagged.children = node.children.map((c) => tagPaths(c, path));
  }
  return tagged;
}

export default function KronaChart({ data }) {
  const [drillNode, setDrillNode] = useState(null);

  const taggedData = useMemo(() => (data ? tagPaths(data) : null), [data]);
  const colorMap = useMemo(() => buildColorMap(data), [data]);

  if (!data) return null;

  const displayData = drillNode || taggedData;

  const getColor = (node) => {
    const path = node.data?._path || node._path || node.id;
    // Strip root prefix for lookup
    const stripped = path.replace(/^MIMI-DB::/, '');
    if (colorMap[stripped]) return colorMap[stripped];
    // Leaf-level fallback
    if (node.id === 'Upregulated' || node.data?.name === 'Upregulated') return UPREG_COLOR;
    if (node.id === 'Downregulated' || node.data?.name === 'Downregulated') return DOWNREG_COLOR;
    return '#d1d5db';
  };

  /* Breadcrumb trail */
  const breadcrumb = [];
  if (drillNode) {
    const parts = drillNode._path.split('::');
    parts.forEach((part, i) => {
      breadcrumb.push({ label: part, path: parts.slice(0, i + 1).join('::') });
    });
  }

  const handleClick = (node) => {
    const d = node.data;
    if (d && d.children && d.children.length > 0) {
      setDrillNode(d);
    }
  };

  const handleBreadcrumbClick = (path) => {
    if (path === taggedData._path || path === taggedData.name) {
      setDrillNode(null);
    } else {
      // Walk the tagged tree to find the node
      const found = findNodeByPath(taggedData, path);
      if (found) setDrillNode(found);
    }
  };

  return (
    <div className="krona-wrapper">
      <div className="krona-controls">
        {drillNode ? (
          <div className="krona-breadcrumb">
            <button
              className="krona-breadcrumb-btn"
              onClick={() => setDrillNode(null)}
            >
              All Species
            </button>
            {breadcrumb.filter(bc => bc.label !== 'MIMI-DB').map((bc, i) => (
              <span key={i}>
                <span className="krona-breadcrumb-sep">›</span>
                <button
                  className="krona-breadcrumb-btn active"
                  onClick={() => handleBreadcrumbClick(bc.path)}
                >
                  {bc.label}
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="krona-breadcrumb">
            <span className="krona-breadcrumb-btn active">All Species</span>
            <span className="krona-hint">Click a segment to view the contents</span>
          </div>
        )}
      </div>

      <div className="krona-chart">
        <ResponsiveSunburst
          data={displayData}
          id="_path"
          value="value"
          cornerRadius={3}
          borderWidth={2}
          borderColor="white"
          colors={getColor}
          colorBy="id"
          inheritColorFromParent={false}
          childColor={{ from: 'color', modifiers: [] }}
          enableArcLabels={true}
          theme={{
            labels: {
              text: {
                fontSize: 18,
                fontWeight: 700,
                fill: '#1f2937',
                stroke: '#ffffff',
                strokeWidth: 3,
                paintOrder: 'stroke',
              }
            }
          }}
          arcLabel={(n) => {
            // Only label immediate children of the current center node
            if (n.depth !== 1) return '';

            const name = n.data?.name || n.id || '';
            const val = n.value || 0;

            // If it's a leaf node (Upreg/Downreg), show the count
            if (name === 'Upregulated' || name === 'Downregulated') {
              if (val > 0) return `${name} (${val.toLocaleString()})`;
            }

            // Otherwise (Species or Stress), just show the name
            return name;
          }}
          arcLabelsSkipAngle={drillNode ? 4 : 8}
          arcLabelsTextColor="#333333"
          arcLabelsRadiusOffset={0.55}
          onClick={handleClick}
          tooltip={({ id, value, color, data: d }) => (
            <div className="krona-tooltip">
              <div className="krona-tooltip-color" style={{ background: color }} />
              <div>
                <strong>{d?.name || id}</strong>
                <div className="krona-tooltip-value">{value.toLocaleString()} genes</div>
              </div>
            </div>
          )}
          layers={['arcs', 'arcLabels', 'arcLinkLabels', 'legends', ({ nodes, centerX, centerY }) => {
            const centerNode = nodes.find(node => node.depth === 0);
            if (!centerNode) return null;
            const name = centerNode.data?.name || centerNode.id;
            // Don't show center text at the very root
            if (name === 'MIMI-DB' || name === 'All Species') return null;

            return (
              <text
                x={centerX}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  fill: '#374151',
                  pointerEvents: 'none',
                  maxWidth: '100px'
                }}
              >
                {name.length > 15 ? name.substring(0, 15) + '...' : name}
              </text>
            );
          }]}
          animate={true}
          motionConfig="gentle"
          transitionMode="pushIn"
        />
      </div>

      <div className="krona-legend">
        <div className="krona-legend-item">
          <span className="krona-legend-dot" style={{ background: UPREG_COLOR }} />
          Upregulated
        </div>
        <div className="krona-legend-item">
          <span className="krona-legend-dot" style={{ background: DOWNREG_COLOR }} />
          Downregulated
        </div>
      </div>
    </div>
  );
}

function findNodeByPath(node, targetPath) {
  if (node._path === targetPath) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeByPath(child, targetPath);
      if (found) return found;
    }
  }
  return null;
}