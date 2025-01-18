import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Filters from "../../src/components/Filters";
import { FilterOption } from "../../src/types/FilterOption";

describe("Filters Component", () => {
  let filters: Record<string, string | boolean>;
  const mockOnFilterChange = jest.fn(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = e.target;

      if (target instanceof HTMLInputElement && target.type === "checkbox") {
        filters[target.name] = target.checked;
      } else {
        filters[target.name] = target.value;
      }
    }
  );

  const filterOptions: FilterOption[] = [
    {
      id: "search",
      label: "Search",
      type: "text",
      placeholder: "Search clubs",
    },
    {
      id: "university",
      label: "University",
      type: "select",
      options: [
        { value: "uni1", label: "University 1" },
        { value: "uni2", label: "University 2" },
      ],
    },
    {
      id: "hasAlcohol",
      label: "Has Alcohol",
      type: "checkbox",
    },
    {
      id: "ticketPrice",
      label: "Ticket Price",
      type: "range",
      min: 0,
      max: 100,
      step: 1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    filters = {
      search: "",
      university: "",
      hasAlcohol: false,
      ticketPrice: "50",
    };
  });

  it("renders all filter options correctly", () => {
    render(
      <Filters
        filterOptions={filterOptions}
        filters={filters}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByLabelText("Search")).toBeDefined();
    expect(screen.getByLabelText("University")).toBeDefined();
    expect(screen.getByLabelText("Has Alcohol")).toBeDefined();
    expect(screen.getByLabelText("Ticket Price")).toBeDefined();
  });

  it("handles text input changes", () => {
    render(
      <Filters
        filterOptions={filterOptions}
        filters={filters}
        onFilterChange={mockOnFilterChange}
      />
    );

    const searchInput = screen.getByLabelText("Search") as HTMLInputElement;
    fireEvent.change(searchInput, {
      target: { value: "test search", name: "search" },
    });

    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(filters.search).toBe("test search");
  });

  it("handles select changes", () => {
    render(
      <Filters
        filterOptions={filterOptions}
        filters={filters}
        onFilterChange={mockOnFilterChange}
      />
    );

    const selectInput = screen.getByLabelText(
      "University"
    ) as HTMLSelectElement;
    fireEvent.change(selectInput, {
      target: { value: "uni1", name: "university" },
    });

    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(filters.university).toBe("uni1");
  });

  it("handles checkbox changes", () => {
    render(
      <Filters
        filterOptions={filterOptions}
        filters={filters}
        onFilterChange={mockOnFilterChange}
      />
    );

    const checkbox = screen.getByLabelText("Has Alcohol") as HTMLInputElement;
    fireEvent.click(checkbox);

    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(filters.hasAlcohol).toBe(true);
  });

  it("handles range input changes", () => {
    render(
      <Filters
        filterOptions={filterOptions}
        filters={filters}
        onFilterChange={mockOnFilterChange}
      />
    );

    const rangeInput = screen.getByLabelText(
      "Ticket Price"
    ) as HTMLInputElement;
    fireEvent.change(rangeInput, {
      target: { value: "60", name: "ticketPrice" },
    });

    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(filters.ticketPrice).toBe("60");
  });
});
