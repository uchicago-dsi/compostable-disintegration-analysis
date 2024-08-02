"use client";
import React, { useEffect } from "react";
import state from "@/lib/state";
import dynamic from "next/dynamic";
import DashboardControls from "@/components/DashboardControls";

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
    <main className="flex flex-col items-start h-[1300px] overflow-hidden">
      <div className="max-w-[1440px] h-[600px] overflow-hidden">
        <Dashboard />
      </div>
      <div className="max-w-[1440px] h-[700px]">
        <DashboardControls />
      </div>
    </main>
  );
};

export default Home;
