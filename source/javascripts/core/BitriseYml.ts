import { FromSchema } from 'json-schema-to-ts';
import { bitriseYmlSchema } from '@/core/BitriseYml.schema';
import WorkflowService, { Workflow } from '@/core/Workflow';
import StageService, { Stage } from '@/core/Stage';

type BitriseYml = FromSchema<typeof bitriseYmlSchema>;
type Meta = Required<BitriseYml>['meta'] & {
  'bitrise.io'?: {
    stack: string;
    machine_type_id: string;
  };
};

function deleteWorkflow(yml: BitriseYml, workflowId: string): BitriseYml {
  const copy = JSON.parse(JSON.stringify(yml)) as BitriseYml;

  if (copy.workflows) {
    // @ts-expect-error Workflows should be defined here
    const workflowEntries = Object.entries<Workflow>(copy.workflows ?? {});
    workflowEntries.map(([currentWorkflowId, workflow]) => {
      if (currentWorkflowId === workflowId) {
        return;
      }

      return {
        ...workflow,
        ...WorkflowService.deleteBeforeRun(workflow, workflowId),
        ...WorkflowService.deleteAfterRun(workflow, workflowId),
      };
    });

    copy.workflows = Object.fromEntries(workflowEntries);
  }

  if (copy.stages) {
    // @ts-expect-error Stages should be defined here
    const stageEntries = Object.entries<Stage>(copy.stages ?? {});
    stageEntries.map(([_stageId, stage]) => {
      return {
        ...stage,
        ...StageService.deleteWorkflow(stage, workflowId),
      };
    });

    copy.stages = Object.fromEntries(stageEntries);
  }

  if (copy.trigger_map) {
    copy.trigger_map = copy.trigger_map?.filter(({ workflow }) => workflow !== workflowId);
  }

  return copy;
}

export { BitriseYml, Meta };
export default {
  deleteWorkflow,
};
