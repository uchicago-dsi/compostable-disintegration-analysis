import React from 'react';
import { useSnapshot } from 'valtio';
import state from '@/lib/state';
import { moistureDict } from '@/lib/constants';

const FilterControls = () => {
  const snap = useSnapshot(state);

  const handleSelectionChange = (key) => (event) => {
    console.log(key, event.target.value);
    state.setFilterValue(key, event.target.value);
  };

  const handleCheckboxChange = (key, value) => (event) => {
    const checked = event.target.checked;
    if (checked) {
      state.setFilterValue(key, [...snap.filters[key], value]);
    } else {
      state.setFilterValue(key, snap.filters[key].filter(item => item !== value));
    }
  };

    // {/* Show by Residuals Remaining or by Percent Disintegrated */}
    // {/* Cap results */}

      
    // {/* Select material type(s) */}
    // {/* Select technology */}

    // {/* Operating Conditions Filters */}
    // {/* Select Average Temperature Range */}
    // {/* Select Trial Duration Range */}
    // {/* Select Average Moisture Content (In Field) Range */}

    // console.log("snap.filters.selectedMoistureLevels")
    // console.log(snap.filters.selectedMoistureLevels)

  return (
    <>
    <div>
        <h2>Display Options</h2>
        <div>
            <label htmlFor="columnSelect">Select Column:</label>
            <select id="columnSelect" value={snap.filters.aggCol} onChange={handleSelectionChange('aggCol')}>
                <option value="Material Class I">Material Class I</option>
                <option value="Material Class II">Material Class II</option>
                <option value="Material Class III">Material Class III</option>
            </select>
        </div>
        <div>
            <label htmlFor="displayColumnSelect">Choose x-axis Display:</label>
            <select id="displayColumnSelect" value={snap.filters.displayCol} onChange={handleSelectionChange('displayCol')}>
                <option value="% Residuals (Mass)">% Residuals (Mass)</option>
                <option value="% Residuals (Area)">% Residuals (Area)</option>
            </select>
        </div>
        <h2>Filters</h2>
        <div>
        <label>Select Test Methods:</label>
        {snap.options["Test Method"]?.map(value => (
            <div key={value}>
            <input
                type="checkbox"
                id={`testMethod-${value}`}
                value={value}
                checked={snap.filters.selectedTestMethods.includes(value)}
                onChange={handleCheckboxChange('selectedTestMethods', value)}
            />
            <label htmlFor={`testMethod-${value}`}>{value}</label>
            </div>
        ))}
        </div>
        <h2>Operating Conditions Filters</h2>
        <div>
        <label>Select Average Moisture Content (In Field) Range:</label>
        {Object.entries(moistureDict)?.map(([key, value]) => (
            <div key={key}>
            <input
                type="checkbox"
                id={`moisture-${key}`}
                value={key}
                onChange={handleCheckboxChange('selectedMoistureLevels', key)}
            />
            <label htmlFor={`testMethod-${key}`}>{key}</label>
            </div>
        ))}
        </div>
        <div>
            <p>
                <i>
                    Note: There are some results by both mass or surface area with over 100% residuals. The dashboard automatically caps these results at 100% residuals (0% disintegration). Check this box to show all results, including over 100% Residuals. Disintegration results are always capped at 0% (no negative disintegration results)
                </i>
            </p>
        </div>
        </div>
    </>
  );
};

export default FilterControls;