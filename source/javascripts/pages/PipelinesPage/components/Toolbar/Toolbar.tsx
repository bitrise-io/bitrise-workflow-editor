import {
  BitkitActionMenu,
  BitkitControlButton,
  BitkitTextInput,
  IconChevronDown,
  IconPencil,
  IconPlay,
  IconSettings,
  IconTrash,
} from '@bitrise/bitkit-v2';
import { Box, type BoxProps } from '@chakra-ui/react/box';
import { useDisclosure } from '@chakra-ui/react/hooks';
import { Text } from '@chakra-ui/react/text';
import { createContext, forwardRef, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import PipelineService from '@/core/services/PipelineService';
import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WindowUtils from '@/core/utils/WindowUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useIsMergedConfigSelected, useIsReadOnlyView, useTree } from '@/hooks/useTree';
import useYmlHasChanges from '@/hooks/useYmlHasChanges';

import usePipelineSelector from '../../hooks/usePipelineSelector';
import useRenamePipeline from '../../hooks/useRenamePipeline';
import { PipelinesPageDialogType, usePipelinesPageStore } from '../../PipelinesPage.store';
import DeletePipelineDialog from '../PipelineConfigDrawer/components/DeletePipelineDialog/DeletePipelineDialog';

type PipelineActions = {
  run: () => void;
  editProperties: () => void;
  rename: (newPipelineId: string) => void;
  requestDelete: () => void;
};

const noop = () => undefined;
const PipelineActionsContext = createContext<PipelineActions>({
  run: noop,
  editProperties: noop,
  rename: noop,
  requestDelete: noop,
});

// The Pipeline's actions live above the canvas, because the canvas is rebuilt whenever the selected
// Pipeline changes, as it does mid-rename and after a delete. The controls on the canvas only call them.
export const PipelineActionsProvider = ({ children }: PropsWithChildren) => {
  const { keys, selectedPipeline, onSelectPipeline } = usePipelineSelector();
  const openDialog = usePipelinesPageStore((s) => s.openDialog);
  const closeDialog = usePipelinesPageStore((s) => s.closeDialog);
  const setPipelineId = usePipelinesPageStore((s) => s.setPipelineId);
  const { open: isDeleteDialogOpen, onOpen: requestDelete, onClose: onCloseDeleteDialog } = useDisclosure();
  const renamePipeline = useRenamePipeline(onSelectPipeline);

  const actions = useMemo<PipelineActions>(
    () => ({
      run: () => {
        const shouldShowTrialUpsellDialog = Boolean(
          GlobalProps.workspace()?.isRestricted && PageProps.app()?.hasAnyBuild,
        );
        if (shouldShowTrialUpsellDialog) {
          WindowUtils.postMessageToParent('OPEN_TRIAL_UPSELL_DIALOG', { reason: 'pipeline_run' });
        } else {
          openDialog({ type: PipelinesPageDialogType.START_BUILD, pipelineId: selectedPipeline })();
        }
      },
      editProperties: openDialog({ type: PipelinesPageDialogType.PIPELINE_CONFIG, pipelineId: selectedPipeline }),
      rename: (newPipelineId: string) => {
        setPipelineId(newPipelineId);
        renamePipeline(newPipelineId);
      },
      requestDelete,
    }),
    [openDialog, renamePipeline, requestDelete, selectedPipeline, setPipelineId],
  );

  const handleDeletePipeline = useCallback(
    (deletedId: string) => {
      closeDialog();
      onSelectPipeline(keys.filter((key) => key !== deletedId)[0]);
    },
    [closeDialog, keys, onSelectPipeline],
  );

  return (
    <PipelineActionsContext.Provider value={actions}>
      {children}
      {selectedPipeline && (
        <DeletePipelineDialog
          pipelineId={selectedPipeline}
          isOpen={isDeleteDialogOpen}
          onClose={onCloseDeleteDialog}
          onDeletePipeline={handleDeletePipeline}
        />
      )}
    </PipelineActionsContext.Provider>
  );
};

// The Pipeline's name, opening its actions. Bitkit has no title-with-menu trigger (a design-system gap),
// so it's built here from tokens; it forwards its ref because the menu anchors to it.
const TitleTrigger = forwardRef<HTMLButtonElement, { title: string }>(function TitleTrigger({ title, ...props }, ref) {
  return (
    <Box
      as="button"
      ref={ref}
      display="flex"
      alignItems="center"
      gap="4"
      minWidth="0"
      height="24"
      paddingInline="4"
      borderRadius="4"
      color="text/primary"
      cursor="pointer"
      _hover={{ backgroundColor: 'background/hover' }}
      _focusVisible={{ outline: '2px solid', outlineColor: 'border/focus' }}
      {...props}
    >
      {/* The Pipeline's name is customer data: keep it out of session recordings. */}
      <Text textStyle="body/md/semibold" truncate data-clarity-mask="true">
        {title}
      </Text>
      <IconChevronDown size="16" color="icon/secondary" flexShrink={0} />
    </Box>
  );
});

// Renaming happens in place: the name turns into its own text field. Enter or leaving the field saves,
// Escape cancels.
const NameEditor = ({ pipelineId, onDone }: { pipelineId: string; onDone: () => void }) => {
  const { keys } = usePipelineSelector();
  const { rename } = useContext(PipelineActionsContext);
  const [value, setValue] = useState(pipelineId);
  const validation = PipelineService.validateName(value, pipelineId, keys);
  const error = validation === true ? undefined : validation;

  const commit = () => {
    if (error) {
      return;
    }
    if (value !== pipelineId) {
      rename(value);
    }
    onDone();
  };

  return (
    <Box position="relative" width="240px" data-clarity-mask="true">
      <BitkitTextInput
        size="md"
        label="Pipeline name"
        labelHidden
        value={value}
        state={error ? 'error' : undefined}
        onValueChange={(next) => setValue(PipelineService.sanitizeName(next))}
        inputProps={{
          autoFocus: true,
          onFocus: (e) => e.target.select(),
          onKeyDown: (e) => {
            if (e.key === 'Enter') {
              commit();
            } else if (e.key === 'Escape') {
              onDone();
            }
          },
          onBlur: () => (error ? onDone() : commit()),
        }}
      />
      {/* Under the field, over the canvas, so an error doesn't move the field. */}
      {error && (
        <Text
          position="absolute"
          insetBlockStart="calc(100% + 4px)"
          insetInline="0"
          zIndex="1"
          textStyle="body/sm/regular"
          color="text/negative"
        >
          {error}
        </Text>
      )}
    </Box>
  );
};

// The Pipeline's name with its menu, then Run, in a card floating over the canvas.
const Toolbar = (props: BoxProps) => {
  const hasUnsavedChanges = useYmlHasChanges();
  const tree = useTree();
  const isMergedConfigSelected = useIsMergedConfigSelected();
  const isReadOnlyView = useIsReadOnlyView();
  const isModularFileTab = !!tree && !isMergedConfigSelected;
  const { options, selectedPipeline } = usePipelineSelector();
  const { run, editProperties, requestDelete } = useContext(PipelineActionsContext);
  const [isRenaming, setIsRenaming] = useState(false);

  const isGraph = useBitriseYmlStore((s) => Boolean(s.yml.pipelines?.[selectedPipeline]?.workflows));
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

  let runLabel = 'Run Pipeline';
  if (isModularFileTab) {
    runLabel = 'Only available in the Merged config tab';
  } else if (hasUnsavedChanges) {
    runLabel = 'Save changes before running';
  }
  const isRunDisabled = isEmpty || isModularFileTab || hasUnsavedChanges;

  let title = (
    <Text textStyle="body/md/semibold" paddingInline="4">
      No Pipeline selected
    </Text>
  );
  if (selectedPipeline && isRenaming) {
    title = <NameEditor pipelineId={selectedPipeline} onDone={() => setIsRenaming(false)} />;
  } else if (selectedPipeline) {
    title = (
      <BitkitActionMenu size="md" trigger={<TitleTrigger title={options[selectedPipeline]} />}>
        <BitkitActionMenu.Item icon={IconPencil} disabled={isReadOnlyView} onClick={() => setIsRenaming(true)}>
          Rename
        </BitkitActionMenu.Item>
        {isGraph && (
          <BitkitActionMenu.Item icon={IconSettings} onClick={editProperties}>
            Edit properties
          </BitkitActionMenu.Item>
        )}
        <BitkitActionMenu.Separator />
        <BitkitActionMenu.Item icon={IconTrash} isDanger disabled={isReadOnlyView} onClick={requestDelete}>
          Delete
        </BitkitActionMenu.Item>
      </BitkitActionMenu>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap="2" minWidth="0" {...props}>
      {title}
      {RuntimeUtils.isWebsiteMode() && (
        // The label is the control's tooltip, so it also says why Run is unavailable.
        <BitkitControlButton
          size="xs"
          icon={IconPlay}
          label={runLabel}
          state={isRunDisabled ? 'disabled' : undefined}
          onClick={run}
          data-clarity-unmask="true"
        />
      )}
    </Box>
  );
};

export default Toolbar;

// The card the controls float in, over the canvas's top-left: the original floating toolbar's look,
// sized to its contents.
export const FLOATING_CONTROLS_HEIGHT = 40;
export const floatingControlsProps = {
  display: 'flex',
  alignItems: 'center',
  minHeight: `${FLOATING_CONTROLS_HEIGHT}px`,
  paddingInline: '8',
  borderRadius: '12',
  boxShadow: 'elevation/lg',
  background: 'background/primary',
} satisfies BoxProps;
