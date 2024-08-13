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

  const infoText = `Select one or more options to filter the data by ${title.toLowerCase()}`;

  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollRef = useRef(null);

  const checkScrollPosition = () => {
    const element = scrollRef.current;
    setCanScrollUp(element.scrollTop > 0);
    setCanScrollDown(
      element.scrollTop < element.scrollHeight - element.clientHeight
    );
  };

  useEffect(() => {
    checkScrollPosition(); // Initial check
  }, [options]); // Re-check when options change

  return (
    <div className="my-4 border border-gray-300 rounded-md shadow-sm">
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
          className={`btn join-item btn-sm normal-case hover:bg-secondary ${
            allSelected ? "bg-primary" : ""
          }`}
          onClick={selectAll}
        >
          All
        </button>
        <button
          className={`btn join-item btn-sm normal-case hover:bg-secondary ${
            noneSelected ? "bg-primary" : ""
          }`}
          onClick={selectNone}
        >
          None
        </button>
      </div>
      <div className="my-1 border-t border-gray-300"></div>
      <div>
        {canScrollUp ? (
          <div className="scroll-arrow up text-center text-primary shadow-bottom">
            ▲
          </div>
        ) : (
          <div className="h-6 shadow-bottom"></div>
        )}
        <div
          className="overflow-auto flex-grow p-3 h-[150px]"
          ref={scrollRef}
          onScroll={checkScrollPosition}
        >
          <ul className="menu dropdown-content rounded-box z-[1] mx-auto">
            {options?.map((option) => (
              <li key={option}>
                <label className="label cursor-pointer">
                  <span className="label-text text-[.8rem] px-0">{option}</span>
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
        {canScrollDown ? (
          <div className="scroll-arrow down text-center h-6 text-primary shadow-top">
            ▼
          </div>
        ) : (
          <div className="h-6 shadow-top"></div>
        )}
      </div>
    </div>
  );
}
