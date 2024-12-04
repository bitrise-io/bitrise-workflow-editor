import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, BoxProps, Button, Dropdown, DropdownOption, DropdownSearch } from '@bitrise/bitkit';
import { useDebounceValue } from 'usehooks-ts';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import usePipelineSelector from '../../hooks/usePipelineSelector';

type Props = BoxProps & {
  onRunClick?: () => void;
  onWorkflowsClick?: () => void;
  onPropertiesClick?: () => void;
  onCreatePipelineClick?: () => void;
};

// TODO: Enable buttons when the feature is ready
const Toolbar = ({ onCreatePipelineClick, onRunClick, onWorkflowsClick, onPropertiesClick, ...props }: Props) => {
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const { keys, options, selectedPipeline, onSelectPipeline } = usePipelineSelector();

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

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
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

  const [pipelineIds] = useMemo(() => {
    const ids: string[] = [];

    keys.forEach((id) => {
      if (id?.toLowerCase().includes(debouncedSearch?.toLowerCase())) {
        ids.push(id);
      }
    });

    return [ids];
  }, [debouncedSearch, keys]);

  const isGraphPipelinesEnabled = useFeatureFlag('enable-dag-pipelines');
  useEffect(() => {
    const listener = (event: CustomEvent<boolean>) => {
      setHasUnsavedChanges(event.detail);
    };

    window.addEventListener('main::yml::has-unsaved-changes' as never, listener);

    return () => window.removeEventListener('main::yml::has-unsaved-changes' as never, listener);
  }, []);

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
        {isGraphPipelinesEnabled && (
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
              fontWeight="400"
              borderRadius="0"
              variant="secondary"
              leftIconName="PlusCircle"
              justifyContent="flex-start"
              onClick={onCreatePipeline}
            >
              Create Pipeline
            </Button>
          </Box>
        )}
      </Dropdown>

      {shouldShowGraphPipelineActions && isGraphPipelinesEnabled && (
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
