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
      let url = new URL("/api/data", window.location.origin);
      let params = new URLSearchParams(url.search);
      params.append("aggcol", snap.aggCol);
      params.append("displaycol", snap.displayCol);
      url.search = params.toString();
      console.log(params.toString());

      const response = await fetch(url);
      const result = await response.json();
      console.log(result);
      state.setData(result);
    };
    fetchData();
  }, [snap]);

  const handleSelectionChange = (key) => (event) => {
    console.log(key, event.target.value);
    state.setStateValue(key, event.target.value);
  };

  const plotData = snap.data.map(d => ({
    type: 'box',
    name: d[snap.aggCol],
    y: [d.min, d.q1, d.median, d.q3, d.max]
  }));

  return (
    <main>
      <h1>CFTP Field Test Results Dashboard</h1>
      <div>
        <label htmlFor="columnSelect">Select Column:</label>
        <select id="columnSelect" value={snap.aggCol} onChange={handleSelectionChange('aggCol')}>
          <option value="Material Class I">Material Class I</option>
          <option value="Material Class II">Material Class II</option>
          <option value="Material Class III">Material Class III</option>
        </select>
        <label htmlFor="quartilesColumnSelect">Select Quartiles Column:</label>
        <select id="quartilesColumnSelect" value={snap.displayCol} onChange={handleSelectionChange('displayCol')}>
          <option value="% Residuals (Mass)">% Residuals (Mass)</option>
          <option value="% Residuals (Area)">% Residuals (Area)</option>
        </select>
      </div>
      <Plot
        data={plotData}
        layout={{ width: 800, height: 600, title: 'Decomposition Data' }}
      />
    </main>
  );
};

export default Home;