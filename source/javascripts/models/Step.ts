import { Workflow } from './Workflow';

export type Steps = Required<Workflow>['steps'];
export type Step = Steps[number][string];
