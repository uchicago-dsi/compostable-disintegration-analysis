"use client";
import React, { useState } from "react";
import { useSnapshot } from "valtio";
import state from "@/lib/state";
export default function CheckboxMenu({
  options,
  selectedOptions,
  filterKey,
  title,
}) {
  const snap = useSnapshot(state);
  // Note: Use local state for the expanded state of the menu
  const [expanded, setExpanded] = useState(false);

  const handleCheckboxChange = (key, value) => (event) => {
    const checked = event.target.checked;
    if (checked) {
      state.setFilterValue(key, [...snap.filters[key], value]);
    } else {
      state.setFilterValue(
        key,
        snap.filters[key].filter((item) => item !== value)
      );
    }
  };

  const selectAll = () => {
    state.setFilterValue(filterKey, [...options]);
  };

  const selectNone = () => {
    state.setFilterValue(filterKey, []);
  };

  return (
    <div className="my-4">
      <h3>{title}</h3>
      <div className="flex mt-3">
        <button
          className="btn btn-sm normal-case"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? `Collapse Menu` : `Show Menu`}
        </button>
      </div>
      <div
        className={`overflow-auto flex-grow px-4 ${
          expanded ? "max-h-[200px]" : "h-0"
        }`}
      >
        <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 mx-auto shadow">
          {options?.map((option) => (
            <li key={option}>
              <label className="label cursor-pointer">
                <span className="label-text">{option}</span>
                <input
                  type="checkbox"
                  id={`option-${option}`}
                  value={option}
                  checked={selectedOptions.includes(option)}
                  onChange={handleCheckboxChange(filterKey, option)}
                  className="checkbox checkbox-primary"
                />
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2 flex join">
        <button
          className="btn join-item btn-sm normal-case"
          onClick={selectAll}
        >
          All
        </button>
        <button
          className="btn join-item btn-sm normal-case"
          onClick={selectNone}
        >
          None
        </button>
      </div>
      <div className="divider m-0"></div>
    </div>
  );
}
