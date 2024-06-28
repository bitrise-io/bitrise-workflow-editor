export const RowHeights = {
  category: 24,
  steps: 110,
};

export const RowGaps = {
  category: 8,
  steps: 16,
};

export const RowSizes = {
  category: RowHeights.category + RowGaps.category,
  steps: RowHeights.steps + RowGaps.steps,
};

export const Columns = {
  mobile: 1,
  tablet: 2,
  desktop: 2,
  wideDesktop: 3,
};
export const ColumnValues = Object.values(Columns);
