"use client";
import React, { useRef } from "react";
import DropdownSingleSelect from "@/components/DropdownSingleSelect";
import RadioSingleSelect from "./RadioSingleSelect";
import { onSummaryClick, handleSingleSelectChange } from "@/lib/utils";
import { material2col, residuals2col, display2col } from "@/lib/constants";
import { useSnapshot } from "valtio";
import state from "@/lib/state";

export default function DashboardDisplayControls() {
  const snap = useSnapshot(state);

  return (
    <>
      <h2>Display Options</h2>
      <RadioSingleSelect
        options={material2col}
        title="Select x-axis Display:"
        filterKey="aggCol"
      />
      <RadioSingleSelect
        options={display2col}
        title="Show Results by Mass or by Surface Area:"
        filterKey="displayCol"
      />
      <RadioSingleSelect
        options={residuals2col}
        title="Show by Residuals Remaining or by Percent Disintegrated:"
        filterKey="displayResiduals"
      />
      <RadioSingleSelect
        options={{ "Mesh Bag": "Mesh Bag", "Bulk Dose": "Bulk Dose" }}
        title="Select Test Method:"
        filterKey="testMethod"
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
        <p>
          <i>
            Note: There are some results by both mass or surface area with over
            100% residuals. The dashboard automatically caps these results at
            100% residuals (0% disintegration). Check this box to show all
            results, including over 100% Residuals. Disintegration results are
            always capped at 0% (no negative disintegration results)
          </i>
        </p>
      </div>
    </>
  );
}
