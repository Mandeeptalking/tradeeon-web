import React from 'react';

interface GroupLogicToggleProps {
  value: "AND" | "OR";
  onChange: (logic: "AND" | "OR") => void;
  className?: string;
}

export default function GroupLogicToggle({ value, onChange, className = "" }: GroupLogicToggleProps) {
  return (
    <div className={`flex bg-gray-100 rounded-lg p-1 ${className}`}>
      <button
        onClick={() => onChange("AND")}
        className={`flex-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          value === "AND"
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        AND
      </button>
      <button
        onClick={() => onChange("OR")}
        className={`flex-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          value === "OR"
            ? 'bg-orange-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        OR
      </button>
    </div>
  );
}