"use client";
import React, { useEffect } from "react";
import state from "@/lib/state";
import dynamic from "next/dynamic";
import FilterControls from "@/components/FilterControls";

const Dashboard = dynamic(() => import("@/components/Dashboard"), {
  ssr: false,
});

const Home = () => {
  // Document this better — kind of confusing cuz this is what gets the options for the menus
  // TODO: Is there a way to do this only on first load in state.js with Valtio?
  useEffect(() => {
    const fetchOptions = async () => {
      const response = await fetch("/api/options");
      const result = await response.json();
      Object.keys(result).forEach((key) => {
        state.setOptions(key, result[key]);
      });
    };
    fetchOptions();
  }, []);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      <div style={{ marginRight: "20px" }}>
        <FilterControls />
      </div>
      <div style={{ minWidth: "1000px" }}>
        <h1>CFTP Field Test Results Dashboard</h1>
        <Dashboard />
      </div>
    </main>
  );
};

export default Home;
