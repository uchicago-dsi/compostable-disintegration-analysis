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
    Object.keys(snap.data.data).length > 0
      ? snap.data.data.map((d) => {
          console.log(d);
          const materialClass = d["Material Class I"];
          const color = class2color[materialClass] || "#000";
          return {
            type: "box",
            name: `${d["aggCol"]} (n=${d["count"]})`,
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
    return `${displayCol} by ${aggCol} - ${num_trials} Trial(s)`;
  }

  const title = generateTitle(
    snap.filters.displayCol,
    snap.filters.aggCol,
    snap.data.numTrials
  );

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
            },
          }}
        />
      ) : (
        <p>Not enough data for the selected criteria</p>
      )}
    </div>
  );
}
