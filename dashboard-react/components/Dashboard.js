"use client";
import React from "react";
import Plot from "react-plotly.js";
import { useSnapshot } from "valtio";
import state from "@/lib/state";
import { col2material } from "@/lib/constants";
import Alert from "@/components/Alert";

export default function Dashboard() {
  const snap = useSnapshot(state);

  if (!snap.dataLoaded) {
    return (
      <div className="m-5">
        <p>Loading data...</p>
      </div>
    );
  }

  const class2color = {
    "Positive Control": "#70AD47",
    "Mixed Materials": "#48646A",
    Fiber: "#298FC2",
    Biopolymer: "#FFB600",
  };

  const maxLabelLength = 30;

  function wrapLabel(label) {
    const words = label.split(" ");
    let wrappedLabel = "";
    let line = "";

    for (const word of words) {
      if ((line + word).length > maxLabelLength) {
        wrappedLabel += line + "<br>";
        line = word + " ";
      } else {
        line += word + " ";
      }
    }
    wrappedLabel += line.trim(); // Add the last line

    return wrappedLabel.trim();
  }

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
          // Replace "Positive" with "Pos." in labels and append count
          const name = `${d["aggCol"]}${countDisplay}`.replace(
            "Positive",
            "Pos."
          );
          const wrappedName = wrapLabel(name);

          return {
            type: "box",
            name: wrappedName,
            y: [d.min, d.q1, d.median, d.q3, d.max],
            marker: { color },
            boxmean: true,
            line: { width: 3.25 },
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

  const yMax =
    snap.data.data && snap.data.data.length > 0
      ? Math.max(...snap.data.data.map((d) => d.max + 0.05), 1.05)
      : 1.05;

  const xTickAngle = plotData.length > 6 ? 90 : 0;

  return (
    <>
      {snap.errorMessage ? (
        <div className="flex items-center justify-center h-full mx-[200px]">
          <p>
            <Alert message={snap.errorMessage} />
          </p>
        </div>
      ) : (
        <Plot
          data={plotData}
          layout={{
            width: 1280,
            height: 600,
            title: {
              text: `<b>${title}</b>`,
              x: 0.5,
              xanchor: "center",
              yanchor: "top",
            },
            showlegend: false,
            yaxis: {
              title: {
                text: `<b>${yAxisTitle}</b>`,
              },
              tickformat: ".0%",
              range: [0, yMax],
            },
            xaxis: {
              tickangle: xTickAngle,
              ticklen: 10,
              automargin: true,
              tickfont: {
                weight: "bold",
              },
            },
            hovermode: "x",
          }}
          config={{
            displayModeBar: false,
          }}
        />
      )}
    </>
  );
}
