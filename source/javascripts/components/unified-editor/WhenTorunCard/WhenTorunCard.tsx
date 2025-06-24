import { Box, Divider, ExpandableCard, IconButton, Text, Toggle } from '@bitrise/bitkit';
import { ChangeEventHandler } from 'react';

import StepInput from '../StepConfigDrawer/components/StepInput';

type WhenToRunCardPorps = {
  defaultValuesRunIf?: string;
  isAlwaysRun?: boolean;
  isSkippable?: boolean;
  onIsAlwaysRunChange: ChangeEventHandler<HTMLInputElement>;
  onIsAlwaysRunReset?: VoidFunction;
  onIsSkippableChange?: ChangeEventHandler<HTMLInputElement>;
  onRunIfChange: (runIf: string) => void;
  userValuesRunIf?: string;
};

const WhenToRunCard = (props: WhenToRunCardPorps) => {
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
    <ExpandableCard buttonContent={<Text textStyle="body/lg/semibold">When to run</Text>}>
      <Box display="flex" paddingBlockStart="4" alignItems="center" gap="4" minHeight="32">
        <Text flex="1">Run even if previous Step(s) failed</Text>
        {!!onIsAlwaysRunReset && (
          <IconButton
            iconName="Refresh"
            aria-label="Reset to default"
            size="sm"
            variant="tertiary"
            onClick={onIsAlwaysRunReset}
          />
        )}
        <Toggle defaultChecked={isAlwaysRun} onChange={onIsAlwaysRunChange} />
      </Box>
      <Divider my="24" />
      {!!onIsSkippableChange && (
        <>
          <Box display="flex">
            <Text flex="1">Continue build even if this Step fails</Text>
            <Toggle defaultChecked={isSkippable} onChange={onIsSkippableChange} />
          </Box>
          <Divider my="24" />
        </>
      )}
      <StepInput
        label="Additional run conditions"
        helperText="Enter any valid **Go template** - the Step will only run if it evaluates to `true`, otherwise it won't run. You can refer to Env Vars and more, see the [docs for details](https://devcenter.bitrise.io/en/steps-and-workflows/introduction-to-steps/enabling-or-disabling-a-step-conditionally.html)."
        value={userValuesRunIf}
        defaultValue={defaultValuesRunIf}
        onChange={onRunIfChange}
      />
    </ExpandableCard>
  );
};

export default WhenToRunCard;
