import { useState } from 'react';
import { ResponsiveSunburst } from '@nivo/sunburst';

export default function KronaChart({ data }) {
  const [currentNode, setCurrentNode] = useState(data);
  const [level, setLevel] = useState(0);

  if (!data) return null;

  return (
    <div className="krona-wrapper">

      <div className="krona-controls">
        <button onClick={() => {
  setCurrentNode(data);
  setLevel(0);
}}>
          Reset
        </button>
      </div>

      <div className="krona-chart">
        <ResponsiveSunburst
        
          data={currentNode}
          id="name"
          value="value"
          colors={{ scheme: 'category10' }}
          onClick={(node) => {
  const d = node.data;

  // LEVEL 1 → Species clicked
  if (level === 0 && d.children) {
    setCurrentNode(d);
    setLevel(1);
  }

  // LEVEL 2 → Stress clicked
  else if (level === 1 && d.children) {
    setCurrentNode(d);
    setLevel(2);
  }
}}
        />
      </div>

    </div>
  );
}