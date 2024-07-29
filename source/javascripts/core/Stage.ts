import { BitriseYml } from './BitriseYml';
import { WithId } from '@/core/WithId';

type Stages = Required<BitriseYml>['stages'];
type StageObject = Stages[string];
type Stage = WithId<StageObject>;

function deleteWorkflow(stage: Stage, workflowId: string) {
  const workflows = stage.workflows?.filter((workflow) => !Object.keys(workflow).includes(workflowId));
  return { ...stage, workflows };
}

export { Stage, Stages, StageObject };
export default {
  deleteWorkflow,
};
