"use client";
import React from "react";
import Plot from "react-plotly.js";
import { useSnapshot } from "valtio";
import state from "@/lib/state";
import { col2material } from "@/lib/constants";

export default function Dashboard() {
  const snap = useSnapshot(state);

  if (!snap.data.data) {
    return <p>Loading data...</p>;
  }

  const class2color = {
    "Positive Control": "#70AD47",
    "Mixed Materials": "#48646A",
    Fiber: "#298FC2",
    Biopolymer: "#FFB600",
  };

  const plotData =
    Object.keys(snap.data).length > 0
      ? snap.data.data.map((d) => {
          console.log(d);
          const materialClass = d["Material Class I"];
          const color = class2color[materialClass] || "#000";
          const countDisplay =
            snap.filters["testMethod"] === "Mesh Bag"
              ? ` (n=${d["count"]})`
              : "";
          return {
            type: "box",
            name: `${d["aggCol"]}${countDisplay}`,
            y: [d.min, d.q1, d.median, d.q3, d.max],
            marker: { color },
            boxmean: true,
          };
        })
      : [];

  function generateYAxisTitle(displayCol, cap) {
    let yAxisTitle = `${displayCol}`;
    if (cap) {
      yAxisTitle += " Capped";
    }
    return yAxisTitle;
  }
  const yAxisTitle = generateYAxisTitle(
    snap.filters.displayCol,
    !snap.filters.uncapResults
  );

  function generateTitle(displayCol, aggCol, num_trials) {
    return `${displayCol} by ${col2material[aggCol]} - ${num_trials} Trial(s)`;
  }

  const title = generateTitle(
    snap.filters.displayCol,
    snap.filters.aggCol,
    snap.data.numTrials
  );

  const yMax = Math.max(...snap.data.data.map((d) => d.max), 1);

  return (
    <div style={{ minWidth: "1000px" }}>
      {plotData.length > 0 ? (
        <Plot
          data={plotData}
          layout={{
            width: 1000,
            height: 700,
            title: {
              text: title,
              x: 0.5,
              xanchor: "center",
              yanchor: "top",
            },
            showlegend: false,
            yaxis: {
              title: {
                text: yAxisTitle,
              },
              tickformat: ".0%",
              range: [0, yMax],
            },
          }}
          config={{
            displayModeBar: false,
          }}
        />
      ) : (
        // TODO: make this a more user friendly error message
        <p>Not enough data for the selected criteria</p>
      )}
    </div>
  );
}
