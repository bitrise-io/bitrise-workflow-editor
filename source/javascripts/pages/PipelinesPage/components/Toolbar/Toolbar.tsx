import {
  BitkitButton,
  BitkitSelect,
  IconPlay,
  IconPlus,
  IconPlusCircle,
  IconSettings,
  IconSparkleFilled,
} from '@bitrise/bitkit-v2';
import { Box, type BoxProps } from '@chakra-ui/react/box';
import { useMemo, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useAIButton from '@/hooks/useAIButton';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useIsMergedConfigSelected, useIsReadOnlyView, useTree } from '@/hooks/useTree';
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
  const tree = useTree();
  const isMergedConfigSelected = useIsMergedConfigSelected();
  const isModularFileTab = !!tree && !isMergedConfigSelected;
  const isReadOnlyView = useIsReadOnlyView();
  const [isOpen, setIsOpen] = useState(false);
  const { keys, options, selectedPipeline, onSelectPipeline } = usePipelineSelector();

  const {
    isVisible: isAIButtonVisible,
    tooltipLabel,
    getAIButtonProps,
  } = useAIButton({
    action: 'create_pipeline',
    source: 'pipeline_selector',
    yamlSelector: 'pipelines',
  });
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
    setIsOpen(false);
    onCreatePipelineClick?.();
  };

  const onCreatePipelineWithAI = () => {
    setIsOpen(false);
    onAIButtonClick();
  };

  const items = useMemo(
    () =>
      keys
        .filter((id) => id?.toLowerCase().includes(debouncedSearch?.toLowerCase()))
        .map((id) => ({ label: options[id], value: id })),
    [debouncedSearch, keys, options],
  );

  let runButtonDisabledReason;
  if (isModularFileTab) {
    runButtonDisabledReason = 'Only available in the Merged config tab';
  } else if (hasUnsavedChanges) {
    runButtonDisabledReason = 'Save changes before running';
  } else if (isEmpty) {
    runButtonDisabledReason = 'Add Workflows to the Pipeline before running';
  }

  return (
    <Box
      {...props}
      padding="8"
      gap="8"
      display="flex"
      boxShadow="elevation/lg"
      borderRadius="12"
      justifyContent="space-between"
      backgroundColor="background/primary"
    >
      <BitkitSelect
        flex="1"
        items={items}
        label="Pipeline"
        labelHidden
        placeholder={hasOptions ? 'Select a Pipeline' : 'Create a Pipeline first'}
        searchPlaceholder="Filter by name..."
        searchValue={search}
        selectProps={{ onOpenChange: ({ open }) => setIsOpen(open), open: isOpen }}
        size="md"
        state={hasOptions ? undefined : 'disabled'}
        value={selectedPipeline}
        onSearchChange={onSearchChange}
        onValueChange={(value) => onSelectPipeline(value || '')}
      >
        {/* Create actions are hidden (not disabled) on the read-only merged/ghost view (BIVS-3721). */}
        {!isReadOnlyView && (
          <BitkitSelect.Action icon={IconPlusCircle} label="Create Pipeline" onClick={onCreatePipeline} />
        )}
        {!isReadOnlyView && isAIButtonVisible && (
          <BitkitSelect.Action
            colorVariant="ai"
            icon={IconSparkleFilled}
            label="Create Pipeline with AI"
            state={isAIButtonDisabled ? 'disabled' : undefined}
            tooltip={tooltipLabel}
            onClick={onCreatePipelineWithAI}
          />
        )}
      </BitkitSelect>

      {shouldShowGraphPipelineActions && (
        <>
          <BitkitButton
            size="md"
            variant="secondary"
            icon={IconSettings}
            onClick={onPropertiesClick}
            data-clarity-unmask="true"
          >
            Properties
          </BitkitButton>
          {/* Adds workflows to the pipeline (a mutation) → hidden on the read-only merged/ghost view
              (BIVS-3721). Properties stays for inspection. */}
          {!isReadOnlyView && (
            <BitkitButton
              size="md"
              variant="secondary"
              icon={IconPlus}
              onClick={onWorkflowsClick}
              data-clarity-unmask="true"
            >
              Workflows
            </BitkitButton>
          )}
        </>
      )}

      {RuntimeUtils.isWebsiteMode() && (
        <BitkitButton
          size="md"
          variant="secondary"
          icon={IconPlay}
          state={runButtonDisabledReason ? 'disabled' : undefined}
          disabledReason={runButtonDisabledReason}
          onClick={onRunClick}
          data-clarity-unmask="true"
        >
          Run
        </BitkitButton>
      )}
    </Box>
  );
};

export default Toolbar;
