"use client";
import React, { useRef } from "react";
import { useSnapshot } from "valtio";
import state from "@/lib/state";
import { invertDictionary } from "@/lib/constants";
import { onSummaryClick, handleSingleSelectChange } from "@/lib/utils";

export default function RadioSingleSelect({ options, title, filterKey }) {
  const snap = useSnapshot(state);
  const divRef = useRef(null);

  const col2options = invertDictionary(options);

  return (
    <>
      <h2>{title}</h2>
      <div className="flex space-x-4">
        {Object.entries(options).map(([key, value]) => (
          <label
            key={key}
            className="label cursor-pointer flex items-center space-x-2"
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
