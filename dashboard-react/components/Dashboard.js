"use client";
import React from "react";
import Plot from "react-plotly.js";
import { useSnapshot } from "valtio";
import state from "@/lib/state";

export default function Dashboard() {
  const snap = useSnapshot(state);

  const class2color = {
    "Positive Control": "#70AD47",
    "Mixed Materials": "#48646A",
    Fiber: "#298FC2",
    Biopolymer: "#FFB600",
  };

  const plotData =
    Object.keys(snap.data).length > 0
      ? snap.data.map((d) => {
          console.log(d);
          const materialClass = d["Material Class I"];
          const color = class2color[materialClass] || "#000";
          return {
            type: "box",
            name: d["aggCol"],
            y: [d.min, d.q1, d.median, d.q3, d.max],
            marker: { color },
          };
        })
      : [];

  return (
    <div style={{ minWidth: "1000px" }}>
      {plotData.length > 0 ? (
        <Plot
          data={plotData}
          layout={{
            width: 1000,
            height: 700,
            title: "Decomposition Data",
            showlegend: false,
          }}
        />
      ) : (
        <p>Not enough data</p>
      )}
    </div>
  );
}
