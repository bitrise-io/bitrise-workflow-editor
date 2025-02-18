import { ButtonGroup, Divider, OverflowMenu, OverflowMenuItem } from '@bitrise/bitkit';
import { useSelection, useStepActions } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import generateUniqueEntityId from '@/core/utils/CommonUtils';
import StepService from '@/core/services/StepService';
import VersionUtils from '@/core/utils/VersionUtils';
import { Step } from '@/core/models/Step';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';

type StepCardMenuProps = {
  isHighlighted?: boolean;
  isUpgradable?: boolean;
  step?: Step;
  stepBundleId?: string;
  stepIndex: number;
  workflowId?: string;
};

const StepCardMenu = (props: StepCardMenuProps) => {
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

  const enableStepBundles = useFeatureFlag('enable-wfe-step-bundles-ui');
  const existingStepBundleIds = useBitriseYmlStore((s) => Object.keys(s.yml.step_bundles || {}));
  const { selectedStepIndices } = useSelection();

  const { isStep } = StepService;
  const defaultStepLibrary = useDefaultStepLibrary();
  const { library } = StepService.parseStepCVS(step?.cvs || '', defaultStepLibrary);
  const latestMajor = VersionUtils.latestMajor(step?.resolvedInfo?.versions)?.toString() ?? '';
  const isSimpleStep = step && isStep(step.cvs, library);

  const suffix = selectedStepIndices && selectedStepIndices.length > 1 ? 's' : '';

  const menuItems = [];
  if (isUpgradable && (selectedStepIndices?.length === 1 || !isHighlighted)) {
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
  if ((enableStepBundles || !stepBundleId) && isSimpleStep) {
    menuItems.push(
      <OverflowMenuItem
        key="group"
        leftIconName="Steps"
        onClick={(e) => {
          e.stopPropagation();
          if (onGroupStepsToStepBundle && selectedStepIndices) {
            const generatedId = generateUniqueEntityId(existingStepBundleIds, 'Step_bundle');
            const indices = isHighlighted ? selectedStepIndices : [stepIndex];
            onGroupStepsToStepBundle(workflowId, stepBundleId, generatedId, indices);
          }
        }}
      >
        New bundle with {isHighlighted ? selectedStepIndices?.length : 1} Step
        {suffix}
      </OverflowMenuItem>,
    );
  }
  if (selectedStepIndices?.length === 1 || !isHighlighted) {
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
  menuItems.push(
    <OverflowMenuItem
      isDanger
      key="remove"
      leftIconName="Trash"
      onClick={(e) => {
        e.stopPropagation();
        if (workflowId && onDeleteStep) {
          if (isHighlighted && selectedStepIndices) {
            onDeleteStep(workflowId, selectedStepIndices);
          } else {
            onDeleteStep(workflowId, [stepIndex]);
          }
        }
        if (stepBundleId && onDeleteStepInStepBundle) {
          if (isHighlighted && selectedStepIndices) {
            onDeleteStepInStepBundle(stepBundleId, selectedStepIndices);
          } else {
            onDeleteStepInStepBundle(stepBundleId, [stepIndex]);
          }
        }
      }}
    >
      Delete Step{suffix}
    </OverflowMenuItem>,
  );

  return (
    <ButtonGroup spacing="0" display="flex">
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
        {...menuItems}
      </OverflowMenu>
    </ButtonGroup>
  );
};

export default StepCardMenu;
