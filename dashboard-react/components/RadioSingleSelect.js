"use client";
import React from "react";
import { useSnapshot } from "valtio";
import state from "@/lib/state";
import { handleSingleSelectChange } from "@/lib/utils";

export default function RadioSingleSelect({ options, title, filterKey }) {
  const snap = useSnapshot(state);

  return (
    <div className="flex flex-wrap items-center">
      <div className="flex flex-wrap items-center flex-grow">
        <h4 className="mr-4">{title}</h4>
        {Object.entries(options).map(([key, value]) => (
          <label
            key={key}
            className="label cursor-pointer flex items-center space-x-1 max-w-[130px] mb-.75 mr-.75"
          >
            <input
              type="radio"
              name={filterKey}
              value={value}
              checked={snap.filters[filterKey] === value}
              onChange={() => handleSingleSelectChange(filterKey, value)}
              className="radio radio-primary"
            />
            <span className="label-text align-top items-start">{key}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
