// src/components/filter-panel/CheckboxFilter.jsx
import React, { memo, useMemo } from "react";
import PortalDropdown from "./PortalDropdown";
import Icon from "./Icon";
import useFilterPanelState from "./useFilterPanelState";

const CheckboxFilter = memo(
  ({
    id,
    title,
    items = [],
    selected = [],
    onToggle,
    anchorRef,
    emptyLabel = "Tất cả",
    visible = true,
    icon,
  }) => {
    const { openDropdown, setOpenDropdown } = useFilterPanelState();
    const count = useMemo(() => (Array.isArray(selected) ? selected.length : 0), [selected]);

    if (!visible) return null;

    return (
      <div className="">
        <button
          ref={anchorRef}
          type="button"
          onClick={() => setOpenDropdown((prev) => (prev === id ? null : id))}
          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Icon>{icon}</Icon>
            <div className="text-left">
              <div className="font-medium mr-2 text-gray-800 text-sm">{title}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {count > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {count}
              </span>
            )}
            <svg
              className={`w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-transform duration-300 ${
                openDropdown === id ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        <PortalDropdown
          open={openDropdown === id}
          anchorRef={anchorRef}
          onClose={() => setOpenDropdown(null)}
        >
          <div className="space-y-1">
            {items.map((item) => (
              <label
                key={item}
                className="flex items-center px-2 py-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(item)}
                  onChange={() => onToggle(item)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700">{item}</span>
              </label>
            ))}
          </div>
        </PortalDropdown>
      </div>
    );
  }
);

export default CheckboxFilter;