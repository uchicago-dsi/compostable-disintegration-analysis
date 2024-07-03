"use client";
import React from "react";
import { useSnapshot } from "valtio";
import state from "@/lib/state";
import { filter } from "d3";

export default function DropdownSingleSelect({ options, title, filterKey }) {
  const snap = useSnapshot(state);

  const handleSelectionChange = (key, value) => {
    console.log(key, value);
    state.setFilterValue(key, value);
  };

  return (
    <>
      <h2>{title}</h2>
      <details className="dropdown">
        <summary className="btn m-1">{snap.filters[filterKey]}</summary>
        <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          {Object.entries(options).map(([key, value]) => (
            <li key={key}>
              <a
                id={`option-${value}`}
                onClick={() => handleSelectionChange(filterKey, value)}
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
