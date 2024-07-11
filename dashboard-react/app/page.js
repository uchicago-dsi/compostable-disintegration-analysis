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
    <main className="flex flex-row items-start">
      <div className="mr-5">
        <DashboardControls />
      </div>
      <div className="min-w-[1000px] pr-10">
        <Dashboard />
      </div>
    </main>
  );
};

export default Home;
