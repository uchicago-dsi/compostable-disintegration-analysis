"use client";
import React, { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import Plot from 'react-plotly.js';
import state from '@/lib/state';
import FilterControls from '@/components/FilterControls';

const Home = () => {
  const snap = useSnapshot(state);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data...");
      let url = new URL("/api/data", window.location.origin);
      let params = new URLSearchParams(url.search);
      // Display params
      params.append("aggcol", snap.filters.aggCol);
      params.append("displaycol", snap.filters.displayCol);
      params.append("uncapresults", snap.filters.uncapResults);
      // Filtering params
      params.append("testmethods", snap.filters.selectedTestMethods.join(","));
      params.append("temperature", snap.filters.selectedTemperatureLevels.join(","));
      params.append("moisture", snap.filters.selectedMoistureLevels.join(","));
      params.append("trialdurations", snap.filters.selectedTrialDurations.join(","));

      url.search = params.toString();
      console.log(params.toString());

      const response = await fetch(url);
      const result = await response.json();
      // console.log(result);
      state.setData(result);
    };
    fetchData();
  }, [snap.filters]);

  // Document this better — kind of confusing cuz this is what gets the options for the menus
  useEffect(() => {
    const fetchOptions = async () => {
      // console.log("Fetching options..."); 
      const response = await fetch("/api/options");
      const result = await response.json();
      // console.log(result);
      Object.keys(result).forEach(key => {
        state.setOptions(key, result[key]);
      });
    };
    fetchOptions();
  }, []);

  const plotData = snap.data.map(d => ({
    type: 'box',
    name: d["aggCol"],
    y: [d.min, d.q1, d.median, d.q3, d.max]
  }));

  return (
    <main style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
      <div style={{ marginRight: '20px' }}>
        <FilterControls />
      </div>
      <div>
        <h1>CFTP Field Test Results Dashboard</h1>
        <Plot
          data={plotData}
          layout={{ width: 1000, height: 700, title: 'Decomposition Data', showlegend: false }}
        />
      </div>
    </main>
  );
};


export default Home;