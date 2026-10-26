import {
  BitkitActionMenu,
  BitkitControlButton,
  IconArrowUp,
  IconCopy,
  IconMoreVertical,
  IconStep,
  IconTrash,
} from '@bitrise/bitkit-v2';

import { useSelection, useStepActions } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';
import { Step } from '@/core/models/Step';
import { generateUniqueEntityId } from '@/core/utils/CommonUtils';
import VersionUtils from '@/core/utils/VersionUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type StepMenuProps = {
  isHighlighted?: boolean;
  isUpgradable?: boolean;
  forceVisible?: boolean;
  step?: Step;
  stepBundleId?: string;
  stepIndex: number;
  workflowId?: string;
};

const StepMenu = (props: StepMenuProps) => {
  const { isHighlighted, isUpgradable, forceVisible, step, stepBundleId, stepIndex, workflowId } = props;
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
      <BitkitActionMenu.Item
        key="upgrade"
        icon={IconArrowUp}
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
        Update version
      </BitkitActionMenu.Item>,
    );
  }

  if (onGroupStepsToStepBundle) {
    menuItems.push(
      <BitkitActionMenu.Item
        key="group"
        icon={IconStep}
        onClick={(e) => {
          e.stopPropagation();
          if (onGroupStepsToStepBundle && finalIndices) {
            const generatedId = generateUniqueEntityId(existingStepBundleIds, 'Step_bundle');
            onGroupStepsToStepBundle(workflowId, stepBundleId, generatedId, finalIndices);
          }
        }}
      >
        New bundle with {finalIndices.length} item{suffix}
      </BitkitActionMenu.Item>,
    );
  }
  if (isClonable && finalIndices.length === 1) {
    menuItems.push(
      <BitkitActionMenu.Item
        key="duplicate"
        icon={IconCopy}
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
        Duplicate
      </BitkitActionMenu.Item>,
    );
  }
  if (menuItems.length > 0) {
    menuItems.push(<BitkitActionMenu.Separator key="divider" />);
  }

  if (isDeletable) {
    menuItems.push(
      <BitkitActionMenu.Item
        isDanger
        key="delete"
        icon={IconTrash}
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
        Delete item{suffix}
      </BitkitActionMenu.Item>,
    );
  }

  return (
    <BitkitActionMenu
      size="md"
      positioning={{ placement: 'bottom-end' }}
      trigger={
        <BitkitControlButton
          icon={IconMoreVertical}
          label="Show step actions"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
          }}
          display={forceVisible ? 'inline-flex' : 'none'}
          _groupHover={{ display: 'inline-flex' }}
          _open={{ display: 'inline-flex' }}
        />
      }
    >
      {menuItems}
    </BitkitActionMenu>
  );
};

export default StepMenu;
