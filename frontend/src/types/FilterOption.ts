export type FilterOption = {
  id: string;
  label: string;
  type: "text" | "select" | "checkbox" | "range";
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  validation?: (value: string) => string | null;
};
