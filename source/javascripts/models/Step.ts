import { UnionToIntersection } from 'type-fest';
import { Workflow } from './Workflow';

export type Steps = Required<Workflow>['steps'];
export type Step = UnionToIntersection<Steps[number][string]>;
