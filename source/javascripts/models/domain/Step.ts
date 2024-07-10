import { Workflow } from './Workflow';

export type Steps = Required<Workflow>['steps'];
export type Step = Steps[number][string];

export type OutputVariable = {
  key: string;
  title?: string;
  summary?: string;
  description?: string;
};
