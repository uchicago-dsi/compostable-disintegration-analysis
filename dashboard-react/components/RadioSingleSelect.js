"use client";
import React from "react";
import { useSnapshot } from "valtio";
import state from "@/lib/state";
import { handleSingleSelectChange } from "@/lib/utils";

export default function RadioSingleSelect({ options, title, filterKey }) {
  const snap = useSnapshot(state);

  return (
    <>
      <h2>{title}</h2>
      <div className="flex space-x-4">
        {Object.entries(options).map(([key, value]) => (
          <label
            key={key}
            className="label cursor-pointer flex flex-col items-center space-x-2 w-1/3 md:w-1/4 lg:w-1/5 space-y-2"
          >
            <input
              type="radio"
              name={filterKey}
              value={value}
              checked={snap.filters[filterKey] === value}
              onChange={() => handleSingleSelectChange(filterKey, value)}
              className="radio radio-primary"
            />
            <span className="label-text">{key}</span>
          </label>
        ))}
      </div>
    </>
  );
}
