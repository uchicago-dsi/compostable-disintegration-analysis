"use client";
import React, { useEffect } from "react";
import state from "@/lib/state";
import dynamic from "next/dynamic";
import DashboardControls from "@/components/DashboardControls";

const Dashboard = dynamic(() => import("@/components/Dashboard.jsx"), {
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
    <main className="flex flex-col items-start">
      <div className="block lg:hidden p-2 h-[100vh] flex items-center align-center justify-center">
        Please use a device that is at least 1280 pixels wide to view the
        disintegration dashboard.
      </div>
      <div className="hidden lg:block h-[1300px] w-[1280px] overflow-hidden">
        <div className="h-[600px] mx-auto mb-3">
          <Dashboard />
        </div>
        <div className="h-[700px] mx-auto w-full">
          <DashboardControls />
        </div>
      </div>
    </main>
  );
};

export default Home;
