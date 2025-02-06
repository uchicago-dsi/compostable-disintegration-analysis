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

    const useTestData = window.location.pathname.includes("test");
    const fetchOptions = async () => {
      const response = await fetch("/api/options",
        {
          headers: {
            "use-test-data": useTestData
          }
        }
      );
      const result = await response.json();
      Object.keys(result).forEach((key) => {
        state.setOptions(key, result[key]);
      });
    };
    fetchOptions();
  }, []);

  return (
    <main className="flex flex-col items-start">
      <div className="w-full">
        <div className="mx-auto mb-3">
          <Dashboard />
        </div>
        <div className="mx-auto w-full">
          <DashboardControls />
        </div>
      </div>
    </main>
  );
};

export default Home;
