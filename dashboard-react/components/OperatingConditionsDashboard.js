"use client";
import { csv } from "d3-fetch";
import { useEffect, useState } from "react";
import Plot from "react-plotly.js";

export default function OperatingConditionsDashboard({
  maxDays = 45,
  windowSize = 10,
}) {
  // Add windowSize as a prop
  const [dataLoaded, setDataLoaded] = useState(false);
  const [plotData, setPlotData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("Temperature");

  const metrics = ["Temperature", "% Moisture", "O2 in Field"];

  useEffect(() => {
    csv("/data/operating_conditions.csv")
      .then((data) => {
        const formattedData = [];

        const selectedColumn =
          selectedMetric === "Temperature"
            ? "Temperature"
            : selectedMetric === "% Moisture"
            ? "Moisture"
            : "Oxygen";

        const filteredData = data.filter(
          (d) => d["Operating Condition"] === selectedColumn
        );
        let timeSteps = filteredData.map((d) => d["Time Step"]);

        if (selectedMetric !== "Temperature") {
          timeSteps = timeSteps.map((d) => d * 7); // Convert weeks to days
        }

        const nonTrialColumns = [
          "Time Step",
          "Operating Condition",
          "Time Unit",
        ];

        const trialCount = {}; // Reset trial count each time data is processed

        Object.keys(data[0]).forEach((column) => {
          if (!nonTrialColumns.includes(column)) {
            let yData = data.map((d) => parseFloat(d[column]) || null);
            yData = interpolateData(yData);
            if (selectedMetric !== "Temperature") {
              windowSize = 3; // Reduce window size for non-temperature metrics
            }
            yData = movingAverage(yData, windowSize);
            const trialName = mapTrialName(column, trialCount);

            formattedData.push({
              x: timeSteps,
              y: yData,
              mode: "lines",
              name: trialName,
            });
          }
        });

        formattedData.sort((a, b) => a.name.localeCompare(b.name));
        setPlotData(formattedData);
        setDataLoaded(true);
      })
      .catch((error) => {
        console.error("Error loading CSV data:", error);
        setErrorMessage("Failed to load data.");
      });
  }, [windowSize, selectedMetric]);

  const mapTrialName = (trialName, trialCount) => {
    const mappings = {
      IV: "In-Vessel",
      CASP: "Covered Aerated Static Pile",
      WR: "Windrow",
      EASP: "Extended Aerated Static Pile",
      ASP: "Aerated Static Pile",
      AD: "Anaerobic Digestion",
    };

    // Extract the prefix (e.g., IV, CASP, etc.)
    const prefix = trialName.match(/^[A-Z]+/)[0];

    // Get the mapped name for the prefix
    const mappedName = mappings[prefix];

    if (mappedName) {
      // Initialize the count for this trial type if it doesn't exist
      if (!trialCount[mappedName]) {
        trialCount[mappedName] = 0;
      }
      // Increment the count for this trial type
      trialCount[mappedName] += 1;

      // Return the formatted name with the count
      return `${mappedName} #${trialCount[mappedName]}`;
    }

    return trialName; // Return the original trial name if the prefix is not recognized
  };

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
    return data.map((value, idx, arr) => {
      // Ignore null values
      if (value === null) return null;

      const start = Math.max(0, idx - Math.floor(windowSize / 2));
      const end = Math.min(arr.length, idx + Math.ceil(windowSize / 2));
      const window = arr.slice(start, end);
      const validNumbers = window.filter((n) => n !== null);

      if (validNumbers.length === 0) return null;

      const sum = validNumbers.reduce((acc, num) => acc + num, 0);
      return sum / validNumbers.length;
    });
  }

  const yAxisTitle = `${selectedMetric}`;

  const title = `${selectedMetric} Over Time`;

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
        <>
          <div className="flex justify-center my-4">
            <select
              className="select select-bordered"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              {metrics.map((metric) => (
                <option key={metric} value={metric}>
                  {metric}
                </option>
              ))}
            </select>
          </div>
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
                title: {
                  text: "<b>Days</b>",
                },
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
        </>
      )}
    </>
  );
}
