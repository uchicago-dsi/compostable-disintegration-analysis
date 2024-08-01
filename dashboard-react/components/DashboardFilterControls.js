"use client";
import CheckboxMenu from "@/components/CheckboxMenu";
import { useSnapshot } from "valtio";
import state from "@/lib/state";
import {
  moistureFilterDict,
  temperatureFilterDict,
  trialDurationDict,
} from "@/lib/constants";
export default function DashboardFilterControls() {
  const snap = useSnapshot(state);

  return (
    <div className="flex flex-col">
      <div className="flex-1 mx-2 w-full md:w-1/2 min-h-[300px]">
        <h2 className="text-center">Filters</h2>
        <div className="flex flex-row">
          <CheckboxMenu
            options={snap.options["Technology"]}
            selectedOptions={snap.filters.selectedTechnologies}
            filterKey="selectedTechnologies"
            title="Select Technology(ies)"
          />
          <CheckboxMenu
            options={snap.options["Material Class II"]}
            selectedOptions={snap.filters.selectedMaterialTypes}
            filterKey="selectedMaterialTypes"
            title="Select Material Type(s)"
          />
        </div>
      </div>
      <div className="flex-1 mx-2 w-full lg:w-1/2">
        <h2 className="text-center">Operating Conditions Filters</h2>
        <div className="flex flex-row">
          <CheckboxMenu
            options={Object.keys(temperatureFilterDict)}
            selectedOptions={snap.filters.selectedTemperatureLevels}
            filterKey="selectedTemperatureLevels"
            title="Select Temperature Range(s)"
          />
          <CheckboxMenu
            options={Object.keys(moistureFilterDict)}
            selectedOptions={snap.filters.selectedMoistureLevels}
            filterKey="selectedMoistureLevels"
            title="Select Moisture Content Range(s)"
          />
          <CheckboxMenu
            options={Object.keys(trialDurationDict)}
            selectedOptions={snap.filters.selectedTrialDurations}
            filterKey="selectedTrialDurations"
            title="Select Trial Duration Range(s)"
          />
        </div>
      </div>
    </div>
  );
}
