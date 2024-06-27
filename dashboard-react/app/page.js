"use client";
import React, { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import Plot from 'react-plotly.js';
import state from '@/lib/state';

const Home = () => {
  const snap = useSnapshot(state);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data...");
      const response = await fetch(`/api/data?aggcol=${snap.aggCol}`);
      const result = await response.json();
      console.log(result);
      state.setData(result);
    };
    fetchData();
  }, [snap.aggCol]);

  const handleColumnChange = (event) => {
    console.log("Changing column...");
    console.log(event.target.value);
    state.setSelectedColumn(event.target.value);
  };

  const plotData = snap.data.map(d => ({
    type: 'box',
    name: d[snap.aggCol],
    y: [d.min, d.q1, d.median, d.q3, d.max]
  }));

  return (
    <main>
      <h1>Box Plot</h1>
      <div>
        <label htmlFor="columnSelect">Select Column:</label>
        <select id="columnSelect" value={snap.aggCol} onChange={handleColumnChange}>
          <option value="Material Class I">Material Class I</option>
          <option value="Material Class II">Material Class II</option>
          <option value="Material Class III">Material Class III</option>
        </select>
      </div>
      <Plot
        data={plotData}
        layout={{ width: 800, height: 600, title: 'Box Plot' }}
      />
    </main>
  );
};

export default Home;