import { Popover, PopoverContent, PopoverTrigger } from '@bitrise/bitkit';
import { Card } from '@chakra-ui/react/card';
import { Text } from '@chakra-ui/react/text';
import { memo } from 'react';

import EntityModuleProvenance from '@/components/EntityModuleProvenance';
import WorkflowCard from '@/components/unified-editor/WorkflowCard/WorkflowCard';
import WorkflowService from '@/core/services/WorkflowService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useWorkflow from '@/hooks/useWorkflow';
import useWorkflowStackName from '@/hooks/useWorkflowStackName';

type Props = {
  id: string;
  onClick?: VoidFunction;
};

const SelectableWorkflowCard = ({ id, onClick }: Props) => {
  const workflow = useWorkflow(id, (s) => (s?.id ? { title: s.userValues.title } : undefined));
  const stackName = useWorkflowStackName(id);

  const usedInPipelinesText = useBitriseYmlStore(({ yml: { pipelines, stages } }) => {
    const count = WorkflowService.countInPipelines(id, pipelines, stages);

    if (count === 0) {
      return 'Not used by other Pipelines';
    }

    if (count === 1) {
      return 'Used in 1 Pipeline';
    }

    return `Used in ${count} Pipelines`;
  });

  return (
    <Popover trigger="hover" placement="left-start" offset={[0, 40]} isLazy>
      <PopoverTrigger>
        <Card.Root elevation={false} interactive paddingBlock="8" paddingInline="16" role="button" onClick={onClick}>
          <Text textStyle="body/lg/semibold">{workflow?.title || id}</Text>
          <Text textStyle="body/sm/regular" color="text/secondary">
            {/* When the workflow is (also) defined in another module, surface that instead of
                pipeline-usage + stack counts, which live in the defining module, not this file. */}
            {/* The card is itself a click target (selects the workflow); the jump-to-definition lives
                in the hover preview (WorkflowCard) to avoid a nested interactive control. */}
            <EntityModuleProvenance
              kind="workflows"
              id={id}
              withJumpLink={false}
              fallback={
                <>
                  {usedInPipelinesText}
                  {' • '}
                  {stackName}
                </>
              }
            />
          </Text>
        </Card.Root>
      </PopoverTrigger>
      <PopoverContent width={320}>
        <WorkflowCard id={id} />
      </PopoverContent>
    </Popover>
  );
};

export default memo(SelectableWorkflowCard);
