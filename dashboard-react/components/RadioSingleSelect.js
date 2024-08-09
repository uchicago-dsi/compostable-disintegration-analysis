"use client";
import React from "react";
import { useSnapshot } from "valtio";
import state from "@/lib/state";
import { handleSingleSelectChange } from "@/lib/utils";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

export default function RadioSingleSelect({ options, title, filterKey }) {
  const snap = useSnapshot(state);

  const infoText = `Select display option for ${title.toLowerCase()}`;

  return (
    <div className="flex flex-wrap items-center">
      <div className="flex flex-wrap items-center flex-grow">
        <h3>
          <span className="inline">{title}</span>
          <div
            className="tooltip tooltip-primary tooltip-bottom ml-2 inline-flex"
            data-tip={infoText}
          >
            <span className="cursor-pointer text-primary">
              <InformationCircleIcon className="h-5 w-5 text-primary" />
            </span>
          </div>
        </h3>
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
