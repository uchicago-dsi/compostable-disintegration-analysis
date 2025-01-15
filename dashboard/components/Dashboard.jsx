"use client";
import Alert from "@/components/Alert";
import { col2material } from "@/lib/constants";
import state from "@/lib/state";
import { useSnapshot } from "valtio";
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

  const cleanDisplayCol =
    snap.filters.displayResiduals === "Disintegrated"
      ? snap.filters.displayCol.replace("Residuals", "Disintegrated")
      : snap.filters.displayCol;
  const yAxisTitle = `${cleanDisplayCol}${
    snap.filters.uncapResults ? "" : " Capped"
  }`;
  return (
    <>
      {snap.errorMessage ? (
        <div className="flex items-center justify-center h-full mx-[200px]">
          <p>
            <Alert message={snap.errorMessage} />
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-4">
          <h1 className="text-2xl font-bold">
            {cleanDisplayCol} by {col2material[snap.filters.aggCol]} -{" "}
            {snap.data.numTrials} Trial(s)
          </h1>
          <div className="relative w-full pb-12" style={{height: '720px'}}>
            <BoxPlot
              data={snap.data.data}
              minWidth={600}
              minHeight={400}
              // yMax={yMax}
              // title={title}
              yAxisTitle={yAxisTitle}
            />
          </div>
        </div>
      )}
    </>
  );
}
