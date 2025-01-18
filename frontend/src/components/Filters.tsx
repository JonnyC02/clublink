import React from "react";
import { FilterOption } from "../types/FilterOption";

type FiltersProps = {
  filterOptions: FilterOption[];
  filters: Record<string, string | boolean>;
  onFilterChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  renderFooter?: React.ReactNode;
};

const Filters: React.FC<FiltersProps> = ({
  filterOptions,
  filters,
  onFilterChange,
  renderFooter,
}) => {
  return (
    <div className="w-1/4 bg-white shadow-md p-4 rounded-lg self-start">
      <h2 className="text-lg font-bold mb-4">Filters</h2>
      {filterOptions.map((filter) => {
        const error =
          filter.validation?.(String(filters[filter.id] || "")) || null;
        return (
          <div className="mb-4" key={filter.id}>
            <label
              htmlFor={filter.id}
              className="block text-sm font-medium text-gray-700"
            >
              {filter.label}
            </label>
            {filter.type === "text" && (
              <>
                <input
                  type="text"
                  id={filter.id}
                  name={filter.id}
                  placeholder={filter.placeholder}
                  value={filters[filter.id] as string}
                  onChange={onFilterChange}
                  className={`mt-1 block w-full py-2 px-3 border ${
                    error ? "border-red-500" : "border-gray-300"
                  } bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </>
            )}
            {filter.type === "select" && (
              <select
                id={filter.id}
                name={filter.id}
                value={filters[filter.id] as string}
                onChange={onFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                <option value="">All</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            {filter.type === "checkbox" && (
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id={filter.id}
                  name={filter.id}
                  checked={filters[filter.id] as boolean}
                  onChange={onFilterChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={filter.id}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {filter.label}
                </label>
              </div>
            )}
            {filter.type === "range" && (
              <div className="mt-2">
                <input
                  type="range"
                  id={filter.id}
                  name={filter.id}
                  min={filter.min}
                  max={filter.max}
                  step={filter.step}
                  value={filters[filter.id] as string}
                  onChange={onFilterChange}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Value: {filters[filter.id]}
                </p>
              </div>
            )}
          </div>
        );
      })}
      {renderFooter && <div className="mt-4">{renderFooter}</div>}
    </div>
  );
};

export default Filters;
