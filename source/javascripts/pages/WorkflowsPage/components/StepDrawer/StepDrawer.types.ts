import { Step } from '@/core/models/Step';

export type SearchFormValues = {
  search: string;
  categories: string[];
};

export type CategoryRowItem = {
  type: 'category';
  category: string;
  rows: number;
};

type StepItem = {
  id: string;
  step: Step;
  isDisabled: boolean;
};

export type StepsRowItem = {
  type: 'steps';
  row: number;
  category?: string;
  columns: number;
  steps: StepItem[];
};

export type VirtualizedListItem = CategoryRowItem | StepsRowItem;

export type StepSelected = (step: Step) => void;
