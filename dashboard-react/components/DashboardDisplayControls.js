"use client";
import React, { useRef } from "react";
import DropdownSingleSelect from "@/components/DropdownSingleSelect";
import { onSummaryClick, handleSingleSelectChange } from "@/lib/utils";
import { material2col, residuals2col, display2col } from "@/lib/constants";
import { useSnapshot } from "valtio";
import state from "@/lib/state";

export default function DashboardDisplayControls() {
  const snap = useSnapshot(state);
  // TODO: Don't actually want this here
  const divRef = useRef(null);

  return (
    <>
      <h2>Display Options</h2>
      <DropdownSingleSelect
        options={material2col}
        title="Select x-axis Display:"
        filterKey="aggCol"
      />
      <DropdownSingleSelect
        options={display2col}
        title="Show Results by Mass or by Surface Area:"
        filterKey="displayCol"
      />
      <DropdownSingleSelect
        options={residuals2col}
        title="Show by Residuals Remaining or by Percent Disintegrated:"
        filterKey="displayResiduals"
      />
      <h2>Select Test Method</h2>
      <details className="dropdown">
        <summary
          className="btn m-1"
          onClick={() => onSummaryClick("testMethod")}
          ref={divRef}
          id={`summary-testMethod`}
        >
          {snap.filters.testMethod}
        </summary>
        <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          {snap.options["Test Method"]?.map((option) => (
            <li key={option}>
              <a
                id={`option-${option}`}
                onClick={() => handleSingleSelectChange("testMethod", option)}
              >
                {option}
              </a>
            </li>
          ))}
        </ul>
      </details>
      <div>
        <label htmlFor="capResults">
          Show results with over 100% residuals remaining:
        </label>
        <input
          type="checkbox"
          id="capResults"
          checked={snap.filters.uncapResults}
          onChange={() =>
            state.setFilterValue("uncapResults", !snap.filters.uncapResults)
          }
        />
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
