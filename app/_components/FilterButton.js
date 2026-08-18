"use client";

function FilterButton({ handleSearchParams, filter, activeFilter, children }) {
  return (
    <button
      className={`px-5 py-2 hover:bg-primary-700 ${filter === activeFilter ? "bg-primary-700 text-primary-50" : ""}`}
      onClick={() => handleSearchParams(filter)}
    >
      {children}
    </button>
  );
}
export default FilterButton;
