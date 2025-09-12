import React from 'react';

interface GroupLogicToggleV2Props {
  value: "AND" | "OR";
  onChange: (logic: "AND" | "OR") => void;
  className?: string;
}

export default function GroupLogicToggleV2({ value, onChange, className = "" }: GroupLogicToggleV2Props) {
  return (
    <div className={`flex bg-gray-100 rounded-lg p-1 ${className}`}>
      <button
        onClick={() => onChange("AND")}
        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
          value === "AND"
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        AND
      </button>
      <button
        onClick={() => onChange("OR")}
        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
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