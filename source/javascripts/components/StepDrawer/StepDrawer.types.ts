export type SearchFormValues = {
  search: string;
  categories: string[];
};

export type Step = {
  id: string;
  cvs: string;
  icon: string;
  title: string;
  summary: string;
  description: string;
  version: string;
  categories: string[];
  isOfficial: boolean;
  isVerified: boolean;
  isDeprecated: boolean;
  isDisabled?: boolean;
};

export type CategoryRowItem = {
  type: 'category';
  category: string;
  rows: number;
};

export type StepsRowItem = {
  type: 'steps';
  row: number;
  category?: string;
  columns: number;
  steps: Step[];
};

export type VirtualizedListItem = CategoryRowItem | StepsRowItem;
export type StepSelected = (step: Step) => void;
