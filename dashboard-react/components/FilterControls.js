"use client";
import React, { useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import state from "@/lib/state";
import DropdownCheckbox from "@/components/DropdownCheckbox";
import DropdownSingleSelect from "@/components/DropdownSingleSelect";
import {
  moistureFilterDict,
  temperatureFilterDict,
  trialDurationDict,
  material2col,
  residuals2col,
  display2col,
} from "@/lib/constants";
import { closeOpenedDetails } from "@/lib/utils";
import { onSummaryClick } from "@/lib/utils";

export default function FilterControls() {
  const snap = useSnapshot(state);

  useEffect(() => {
    if (
      snap.options["Test Method"] &&
      snap.options["Material Class II"] &&
      snap.options["Technology"] &&
      state.filters.initialized === false
    ) {
      state.setFilterValue("selectedTestMethods", snap.options["Test Method"]);
      state.setFilterValue(
        "selectedMaterialTypes",
        snap.options["Material Class II"]
      );
      state.setFilterValue("selectedTechnologies", snap.options["Technology"]);
      state.setFilterValue("initialized", true);
    }
  }, [snap.options]);

  useEffect(() => {
    const summaries = document.querySelectorAll("summary");

    summaries.forEach((summary) => {
      summary.addEventListener("click", closeOpenedDetails);
    });

    function closeOpenedDetails() {
      summaries.forEach((summary) => {
        let detail = summary.parentNode;
        if (detail != this.parentNode) {
          detail.removeAttribute("open");
        }
      });
    }
  }, [snap.options]);

  // TODO: Don't actually want this here
  // const onSummaryClick = () => {
  //   closeOpenedDetails(`summary-testMethod`);
  // };
  const divRef = useRef(null);

  const handleSelectionChange = (key, value) => {
    console.log(key, value);
    state.setFilterValue(key, value);
  };

  if (!snap.filters.initialized) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="h-[100vh] overflow-y-auto">
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
        <div className="divider m-0"></div>
        <details className="dropdown">
          <summary
            className="btn m-1"
            onClick={onSummaryClick("testMethod")}
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
                  onClick={() => handleSelectionChange("testMethod", option)}
                >
                  {option}
                </a>
              </li>
            ))}
          </ul>
        </details>
        <div>
          {/* TODO: Make this look better... */}
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
              Note: There are some results by both mass or surface area with
              over 100% residuals. The dashboard automatically caps these
              results at 100% residuals (0% disintegration). Check this box to
              show all results, including over 100% Residuals. Disintegration
              results are always capped at 0% (no negative disintegration
              results)
            </i>
          </p>
        </div>
        <h2>Filters</h2>
        <DropdownCheckbox
          options={snap.options["Technology"]}
          selectedOptions={snap.filters.selectedTechnologies}
          filterKey="selectedTechnologies"
          title="Select Technology(ies)"
        />
        <DropdownCheckbox
          options={snap.options["Material Class II"]}
          selectedOptions={snap.filters.selectedMaterialTypes}
          filterKey="selectedMaterialTypes"
          title="Select Material Type(s)"
        />
        <h2>Operating Conditions Filters</h2>
        <DropdownCheckbox
          options={Object.keys(temperatureFilterDict)}
          selectedOptions={snap.filters.selectedTemperatureLevels}
          filterKey="selectedTemperatureLevels"
          title="Select Temperature Range(s)"
        />
        <DropdownCheckbox
          options={Object.keys(moistureFilterDict)}
          selectedOptions={snap.filters.selectedMoistureLevels}
          filterKey="selectedMoistureLevels"
          title="Select Moisture Content Range(s)"
        />
        <DropdownCheckbox
          options={Object.keys(trialDurationDict)}
          selectedOptions={snap.filters.selectedTrialDurations}
          filterKey="selectedTrialDurations"
          title="Select Trial Duration Range(s)"
        />
      </div>
    </>
  );
}
