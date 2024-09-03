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
  const [ignoreMaxDays, setIgnoreMaxDays] = useState(false);
  const [applyMovingAverage, setApplyMovingAverage] = useState(true);

  const metrics = ["Temperature", "% Moisture", "O2 in Field"];

  const [effectiveMaxDays, setEffectiveMaxDays] = useState(maxDays);

  useEffect(() => {
    csv("/data/operating_conditions.csv")
      .then((data) => {
        const formattedData = [];
        const selectedColumn =
          selectedMetric === "Temperature"
            ? "Temperature"
            : selectedMetric === "% Moisture"
            ? "Moisture"
            : selectedMetric === "O2 in Field"
            ? "Oxygen"
            : null;

        const filteredData = data.filter(
          (d) => d["Operating Condition"] === selectedColumn
        );

        console.log("Filtered Data:", filteredData);

        let timeSteps = filteredData.map((d) => d["Time Step"]);
        if (selectedMetric !== "Temperature") {
          timeSteps = timeSteps.map((d) => d * 7); // Convert weeks to days
        }

        const maxDaysFromData = Math.max(...timeSteps);
        const calculatedEffectiveMaxDays = ignoreMaxDays
          ? maxDaysFromData
          : Math.min(maxDays, maxDaysFromData);

        setEffectiveMaxDays(calculatedEffectiveMaxDays); // Update state

        const nonTrialColumns = [
          "Time Step",
          "Operating Condition",
          "Time Unit",
        ];

        const trialCount = {}; // Reset trial count each time data is processed

        Object.keys(data[0]).forEach((column) => {
          if (!nonTrialColumns.includes(column)) {
            let yData = filteredData.map((d) => parseFloat(d[column]) || null);
            yData = interpolateData(yData);
            if (selectedMetric !== "Temperature") {
              windowSize = 3; // Reduce window size for non-temperature metrics
            }
            if (applyMovingAverage) {
              yData = movingAverage(yData, windowSize);
            }
            const trialName = mapTrialName(column, trialCount);

            formattedData.push({
              x: timeSteps,
              y: yData,
              mode: "lines+markers",
              name: trialName,
            });
          }
        });

        if (selectedMetric === "Temperature") {
          formattedData.push({
            x: [0, 45],
            y: [131, 131],
            mode: "lines",
            name: "PFRP",
            line: {
              dash: "dot",
              color: "red",
              width: 2,
            },
          });
        }

        formattedData.sort((a, b) => a.name.localeCompare(b.name));
        setPlotData(formattedData);
        setDataLoaded(true);
      })
      .catch((error) => {
        console.error("Error loading CSV data:", error);
        setErrorMessage("Failed to load data.");
      });
  }, [windowSize, selectedMetric, ignoreMaxDays, applyMovingAverage]);

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
      ? Math.max(...plotData.flatMap((d) => d.y.map((y) => y + 0.05)))
      : null;

  const xTickAngle = plotData.length > 6 ? 90 : 0;

  return (
    <>
      {errorMessage ? (
        <div className="flex items-center justify-center h-full mx-[200px]">
          <p>{errorMessage}</p>
        </div>
      ) : (
        <>
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
                showline: true,
              },
              xaxis: {
                title: {
                  text: "<b>Days</b>",
                },
                tickangle: xTickAngle,
                ticklen: 10,
                automargin: true,
                range: [0, effectiveMaxDays],
                // range: ignoreMaxDays ? null : [0, effectiveMaxDays],
                showline: true,
              },
              hovermode: "x",
            }}
            config={{
              displayModeBar: false,
            }}
          />
          <div className="flex justify-center my-4">
            <div className="w-1/3 flex justify-center">
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
            <div className="w-1/3 flex justify-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={!ignoreMaxDays}
                  onChange={(e) => setIgnoreMaxDays(!e.target.checked)}
                />
                <span className="ml-2">Cap at 45 Days</span>
              </label>
            </div>
            <div className="w-1/3 flex justify-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={!applyMovingAverage}
                  onChange={(e) => setApplyMovingAverage(!e.target.checked)}
                />
                <span className="ml-2">
                  Display Raw Data (No Moving Average)
                </span>
              </label>
            </div>
          </div>
        </>
      )}
    </>
  );
}
