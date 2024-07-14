import React from "react";

const AlertMessage = ({ message }) => {
  return (
    <div
      className={`border-l-4 p-4 bg-yellow-100 border-yellow-400 text-yellow-700} rounded`}
    >
      <p className="font-bold">{message}</p>
    </div>
  );
};

export default AlertMessage;
