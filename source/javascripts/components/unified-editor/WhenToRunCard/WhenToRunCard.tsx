import { BitkitExpandableCard, BitkitIconButton, BitkitSwitch, IconRefresh } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Separator } from '@chakra-ui/react/separator';
import { Text } from '@chakra-ui/react/text';

import { useIsReadOnlyView } from '@/hooks/useTree';

import StepInput from '../StepConfigDrawer/components/StepInput';

type WhenToRunCardProps = {
  defaultValuesRunIf?: string;
  isAlwaysRun?: boolean;
  isSkippable?: boolean;
  onIsAlwaysRunChange: (isAlwaysRun: boolean) => void;
  onIsAlwaysRunReset?: VoidFunction;
  onIsSkippableChange?: (isSkippable: boolean) => void;
  onRunIfChange: (runIf: string) => void;
  userValuesRunIf?: string;
};

const WhenToRunCard = (props: WhenToRunCardProps) => {
  const isReadOnlyView = useIsReadOnlyView();
  const {
    defaultValuesRunIf,
    isAlwaysRun,
    isSkippable,
    onIsAlwaysRunChange,
    onIsAlwaysRunReset,
    onIsSkippableChange,
    onRunIfChange,
    userValuesRunIf,
  } = props;

  return (
    <BitkitExpandableCard elevation={false} title="When to run">
      <Box display="flex" alignItems="center" gap="4" minHeight="32">
        <Text flex="1">Run even if previous Step(s) failed</Text>
        {!!onIsAlwaysRunReset && (
          <BitkitIconButton
            icon={IconRefresh}
            label="Reset to default"
            size="sm"
            variant="tertiary"
            state={isReadOnlyView ? 'disabled' : undefined}
            onClick={onIsAlwaysRunReset}
          />
        )}
        <BitkitSwitch
          hideLabel
          label="Run even if previous Step(s) failed"
          defaultChecked={isAlwaysRun}
          state={isReadOnlyView ? 'disabled' : undefined}
          onCheckedChange={({ checked }) => onIsAlwaysRunChange(checked)}
        />
      </Box>
      <Separator marginBlock="24" />
      {!!onIsSkippableChange && (
        <>
          <Box display="flex">
            <Text flex="1">Continue build even if this Step fails</Text>
            <BitkitSwitch
              hideLabel
              label="Continue build even if this Step fails"
              defaultChecked={isSkippable}
              state={isReadOnlyView ? 'disabled' : undefined}
              onCheckedChange={({ checked }) => onIsSkippableChange(checked)}
            />
          </Box>
          <Separator marginBlock="24" />
        </>
      )}
      <StepInput
        label="Additional run conditions"
        helperText="Enter any valid **Go template** - the Step will only run if it evaluates to `true`, otherwise it won't run. You can refer to Env Vars and more, see the [docs for details](https://docs.bitrise.io/en/bitrise-ci/workflows-and-pipelines/steps/enabling-or-disabling-a-step-conditionally.html)."
        value={userValuesRunIf}
        defaultValue={defaultValuesRunIf}
        onChange={onRunIfChange}
      />
    </BitkitExpandableCard>
  );
};

export default WhenToRunCard;
