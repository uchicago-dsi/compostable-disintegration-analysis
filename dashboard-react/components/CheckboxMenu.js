"use client";
import React, { useRef } from "react";
import { useSnapshot } from "valtio";
import state from "@/lib/state";
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

  return (
    <>
      <h2 className="text-center">{title}</h2>
      <div className="divider m-0"></div>
      <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
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
              />
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex join justify-center">
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
    </>
  );
}

// export default function CheckboxMenu({
//   options,
//   selectedOptions,
//   filterKey,
//   title,}
// ) {
//   const snap = useSnapshot(state);

//   const handleCheckboxChange = (key, value) => (event) => {
//     const checked = event.target.checked;
//     console.log(`checked for ${key} ${value}`);
//     console.log(checked);
//     if (checked) {
//       state.setFilterValue(key, [...snap.filters[key], value]);
//     } else {
//       console.log("removing");
//       state.setFilterValue(
//         key,
//         snap.filters[key].filter((item) => item !== value)
//       );
//     }
//   };

//   const selectAll = () => {
//     state.setFilterValue(filterKey, [...options]);
//   };

//   const selectNone = () => {
//     state.setFilterValue(filterKey, []);
//   };

//   return (
//     <>
//       <h2>{title}</h2>
//       <div className="divider m-0"></div>
//       <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
//         {options?.map((option) => (
//           <li key={option}>
//             <label className="label cursor-pointer">
//               <span className="label-text">{option}</span>
//               <input
//                 type="checkbox"
//                 id={`option-${option}`}
//                 value={option}
//                 checked={selectedOptions.includes(option)}
//                 onChange={handleCheckboxChange(filterKey, option)}
//               />
//             </label>
//           </li>
//         ))}
//       </ul>
//       <div className="mt-2 flex join justify-left">
//         <button
//           className="btn join-item btn-sm normal-case"
//           onClick={selectAll}
//         >
//           All
//         </button>
//         <button
//           className="btn join-item btn-sm normal-case"
//           onClick={selectNone}
//         >
//           None
//         </button>
//       </div>
//       <div className="divider m-0"></div>
//     </>
//   );
// });
