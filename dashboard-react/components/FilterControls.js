import React from 'react';
import { useSnapshot } from 'valtio';
import state from '@/lib/state';

const SelectionControls = () => {
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

  return (
    <div>
      <div>
        <label htmlFor="columnSelect">Select Column:</label>
        <select id="columnSelect" value={snap.filters.aggCol} onChange={handleSelectionChange('aggCol')}>
            <option value="Material Class I">Material Class I</option>
            <option value="Material Class II">Material Class II</option>
            <option value="Material Class III">Material Class III</option>
        </select>
      </div>
      <div>
        <label htmlFor="displayColumnSelect">Select Display Column:</label>
        <select id="displayColumnSelect" value={snap.filters.displayCol} onChange={handleSelectionChange('displayCol')}>
            <option value="% Residuals (Mass)">% Residuals (Mass)</option>
            <option value="% Residuals (Area)">% Residuals (Area)</option>
        </select>
      </div>
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
    </div>
  );
};

export default SelectionControls;