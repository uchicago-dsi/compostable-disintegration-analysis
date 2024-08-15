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
      <div className="flex-1 mx-2 w-full min-h-[300px]">
        <h2 className="text-center"> Item Filters</h2>
        <div className="grid grid-cols-4 gap-2">
          <CheckboxMenu
            options={snap.options["Material Class II"]}
            selectedOptions={snap.filters.selectedMaterialTypes}
            filterKey="selectedMaterialTypes"
            title="Select Generic Material"
            infoText="Select one or more options to filter the data by the generic material types tested."
          />
          <CheckboxMenu
            options={snap.options["Material Class III"]}
            selectedOptions={snap.filters.selectedSpecificMaterialTypes}
            filterKey="selectedSpecificMaterialTypes"
            title="Select Specific Material"
            infoText="Select one or more options to filter the data by the specific material types tested."
          />
          <CheckboxMenu
            options={snap.options["Item Format"]}
            selectedOptions={snap.filters.selectedFormats}
            filterKey="selectedFormats"
            title="Select Item Type"
            infoText="Select one or more options to filter the data by the type of item tested."
          />
          <CheckboxMenu
            options={snap.options["Item Brand"]}
            selectedOptions={snap.filters.selectedBrands}
            filterKey="selectedBrands"
            title="Select Item Brand"
            infoText="Select one or more options to filter the data by the brands whose items were tested."
          />
        </div>
        <h2 className="text-center"> Operations</h2>
        <div className="grid grid-cols-4 gap-2">
          <CheckboxMenu
            options={snap.options["Technology"]}
            selectedOptions={snap.filters.selectedTechnologies}
            filterKey="selectedTechnologies"
            title="Select Technology"
            infoText="Select one or more options to filter the data by the primary technology used by the facility conducting the field test."
          />
          <CheckboxMenu
            options={Object.keys(temperatureFilterDict)}
            selectedOptions={snap.filters.selectedTemperatureLevels}
            filterKey="selectedTemperatureLevels"
            title="Select Average Temperature"
            infoText="Select one or more options to filter the data by the average temperature range during the field test."
          />
          <CheckboxMenu
            options={Object.keys(moistureFilterDict)}
            selectedOptions={snap.filters.selectedMoistureLevels}
            filterKey="selectedMoistureLevels"
            title="Select % Moisture"
            infoText="Select one or more options to filter the data by the average % moisture."
          />
          <CheckboxMenu
            options={Object.keys(trialDurationDict)}
            selectedOptions={snap.filters.selectedTrialDurations}
            filterKey="selectedTrialDurations"
            title="Select Trial Duration"
            infoText="Select one or more options to filter the data by the duration of the field test."
          />
        </div>
      </div>
    </div>
  );
}
