// PlotComponent.js
"use client";
import React from 'react';
import Plot from 'react-plotly.js';
import { useSnapshot } from 'valtio';
import state from '@/lib/state';

const Dashboard = () => {
  const snap = useSnapshot(state);

  const plotData = Object.keys(snap.data).length > 0 ? snap.data.map(d => ({
    type: 'box',
    name: d["aggCol"],
    y: [d.min, d.q1, d.median, d.q3, d.max]
  })) : [];

  return (
    <div style={{ minWidth: '1000px' }}>
      {plotData.length > 0 ? (
        <Plot
          data={plotData}
          layout={{ width: 1000, height: 700, title: 'Decomposition Data', showlegend: false }}
        />
      ) : (
        <p>Not enough data</p>
      )}
    </div>
  );
};

export default Dashboard;