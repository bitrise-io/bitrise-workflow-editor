import { Box, BoxProps, Button, Dropdown, DropdownOption, DropdownSearch, Icon, Tooltip } from '@bitrise/bitkit';
import { useMemo, useRef, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import useAIButton from '@/components/unified-editor/ContainersTab/hooks/useAIButton';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useYmlHasChanges from '@/hooks/useYmlHasChanges';

import usePipelineSelector from '../../hooks/usePipelineSelector';

type Props = BoxProps & {
  onRunClick?: () => void;
  onWorkflowsClick?: () => void;
  onPropertiesClick?: () => void;
  onCreatePipelineClick?: () => void;
};

const Toolbar = ({ onCreatePipelineClick, onRunClick, onWorkflowsClick, onPropertiesClick, ...props }: Props) => {
  const hasUnsavedChanges = useYmlHasChanges();
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const { keys, options, selectedPipeline, onSelectPipeline } = usePipelineSelector();

  const {
    isVisible: isAIButtonVisible,
    tooltipLabel,
    getAIButtonProps,
  } = useAIButton({ selectedPage: 'pipelines', yamlSelector: 'pipeline' });
  const { isDisabled: isAIButtonDisabled, onClick: onAIButtonClick } = getAIButtonProps();

  const hasOptions = keys.length > 0;
  const shouldShowGraphPipelineActions = useBitriseYmlStore((s) => s.yml.pipelines?.[selectedPipeline]?.workflows);
  const isEmpty = useBitriseYmlStore((s) => {
    const pipeline = s.yml.pipelines?.[selectedPipeline];

    if (pipeline?.workflows) {
      return Object.keys(pipeline.workflows).length === 0;
    }

    if (pipeline?.stages) {
      return pipeline.stages.length === 0;
    }

    return true;
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useDebounceValue('', 100);

  const onSearchChange = (value: string) => {
    setSearch(value);
    setDebouncedSearch(value);
  };

  const onCreatePipeline = () => {
    onCreatePipelineClick?.();
    dropdownRef.current?.click(); // NOTE: It closes the dropdown...
  };

  const onCreatePipelineWithAI = () => {
    onAIButtonClick();
    dropdownRef.current?.click();
  };

  const [pipelineIds] = useMemo(() => {
    const ids: string[] = [];

    keys.forEach((id) => {
      if (id?.toLowerCase().includes(debouncedSearch?.toLowerCase())) {
        ids.push(id);
      }
    });

    return [ids];
  }, [debouncedSearch, keys]);

  const runButtonAriaLabel = useMemo(() => {
    if (hasUnsavedChanges) {
      return 'Save changes before running';
    }

    return 'Run Pipeline';
  }, [hasUnsavedChanges]);

  return (
    <Box
      sx={{ '--dropdown-floating-max': '359px' }}
      {...props}
      p="8"
      gap="8"
      display="flex"
      boxShadow="large"
      borderRadius="12"
      justifyContent="space-between"
      backgroundColor="background/primary"
    >
      <Dropdown
        ref={dropdownRef}
        flex="1"
        size="md"
        disabled={!hasOptions}
        value={selectedPipeline}
        formLabel={selectedPipeline ?? 'Select a Pipeline'}
        onChange={(e) => onSelectPipeline(e.target.value || '')}
        placeholder={!hasOptions ? `Create a Pipeline first` : undefined}
        search={<DropdownSearch placeholder="Filter by name..." value={search} onChange={onSearchChange} />}
      >
        {pipelineIds.map((key) => (
          <DropdownOption value={key} key={key}>
            {options[key]}
          </DropdownOption>
        ))}
        <Box
          w="100%"
          mt="8"
          py="12"
          mb="-12"
          bottom="-12"
          position="sticky"
          borderTop="1px solid"
          borderColor="border/regular"
          backgroundColor="background/primary"
        >
          <Button
            w="100%"
            border="none"
            textStyle="body/lg/regular"
            borderRadius="0"
            variant="secondary"
            leftIconName="PlusCircle"
            justifyContent="flex-start"
            onClick={onCreatePipeline}
          >
            Create Pipeline
          </Button>
          {isAIButtonVisible && (
            <Tooltip label={tooltipLabel} isDisabled={!tooltipLabel} display="block">
              <Button
                w="100%"
                border="none"
                textStyle="body/lg/regular"
                borderRadius="0"
                variant="secondary"
                leftIcon={
                  <Icon
                    name="SparkleFilled"
                    size="24"
                    color={isAIButtonDisabled ? 'status/ai/disabled' : 'status/ai/icon'}
                  />
                }
                justifyContent="flex-start"
                isDisabled={isAIButtonDisabled}
                _disabled={{
                  backgroundColor: 'background/primary',
                  color: 'button/secondary/fg-disabled',
                }}
                onClick={onCreatePipelineWithAI}
              >
                Create Pipeline with AI
              </Button>
            </Tooltip>
          )}
        </Box>
      </Dropdown>

      {shouldShowGraphPipelineActions && (
        <>
          <Button size="md" variant="secondary" leftIconName="Settings" onClick={onPropertiesClick}>
            Properties
          </Button>
          <Button size="md" variant="secondary" leftIconName="Plus" onClick={onWorkflowsClick}>
            Workflows
          </Button>
        </>
      )}

      {RuntimeUtils.isWebsiteMode() && (
        <Button
          size="md"
          variant="secondary"
          leftIconName="Play"
          aria-label={runButtonAriaLabel}
          isDisabled={isEmpty || hasUnsavedChanges}
          onClick={onRunClick}
        >
          Run
        </Button>
      )}
    </Box>
  );
};

export default Toolbar;
