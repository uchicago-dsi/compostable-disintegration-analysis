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
      params.append("aggcol", snap.filters.aggCol);
      params.append("displaycol", snap.filters.displayCol);
      params.append("testmethods", snap.filters.selectedTestMethods.join(","));
      url.search = params.toString();
      console.log(params.toString());

      const response = await fetch(url);
      const result = await response.json();
      console.log(result);
      state.setData(result);
    };
    fetchData();
  }, [snap.filters]);

  useEffect(() => {
    const fetchOptions = async () => {
      console.log("Fetching options...");
      const response = await fetch("/api/options");
      const result = await response.json();
      console.log(result);
      Object.keys(result).forEach(key => {
        state.setOptions(key, result[key]);
      });
    };
    fetchOptions();
  }, []);

  const handleSelectionChange = (key) => (event) => {
    console.log(key, event.target.value);
    state.setFilterValue(key, event.target.value);
  };

  const handleCheckboxChange = (key, value) => (event) => {
    const checked = event.target.checked;
    if (checked) {
      state.setFilterValue(key, [...snap.filters[key], value]);
    } else {
      state.setFilterValue(key, snap.filters[key].filter(item => item !== value));
    }
  };

  const plotData = snap.data.map(d => ({
    type: 'box',
    name: d[snap.filters.aggCol],
    y: [d.min, d.q1, d.median, d.q3, d.max]
  }));

  return (
    <main>
      <h1>CFTP Field Test Results Dashboard</h1>
      <div>
        <label htmlFor="columnSelect">Select Column:</label>
        <select id="columnSelect" value={snap.filters.aggCol} onChange={handleSelectionChange('aggCol')}>
          <option value="Material Class I">Material Class I</option>
          <option value="Material Class II">Material Class II</option>
          <option value="Material Class III">Material Class III</option>
        </select>
        <label htmlFor="displayColumnSelect">Select Display Column:</label>
        <select id="displayColumnSelect" value={snap.filters.displayCol} onChange={handleSelectionChange('displayCol')}>
          <option value="% Residuals (Mass)">% Residuals (Mass)</option>
          <option value="% Residuals (Area)">% Residuals (Area)</option>
        </select>
        <label>Select Test Methods:</label>
          {snap.options["Test Method"]?.map(value => (
            <div key={value}>
              <input
                type="checkbox"
                id={`testMethod-${value}`}
                value={value}
                checked={snap.filters.selectedTestMethods.includes(value)}
                onChange={handleCheckboxChange('selectedTestMethods', value)}
              />
              <label htmlFor={`testMethod-${value}`}>{value}</label>
            </div>
          ))}
      </div>
      <Plot
        data={plotData}
        layout={{ width: 800, height: 600, title: 'Decomposition Data' }}
      />
    </main>
  );
};

export default Home;