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
import { Separator } from '@chakra-ui/react/separator';
import { Text } from '@chakra-ui/react/text';
import { forwardRef, useCallback, useMemo, useState } from 'react';

import { FLOATING_DRAWER_WIDTH } from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import PipelineService from '@/core/services/PipelineService';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useShallow } from '@/hooks/useShallow';
import { useIsMergedConfigSelected, useIsReadOnlyView, useTree } from '@/hooks/useTree';
import useYmlHasChanges from '@/hooks/useYmlHasChanges';

import usePipelineSelector from '../../hooks/usePipelineSelector';
import useRenamePipeline from '../../hooks/useRenamePipeline';
import { PipelinesPageDialogType, usePipelinesPageStore } from '../../PipelinesPage.store';
import DeletePipelineDialog from '../PipelineConfigDrawer/components/DeletePipelineDialog/DeletePipelineDialog';

const DIALOGS_WITHOUT_DRAWER = [
  PipelinesPageDialogType.NONE,
  PipelinesPageDialogType.START_BUILD,
  PipelinesPageDialogType.CREATE_PIPELINE,
];

type Props = BoxProps & {
  onRunClick?: () => void;
  onPropertiesClick?: () => void;
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
      height="32"
      paddingInline="8"
      borderRadius="4"
      color="text/primary"
      cursor="pointer"
      _hover={{ backgroundColor: 'background/hover' }}
      _focusVisible={{ outline: '2px solid', outlineColor: 'border/focus' }}
      {...props}
    >
      {/* The Pipeline's name is customer data: keep it out of session recordings. */}
      <Text textStyle="body/lg/semibold" truncate data-clarity-mask="true">
        {title}
      </Text>
      <IconChevronDown size="16" color="icon/secondary" flexShrink={0} />
    </Box>
  );
});

// Renaming happens in place: the title turns into its own text field. Enter or leaving the field saves,
// Escape cancels. The rename itself runs in the toolbar, which outlives this field.
const NameEditor = ({
  pipelineId,
  onRename,
  onDone,
}: {
  pipelineId: string;
  onRename: (newPipelineId: string) => void;
  onDone: () => void;
}) => {
  const { keys } = usePipelineSelector();
  const [value, setValue] = useState(pipelineId);
  const validation = PipelineService.validateName(value, pipelineId, keys);
  const error = validation === true ? undefined : validation;

  const commit = () => {
    if (error) {
      return;
    }
    if (value !== pipelineId) {
      onRename(value);
    }
    onDone();
  };

  return (
    <Box position="relative" width="320px" maxWidth="100%" data-clarity-mask="true">
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
      {/* Under the field, over the canvas, so an error doesn't push the header taller. */}
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

const Toolbar = ({ onRunClick, onPropertiesClick, ...props }: Props) => {
  const hasUnsavedChanges = useYmlHasChanges();
  const tree = useTree();
  const isMergedConfigSelected = useIsMergedConfigSelected();
  const isReadOnlyView = useIsReadOnlyView();
  const isModularFileTab = !!tree && !isMergedConfigSelected;
  // The sidebar's Building blocks list picks the Pipeline; the header names it and holds its actions.
  const { keys, options, selectedPipeline, onSelectPipeline } = usePipelineSelector();
  const { isDrawerOpen, closeDialog, setPipelineId } = usePipelinesPageStore(
    useShallow((s) => ({
      isDrawerOpen: s.isSwitchingDialog || !DIALOGS_WITHOUT_DRAWER.includes(s.openedDialogType),
      closeDialog: s.closeDialog,
      setPipelineId: s.setPipelineId,
    })),
  );

  const [isRenaming, setIsRenaming] = useState(false);
  const { open: isDeleteDialogOpen, onOpen: onOpenDeleteDialog, onClose: onCloseDeleteDialog } = useDisclosure();
  const renamePipeline = useRenamePipeline(onSelectPipeline);
  const handleRename = useCallback(
    (newPipelineId: string) => {
      setPipelineId(newPipelineId);
      renamePipeline(newPipelineId);
    },
    [renamePipeline, setPipelineId],
  );
  const handleDeletePipeline = useCallback(
    (deletedId: string) => {
      closeDialog();
      onSelectPipeline(keys.filter((key) => key !== deletedId)[0]);
    },
    [closeDialog, keys, onSelectPipeline],
  );

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

  const runButtonTooltip = useMemo(() => {
    if (isModularFileTab) {
      return 'Only available in the Merged config tab';
    }

    if (hasUnsavedChanges) {
      return 'Save changes before running';
    }

    return 'Run Pipeline';
  }, [hasUnsavedChanges, isModularFileTab]);

  const isRunDisabled = isEmpty || isModularFileTab || hasUnsavedChanges;

  let title = <Text textStyle="body/lg/semibold">No Pipeline selected</Text>;
  if (selectedPipeline && isRenaming) {
    title = <NameEditor pipelineId={selectedPipeline} onRename={handleRename} onDone={() => setIsRenaming(false)} />;
  } else if (selectedPipeline) {
    title = (
      <BitkitActionMenu size="md" trigger={<TitleTrigger title={options[selectedPipeline]} />}>
        <BitkitActionMenu.Item icon={IconPencil} disabled={isReadOnlyView} onClick={() => setIsRenaming(true)}>
          Rename
        </BitkitActionMenu.Item>
        {shouldShowGraphPipelineActions && (
          <BitkitActionMenu.Item icon={IconSettings} onClick={onPropertiesClick}>
            Edit properties
          </BitkitActionMenu.Item>
        )}
        <BitkitActionMenu.Separator />
        <BitkitActionMenu.Item icon={IconTrash} isDanger disabled={isReadOnlyView} onClick={onOpenDeleteDialog}>
          Delete
        </BitkitActionMenu.Item>
      </BitkitActionMenu>
    );
  }

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap="8"
        height="64"
        flexShrink={0}
        paddingInlineStart="16"
        // Keeps the header centred on the canvas an open drawer leaves visible, as the canvas below does.
        paddingInlineEnd={['16', isDrawerOpen ? `calc(${FLOATING_DRAWER_WIDTH} + 32px)` : '16']}
        transition="padding-inline-end 200ms"
        backgroundColor="background/primary"
        borderBlockEnd="1px solid"
        borderColor="border/regular"
        {...props}
      >
        {/* The name, then its actions right after it: one group in the middle of the header. */}
        <Box display="flex" minWidth="0">
          {title}
        </Box>

        {(shouldShowGraphPipelineActions || RuntimeUtils.isWebsiteMode()) && (
          <Separator orientation="vertical" height="24" flexShrink={0} />
        )}

        {shouldShowGraphPipelineActions && (
          <BitkitControlButton
            size="sm"
            icon={IconSettings}
            label="Settings"
            onClick={onPropertiesClick}
            data-clarity-unmask="true"
          />
        )}

        {RuntimeUtils.isWebsiteMode() && (
          // The label is the control's tooltip, so it also says why Run is unavailable.
          <BitkitControlButton
            size="sm"
            icon={IconPlay}
            label={runButtonTooltip}
            state={isRunDisabled ? 'disabled' : undefined}
            onClick={onRunClick}
            data-clarity-unmask="true"
          />
        )}
      </Box>

      {selectedPipeline && (
        <DeletePipelineDialog
          pipelineId={selectedPipeline}
          isOpen={isDeleteDialogOpen}
          onClose={onCloseDeleteDialog}
          onDeletePipeline={handleDeletePipeline}
        />
      )}
    </>
  );
};

export default Toolbar;
