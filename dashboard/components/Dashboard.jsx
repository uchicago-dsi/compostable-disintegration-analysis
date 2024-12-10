"use client";
import Alert from "@/components/Alert";
import { col2material } from "@/lib/constants";
import state from "@/lib/state";
import Plot from "react-plotly.js";
import { useSnapshot } from "valtio";
import {ParentSize} from "@visx/responsive";
import BoxPlot from "./BoxPlot";

export default function Dashboard() {
  const snap = useSnapshot(state);

  if (!snap.dataLoaded) {
    return (
      <div className="m-5">
        <p>Loading data...</p>
      </div>
    );
  }



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

  // const cleanDisplayCol = snap.filters.displayResiduals === "Disintegrated"
  //   ? snap.filters.displayCol.replace("Residuals", "Disintegrated")
  //   : snap.filters.displayCol

  // function generateYAxisTitle(displayCol, cap) {
  //   let yAxisTitle = `${displayCol}`;
  //   if (cap) {
  //     yAxisTitle += " Capped";
  //   }
  //   return yAxisTitle;
  // }
  // const yAxisTitle = generateYAxisTitle(
  //   cleanDisplayCol,
  //   !snap.filters.uncapResults
  // );



  // function generateTitle(cleanDisplayCol, aggCol, num_trial) {
  //   return `${cleanDisplayCol} by ${col2material[aggCol]} - ${num_trial} Trial(s)`;
  // }


  // const title = generateTitle(
  //   cleanDisplayCol,
  //   snap.filters.aggCol,
  //   snap.data.numTrials
  // );

  // const yMax =
  //   snap.data.data && snap.data.data.length > 0
  //     ? Math.max(...snap.data.data.map((d) => d.max + 0.05), 1.05)
  //     : 1.05;

  // const xTickAngle = plotData.length > 6 ? 90 : 0;
  // console.log("plotData", plotData);
  return (
    <>
      {snap.errorMessage ? (
        <div className="flex items-center justify-center h-full mx-[200px]">
          <p>
            <Alert message={snap.errorMessage} />
          </p>
        </div>
      ) : (
        <BoxPlot
          data={snap.data.data}
          minWidth={600}
          minHeight={400}
          // yMax={yMax}
          // title={title}
          // yAxisTitle={yAxisTitle}
          // xTickAngle={xTickAngle}
          />
        // <Plot
        //   data={plotData}
        //   layout={{
        //     width: 1280,
        //     height: 600,
        //     title: {
        //       text: `<b>${title}</b>`,
        //       x: 0.5,
        //       xanchor: "center",
        //       yanchor: "top",
        //     },
        //     showlegend: false,
        //     yaxis: {
        //       title: {
        //         text: `<b>${yAxisTitle}</b>`,
        //       },
        //       tickformat: ".0%",
        //       range: [0, yMax],
        //     },
        //     xaxis: {
        //       tickangle: xTickAngle,
        //       ticklen: 10,
        //       automargin: true,
        //       tickfont: {
        //         weight: "bold",
        //       },
        //     },
        //     hovermode: "x",
        //   }}
        //   config={{
        //     displayModeBar: false,
        //   }}
        // />
      )}
    </>
  );
}
