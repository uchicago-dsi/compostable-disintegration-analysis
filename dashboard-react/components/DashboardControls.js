"use client";
import React, { useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import state from "@/lib/state";
import DashboardDisplayControls from "@/components/DashboardDisplayControls";
import DashboardFilterControls from "@/components/DashboardFilterControls";

export default function DashboardControls() {
  const snap = useSnapshot(state);

  useEffect(() => {
    if (
      snap.options["Test Method"] &&
      snap.options["Material Class II"] &&
      snap.options["Technology"] &&
      state.filters.initialized === false
    ) {
      state.setFilterValue("selectedTestMethods", snap.options["Test Method"]);
      state.setFilterValue(
        "selectedMaterialTypes",
        snap.options["Material Class II"]
      );
      state.setFilterValue("selectedTechnologies", snap.options["Technology"]);
      state.setFilterValue("initialized", true);
    }
  }, [snap.options]);

  useEffect(() => {
    const summaries = document.querySelectorAll("summary");

    summaries.forEach((summary) => {
      summary.addEventListener("click", closeOpenedDetails);
    });

    function closeOpenedDetails() {
      summaries.forEach((summary) => {
        let detail = summary.parentNode;
        if (detail != this.parentNode) {
          detail.removeAttribute("open");
        }
      });
    }
  }, [snap.options]);

  if (!snap.filters.initialized) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-row h-[100vh] overflow-y-auto px-2">
      <div className="m-2 w-1/3">
        <DashboardDisplayControls />
      </div>
      <div className="m-2 w-2/3">
        <DashboardFilterControls />
      </div>
    </div>
  );
}
