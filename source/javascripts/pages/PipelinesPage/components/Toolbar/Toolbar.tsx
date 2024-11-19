import { useMemo, useState } from 'react';
import { Box, BoxProps, Button, Dropdown, DropdownOption, DropdownSearch } from '@bitrise/bitkit';
import { useDebounceValue } from 'usehooks-ts';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import usePipelineSelector from '../../hooks/usePipelineSelector';

type Props = BoxProps & {
  onRunClick?: () => void;
  onWorkflowsClick?: () => void;
  onPropertiesClick?: () => void;
  onCreatePipelineClick?: () => void;
};

// TODO: Enable buttons when the feature is ready
const Toolbar = ({ onCreatePipelineClick, onRunClick, onWorkflowsClick, onPropertiesClick, ...props }: Props) => {
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

  const [search, setSearch] = useState('');

  const [debouncedSearch, setDebouncedSearch] = useDebounceValue('', 100);
  const [pipelineIds] = useMemo(() => {
    const ids: string[] = [];

    keys.forEach((id) => {
      if (id?.toLowerCase().includes(debouncedSearch?.toLowerCase())) {
        ids.push(id);
      }
    });

    return [ids];
  }, [debouncedSearch, keys]);

  const onSearchChange = (value: string) => {
    setSearch(value);
    setDebouncedSearch(value);
  };

  const isGraphPipelinesEnabled = useFeatureFlag('enable-dag-pipelines');

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
        flex="1"
        size="md"
        disabled={!hasOptions}
        value={selectedPipeline}
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
              onClick={onCreatePipelineClick}
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

      <Button size="md" variant="secondary" leftIconName="Play" isDisabled={isEmpty} onClick={onRunClick}>
        Run
      </Button>
    </Box>
  );
};

export default Toolbar;
