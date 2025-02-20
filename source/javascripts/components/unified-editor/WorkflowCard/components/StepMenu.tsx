import { Divider, OverflowMenu, OverflowMenuItem } from '@bitrise/bitkit';
import { useSelection, useStepActions } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import generateUniqueEntityId from '@/core/utils/CommonUtils';
import VersionUtils from '@/core/utils/VersionUtils';
import { Step } from '@/core/models/Step';

type StepMenuProps = {
  isHighlighted?: boolean;
  isUpgradable?: boolean;
  step?: Step;
  stepBundleId?: string;
  stepIndex: number;
  workflowId?: string;
};

const StepMenu = (props: StepMenuProps) => {
  const { isHighlighted, isUpgradable, step, stepBundleId, stepIndex, workflowId } = props;
  const {
    onCloneStep,
    onCloneStepInStepBundle,
    onDeleteStep,
    onDeleteStepInStepBundle,
    onGroupStepsToStepBundle,
    onUpgradeStep,
    onUpgradeStepInStepBundle,
  } = useStepActions();

  const existingStepBundleIds = useBitriseYmlStore((s) => Object.keys(s.yml.step_bundles || {}));

  const { selectedStepIndices } = useSelection();
  const finalIndices = isHighlighted && selectedStepIndices ? selectedStepIndices : [stepIndex];

  const latestMajor = VersionUtils.latestMajor(step?.resolvedInfo?.versions)?.toString() ?? '';
  const isClonable = onCloneStep || onCloneStepInStepBundle;
  const isDeletable = onDeleteStep || onDeleteStepInStepBundle;
  const suffix = finalIndices && finalIndices.length > 1 ? 's' : '';

  const menuItems = [];
  if (isUpgradable && finalIndices.length === 1) {
    menuItems.push(
      <OverflowMenuItem
        key="upgrade"
        leftIconName="ArrowUp"
        onClick={(e) => {
          e.stopPropagation();
          if (workflowId && onUpgradeStep) {
            onUpgradeStep(workflowId, stepIndex, latestMajor);
          }
          if (stepBundleId && onUpgradeStepInStepBundle) {
            onUpgradeStepInStepBundle(stepBundleId, stepIndex, latestMajor);
          }
        }}
      >
        Update Step version
      </OverflowMenuItem>,
    );
  }

  if (onGroupStepsToStepBundle) {
    menuItems.push(
      <OverflowMenuItem
        key="group"
        leftIconName="Steps"
        onClick={(e) => {
          e.stopPropagation();
          if (onGroupStepsToStepBundle && finalIndices) {
            const generatedId = generateUniqueEntityId(existingStepBundleIds, 'Step_bundle');
            onGroupStepsToStepBundle(workflowId, stepBundleId, generatedId, finalIndices);
          }
        }}
      >
        New bundle with {finalIndices.length} Step
        {suffix}
      </OverflowMenuItem>,
    );
  }
  if (isClonable && finalIndices.length === 1) {
    menuItems.push(
      <OverflowMenuItem
        key="duplicate"
        leftIconName="Duplicate"
        onClick={(e) => {
          e.stopPropagation();
          if (workflowId && onCloneStep) {
            onCloneStep(workflowId, stepIndex);
          }
          if (stepBundleId && onCloneStepInStepBundle) {
            onCloneStepInStepBundle(stepBundleId, stepIndex);
          }
        }}
      >
        Duplicate Step
      </OverflowMenuItem>,
    );
  }
  if (menuItems.length > 0) {
    menuItems.push(<Divider key="divider" my="8" />);
  }

  if (isDeletable) {
    menuItems.push(
      <OverflowMenuItem
        isDanger
        key="delete"
        leftIconName="Trash"
        onClick={(e) => {
          e.stopPropagation();
          if (workflowId && onDeleteStep) {
            onDeleteStep(workflowId, finalIndices);
          }
          if (stepBundleId && onDeleteStepInStepBundle) {
            onDeleteStepInStepBundle(stepBundleId, finalIndices);
          }
        }}
      >
        Delete Step{suffix}
      </OverflowMenuItem>,
    );
  }

  return (
    <OverflowMenu
      placement="bottom-end"
      size="md"
      buttonSize="xs"
      buttonProps={{
        'aria-label': 'Show step actions',
        iconName: 'MoreVertical',
        onClick: (e) => {
          e.stopPropagation();
        },
        display: 'none',
        _groupHover: { display: 'inline-flex' },
        _active: { display: 'inline-flex' },
      }}
    >
      {menuItems}
    </OverflowMenu>
  );
};

export default StepMenu;
