"use client";
import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { csv } from "d3-fetch";

export default function OperatingConditionsDashboard({
  maxDays = 45,
  windowSize = 10,
}) {
  // Add windowSize as a prop
  const [dataLoaded, setDataLoaded] = useState(false);
  const [plotData, setPlotData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    csv("/data/temperature_data.csv")
      .then((data) => {
        const formattedData = [];
        const days = data.map((d) => d["Day #"]);

        Object.keys(data[0]).forEach((column) => {
          if (column !== "Day #") {
            let yData = data.map((d) => parseFloat(d[column]) || null);
            yData = interpolateData(yData); // Perform interpolation
            yData = movingAverage(yData, windowSize); // Smooth using moving average

            formattedData.push({
              x: days,
              y: yData,
              mode: "lines",
              name: column,
            });
          }
        });

        setPlotData(formattedData);
        setDataLoaded(true);
      })
      .catch((error) => {
        console.error("Error loading CSV data:", error);
        setErrorMessage("Failed to load data.");
      });
  }, [windowSize]);

  // Linear interpolation function
  function interpolateData(yData) {
    let lastValidIndex = null;

    for (let i = 0; i < yData.length; i++) {
      if (yData[i] === null) {
        // Find the next valid index
        const nextValidIndex = yData.slice(i).findIndex((v) => v !== null) + i;

        if (lastValidIndex !== null && nextValidIndex < yData.length) {
          // Interpolate between the last valid and next valid index
          const slope =
            (yData[nextValidIndex] - yData[lastValidIndex]) /
            (nextValidIndex - lastValidIndex);
          yData[i] = yData[lastValidIndex] + slope * (i - lastValidIndex);
        }
      } else {
        lastValidIndex = i;
      }
    }

    return yData;
  }

  // Moving average function
  function movingAverage(data, windowSize) {
    return data.map((_, idx, arr) => {
      const start = Math.max(0, idx - Math.floor(windowSize / 2));
      const end = Math.min(arr.length, idx + Math.ceil(windowSize / 2));
      const window = arr.slice(start, end);
      const validNumbers = window.filter((n) => n !== null); // Ignore nulls
      const sum = validNumbers.reduce((acc, num) => acc + num, 0);
      return validNumbers.length > 0 ? sum / validNumbers.length : null;
    });
  }

  const yAxisTitle = "Temperature";

  const title = "Temperature Over Time";

  const yMax =
    plotData.length > 0
      ? Math.max(...plotData.flatMap((d) => d.y.map((y) => y + 0.05)), 1.05)
      : 1.05;

  const xTickAngle = plotData.length > 6 ? 90 : 0;

  return (
    <>
      {errorMessage ? (
        <div className="flex items-center justify-center h-full mx-[200px]">
          <p>{errorMessage}</p>
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
            showlegend: true,
            yaxis: {
              title: {
                text: `<b>${yAxisTitle}</b>`,
              },
              range: [0, yMax],
            },
            xaxis: {
              tickangle: xTickAngle,
              ticklen: 10,
              automargin: true,
              range: [0, maxDays], // Cap x-axis at maxDays
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
