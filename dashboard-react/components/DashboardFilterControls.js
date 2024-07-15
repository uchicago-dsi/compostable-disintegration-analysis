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
    <div className="flex">
      <div className="flex-1 px-3">
        <h2 className="text-center">Filters</h2>
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
      <div className="flex-1 px-2">
        <h2 className="text-center">Operating Conditions Filters</h2>
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
  );
}
