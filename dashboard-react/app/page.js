"use client";
import React, { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import state from '@/lib/state';
import FilterControls from '@/components/FilterControls';
import Dashboard from '@/components/Dashboard';

const Home = () => {
  const snap = useSnapshot(state);

  useEffect(() => {
    const fetchData = async () => {
      let url = new URL("/api/data", window.location.origin);
      let params = new URLSearchParams(url.search);
      // Display options
      params.append("aggcol", snap.filters.aggCol);
      params.append("displaycol", snap.filters.displayCol);
      params.append("uncapresults", snap.filters.uncapResults);
      params.append("displayresiduals", snap.filters.displayResiduals === "Residuals" ? true : false);
      // Trial & item filters
      params.append("testmethods", snap.filters.selectedTestMethods.join(","));
      params.append("technologies", snap.filters.selectedTechnologies.join(","));
      params.append("materials", snap.filters.selectedMaterialTypes.join(","));
      // Operating conditions filters
      params.append("temperature", snap.filters.selectedTemperatureLevels.join(","));
      params.append("moisture", snap.filters.selectedMoistureLevels.join(","));
      params.append("trialdurations", snap.filters.selectedTrialDurations.join(","));

      url.search = params.toString();
      console.log(params.toString());

      try {
        const response = await fetch(url);
        const result = await response.json();
        state.setData(result);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [snap.filters]);

  // Document this better — kind of confusing cuz this is what gets the options for the menus
  useEffect(() => {
    const fetchOptions = async () => {
      const response = await fetch("/api/options");
      const result = await response.json();
      Object.keys(result).forEach(key => {
        state.setOptions(key, result[key]);
      });
    };
    fetchOptions();
  }, []);

  return (
    <main style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
      <div style={{ marginRight: '20px' }}>
        <FilterControls />
      </div>
      <div style={{ minWidth: '1000px' }}>
      <h1>CFTP Field Test Results Dashboard</h1>
        <Dashboard />
      </div>
    </main>
  );
};


export default Home;