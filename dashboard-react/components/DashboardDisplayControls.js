"use client";
import React from "react";
import RadioSingleSelect from "./RadioSingleSelect";
import { material2col, residuals2col, display2col } from "@/lib/constants";
import { useSnapshot } from "valtio";
import state from "@/lib/state";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

export default function DashboardDisplayControls() {
  const snap = useSnapshot(state);

  return (
    <>
      <div className="flex justify-center">
        <h2>Display Options</h2>
      </div>
      <RadioSingleSelect
        options={{ "Mesh Bag": "Mesh Bag", "Bulk Dose": "Bulk Dose" }}
        title="Select Test Method"
        filterKey="testMethod"
        infoText="Choose to see results from either of the two methods for field testing: the mesh bag method, where items are contained in a bag, or bulk dose, where items are loosely loaded into a pile. Results from these two methods are shown separately."
      />
      <RadioSingleSelect
        options={display2col}
        title="Show Results by Mass or by Surface Area"
        filterKey="displayCol"
        infoText="Disintegration data can be based on the change in weight of a product, or the surface area before and after testing."
      />
      <RadioSingleSelect
        options={material2col}
        title="Select X-Axis Display"
        filterKey="aggCol"
        infoText="Change the categories the data is grouped by on the X-axis."
      />
      <RadioSingleSelect
        options={residuals2col}
        title="Show by % Residuals Remaining or % Disintegrated"
        filterKey="displayResiduals"
        infoText="Disintegration data can be shown either of these two ways. % Residuals remaining is the inverse of % disintegrated."
      />
      <div>
        <input
          type="checkbox"
          id="capResults"
          className="mr-2"
          checked={snap.filters.uncapResults}
          onChange={() =>
            state.setFilterValue("uncapResults", !snap.filters.uncapResults)
          }
        />
        <label htmlFor="capResults">
          Show results with over 100% residuals remaining
        </label>
        <div
          className="tooltip tooltip-primary tooltip-bottom ml-2 inline-flex"
          data-tip="The dashboard automatically caps results at 100% residuals. Click
            this checkbox to see uncapped data."
        >
          <span className="cursor-pointer text-primary">
            <InformationCircleIcon className="h-5 w-5 text-primary" />
          </span>
        </div>
      </div>
    </>
  );
}
