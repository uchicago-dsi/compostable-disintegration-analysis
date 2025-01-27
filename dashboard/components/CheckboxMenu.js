"use client";
// import React from "react";
import React, { useState, useRef, useEffect } from "react";

import { useSnapshot } from "valtio";
import state from "@/lib/state";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

export default function CheckboxMenu({
  options,
  selectedOptions,
  filterKey,
  title,
  infoText,
  showInfoIcon = false,
  disabled = false,
}) {
  const snap = useSnapshot(state);

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

  const allSelected = selectedOptions.length === options.length;
  const noneSelected = selectedOptions.length === 0;

  return (
    <div className={`
      my-4 border border-gray-300 rounded-md shadow-sm w-full
      ${disabled ? 'opacity-50 pointer-events-none' : ''}
      `}>
      <div className="flex justify-center mx-auto">
        <h3 className="text-center inline-block">
          <span className="font-bold">{title}</span>
          <div
            className="tooltip tooltip-primary tooltip-left ml-2 inline-flex"
            data-tip={infoText}
          >
            <span className="cursor-pointer text-primary">
              <InformationCircleIcon className="h-5 w-5 text-primary" />
            </span>
          </div>
        </h3>
      </div>
      <div className="flex join mt-1 justify-center">
        <button
          disabled={disabled}
          className={`btn join-item btn-sm normal-case hover:bg-secondary ${
            allSelected ? "bg-primary" : ""
          }`}
          onClick={selectAll}
        >
          All
        </button>
        <button
          disabled={disabled}
          className={`btn join-item btn-sm normal-case hover:bg-secondary ${
            noneSelected ? "bg-primary" : ""
          }`}
          onClick={selectNone}
        >
          None
        </button>
      </div>
      <div className="my-1 border-t border-gray-300"></div>
      <div className="relative">
        <div
          className="absolute top-0 left-0 right-0 h-6 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))",
          }}
        ></div>{" "}
        <div className="overflow-auto flex-grow px-0 h-[150px]">
          <ul className="menu dropdown-content rounded-box z-[1] mx-auto">
            {options?.map((option) => (
              <li key={option}>
                <label className="label cursor-pointer">
                  <span className="label-text text-[.85rem] px-0">
                    {option}
                  </span>
                  {showInfoIcon && (
                    <div
                      className="tooltip tooltip-primary tooltip-bottom ml-2 inline-flex"
                      data-tip={infoText}
                    >
                      <span className="cursor-pointer text-primary">
                        <InformationCircleIcon className="h-5 w-5 text-primary" />
                      </span>
                    </div>
                  )}
                  <input
                    disabled={disabled}
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
        <div
          className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))",
          }}
        ></div>{" "}
      </div>
    </div>
  );
}
