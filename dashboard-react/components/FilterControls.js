'use client';
import React, { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import state from '@/lib/state';
import { moistureFilterDict, temperatureFilterDict, trialDurationDict, selection2material } from '@/lib/constants';

const FilterControls = () => {
  const snap = useSnapshot(state);

  const handleSelectionChange = (key) => (event) => {
    console.log(key, event.target.value);
    state.setFilterValue(key, event.target.value);
  };

  const handleCheckboxChange = (key, value) => (event) => {
    const checked = event.target.checked;
    console.log(`checked for ${key} ${value}`)
    console.log(checked)
    if (checked) {
      state.setFilterValue(key, [...snap.filters[key], value]);
    } else {
        console.log("removing")
      state.setFilterValue(key, snap.filters[key].filter(item => item !== value));
    }
  };

  useEffect(() => {
    if (snap.options["Test Method"] && snap.options["Material Class II"] && snap.options["Technology"] && state.filters.initialized === false) {
      state.setFilterValue('selectedTestMethods', snap.options["Test Method"]);
      state.setFilterValue('selectedMaterialTypes', snap.options["Material Class II"]);
      state.setFilterValue('selectedTechnologies', snap.options["Technology"]);
      state.setFilterValue('initialized', true);
    }
  }, [snap.options]);

  if (!snap.filters.initialized) {
    return <div>Loading...</div>;
  }

  console.log("snap.options")
  console.log(snap.options);

  console.log("snap.filters")
  console.log(snap.filters);

  return (
    <>
        <div>
            <h2>Display Options</h2>
            <div>
                <label htmlFor="columnSelect">Select Column:</label>
                <select
                    id="columnSelect"
                    value={snap.filters.aggCol}
                    onChange={handleSelectionChange('aggCol')}
                >
                    {Object.entries(selection2material).map(([key, value]) => (
                    <option key={key} value={value}>
                        {key}
                    </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="displayColumnSelect">Choose x-axis Display:</label>
                <select id="displayColumnSelect" value={snap.filters.displayCol} onChange={handleSelectionChange('displayCol')}>
                    <option value="% Residuals (Mass)">% Residuals (Mass)</option>
                    <option value="% Residuals (Area)">% Residuals (Area)</option>
                </select>
            </div>
            <div>
                <label htmlFor="displayColumnSelect">Show by Residuals Remaining or by Percent Disintegrated:</label>
                <select id="displayColumnSelect" value={snap.filters.displayResiduals} onChange={handleSelectionChange('displayResiduals')}>
                    <option value="Residuals">Residuals Remaining</option>
                    <option value="Disintegrated">Percent Disintegrated</option>
                </select>
            </div>
            <div>
            <label htmlFor="capResults">Display All Results:</label>
                <input
                    type="checkbox"
                    id="capResults"
                    checked={snap.filters.uncapResults}
                    onChange={() => state.setFilterValue('uncapResults', !snap.filters.uncapResults)}
                />
                <p>
                    <i>
                        Note: There are some results by both mass or surface area with over 100% residuals. The dashboard automatically caps these results at 100% residuals (0% disintegration). Check this box to show all results, including over 100% Residuals. Disintegration results are always capped at 0% (no negative disintegration results)
                    </i>
                </p>
            </div>
            <h2>Filters</h2>
            <div>
                <label>Select Test Methods:</label>
                {snap.options["Test Method"]?.map(option => (
                    <div key={option}>
                    <input
                        type="checkbox"
                        id={`testMethod-${option}`}
                        value={option}
                        checked={snap.filters.selectedTestMethods.includes(option)}
                        onChange={handleCheckboxChange('selectedTestMethods', option)}
                    />
                    <label htmlFor={`testMethod-${option}`}>{option}</label>
                    </div>
                ))}
            </div>
            <div>
                <label>Select Technology:</label>
                {snap.options["Technology"]?.map(option => (
                    <div key={option}>
                    <input
                        type="checkbox"
                        id={`testMethod-${option}`}
                        value={option}
                        checked={snap.filters.selectedTechnologies.includes(option)}
                        onChange={handleCheckboxChange('selectedTechnologies', option)}
                    />
                    <label htmlFor={`testMethod-${option}`}>{option}</label>
                    </div>
                ))}
            </div>
            <div>
                <label>Select Material Type(s):</label>
                {snap.options["Material Class II"]?.map(option => (
                    <div key={option}>
                    <input
                        type="checkbox"
                        id={`testMethod-${option}`}
                        value={option}
                        checked={snap.filters.selectedMaterialTypes.includes(option)}
                        onChange={handleCheckboxChange('selectedMaterialTypes', option)}
                    />
                    <label htmlFor={`testMethod-${option}`}>{option}</label>
                    </div>
                ))}
            </div>
            <h2>Operating Conditions Filters</h2>
            <div>
                <label>Select Average Temperature Range:</label>
                {Object.entries(temperatureFilterDict)?.map(([key, value]) => (
                    <div key={key}>
                    <input
                        type="checkbox"
                        id={`moisture-${key}`}
                        value={key}
                        checked={snap.filters.selectedTemperatureLevels.includes(key)}
                        onChange={handleCheckboxChange('selectedTemperatureLevels', key)}
                    />
                    <label htmlFor={`testMethod-${key}`}>{key}</label>
                    </div>
                ))}
            </div>
            <div>
                <label>Select Average Moisture Content (In Field) Range:</label>
                {Object.entries(moistureFilterDict)?.map(([key, value]) => (
                    <div key={key}>
                    <input
                        type="checkbox"
                        id={`moisture-${key}`}
                        value={key}
                        checked={snap.filters.selectedMoistureLevels.includes(key)}
                        onChange={handleCheckboxChange('selectedMoistureLevels', key)}
                    />
                    <label htmlFor={`testMethod-${key}`}>{key}</label>
                    </div>
                ))}
            </div>
            <div>
                <label>Select Trial Duration Range:</label>
                {Object.entries(trialDurationDict)?.map(([key, value]) => (
                    <div key={key}>
                    <input
                        type="checkbox"
                        id={`moisture-${key}`}
                        value={key}
                        checked={snap.filters.selectedTrialDurations.includes(key)}
                        onChange={handleCheckboxChange('selectedTrialDurations', key)}
                    />
                    <label htmlFor={`testMethod-${key}`}>{key}</label>
                    </div>
                ))}
            </div>
        </div>
    </>
  );
};

export default FilterControls;