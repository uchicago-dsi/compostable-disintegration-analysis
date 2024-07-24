"use client";
import React, { useRef } from "react";
import { useSnapshot } from "valtio";
import state from "@/lib/state";
import { invertDictionary } from "@/lib/constants";
import { onSummaryClick, handleSingleSelectChange } from "@/lib/utils";

export default function DropdownSingleSelect({ options, title, filterKey }) {
  const snap = useSnapshot(state);
  const divRef = useRef(null);

  const col2options = invertDictionary(options);

  return (
    <>
      <h2>{title}</h2>
      <details className="dropdown">
        <summary
          className="btn m-1"
          onClick={() => onSummaryClick(filterKey)}
          ref={divRef}
          id={`summary-${filterKey}`}
        >
          {col2options[snap.filters[filterKey]]}
        </summary>
        <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          {Object.entries(options).map(([key, value]) => (
            <li key={key}>
              <a
                id={`option-${value}`}
                onClick={() => handleSingleSelectChange(filterKey, value)}
              >
                {key}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}
