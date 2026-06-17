import { Card, Popover, PopoverContent, PopoverTrigger, Text } from '@bitrise/bitkit';
import { memo } from 'react';

import CrossFileProvenanceText from '@/components/CrossFileProvenanceText';
import WorkflowCard from '@/components/unified-editor/WorkflowCard/WorkflowCard';
import WorkflowService from '@/core/services/WorkflowService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useCrossFileEntity } from '@/hooks/useTree';
import useWorkflow from '@/hooks/useWorkflow';
import useWorkflowStackName from '@/hooks/useWorkflowStackName';

type Props = {
  id: string;
  onClick?: VoidFunction;
};

const SelectableWorkflowCard = ({ id, onClick }: Props) => {
  const workflow = useWorkflow(id, (s) => (s?.id ? { title: s.userValues.title } : undefined));
  const stackName = useWorkflowStackName(id);
  const crossFile = useCrossFileEntity('workflows', id);

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
        <Card
          py="8"
          px="16"
          role="button"
          variant="outline"
          onClick={onClick}
          _hover={{ boxShadow: 'small', borderColor: 'border/hover' }}
        >
          <Text textStyle="body/lg/semibold">{workflow?.title || id}</Text>
          <Text textStyle="body/sm/regular" color="text/secondary">
            {/* A cross-file workflow's pipeline-usage + stack live in its defining
                module, not this file — show provenance instead of stale counts. */}
            {crossFile.isCrossFile ? (
              <CrossFileProvenanceText definingPath={crossFile.definingPath} sourceLabel={crossFile.sourceLabel} />
            ) : (
              <>
                {usedInPipelinesText}
                {' • '}
                {stackName}
              </>
            )}
          </Text>
        </Card>
      </PopoverTrigger>
      <PopoverContent width={320}>
        <WorkflowCard id={id} />
      </PopoverContent>
    </Popover>
  );
};

export default memo(SelectableWorkflowCard);
