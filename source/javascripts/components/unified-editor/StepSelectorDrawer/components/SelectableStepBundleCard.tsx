import { Card, Popover, PopoverContent, PopoverTrigger, Text } from '@bitrise/bitkit';
import { useState } from 'react';

import StepBundleService from '@/core/services/StepBundleService';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';

import { WorkflowCardContextProvider } from '../../WorkflowCard/contexts/WorkflowCardContext';
import StepBundleCard from './StepBundleCard';

type SelectableStepBundleCardProps = {
  id: string;
  onClick: (id: string) => void;
};

const SelectableStepBundleCard = (props: SelectableStepBundleCardProps) => {
  const { id, onClick } = props;
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const dependants = useDependantWorkflows({ stepBundleCvs: StepBundleService.idToCvs(id) });
  const usedInWorkflowsText = StepBundleService.getUsedByText(dependants.length);

  const handleClick = () => {
    onClick(id);
    setIsPreviewMode(false);
  };

  return (
    <Popover trigger="hover" placement="left-start" offset={[0, 40]} isLazy>
      <PopoverTrigger>
        <Card
          as="button"
          variant="outline"
          padding="8px 12px"
          textAlign="left"
          _hover={{ borderColor: 'border/hover' }}
          onClick={handleClick}
        >
          <Text textStyle="body/lg/semibold" marginBlockEnd="4">
            {id}
          </Text>
          <Text textStyle="body/md/regular" color="text/secondary">
            {usedInWorkflowsText}
          </Text>
        </Card>
      </PopoverTrigger>
      <PopoverContent width={320}>
        <WorkflowCardContextProvider>
          <StepBundleCard
            uniqueId=""
            stepIndex={-1}
            cvs={StepBundleService.idToCvs(id)}
            isPreviewMode={isPreviewMode}
            isCollapsable={false}
          />
        </WorkflowCardContextProvider>
      </PopoverContent>
    </Popover>
  );
};

export default SelectableStepBundleCard;
