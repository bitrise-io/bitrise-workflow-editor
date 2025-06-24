import { Box, Divider, ExpandableCard, Text, Toggle } from '@bitrise/bitkit';
import { ChangeEventHandler } from 'react';

import StepInput from '../StepConfigDrawer/components/StepInput';

type WhenToRunCardPorps = {
  defaultValuesRunIf?: string;
  isAlwaysRun?: boolean;
  isSkippable?: boolean;
  onIsAlwaysRunChange: ChangeEventHandler<HTMLInputElement>;
  onIsSkippableChange: ChangeEventHandler<HTMLInputElement>;
  onRunIfChange: (runIf: string) => void;
  userValuesRunIf?: string;
};

const WhenToRunCard = (props: WhenToRunCardPorps) => {
  const {
    defaultValuesRunIf,
    isAlwaysRun,
    isSkippable,
    onIsAlwaysRunChange,
    onIsSkippableChange,
    onRunIfChange,
    userValuesRunIf,
  } = props;
  return (
    <ExpandableCard buttonContent={<Text textStyle="body/lg/semibold">When to run</Text>}>
      <Box display="flex">
        <Text flex="1">Run even if previous Step(s) failed</Text>
        <Toggle defaultChecked={isAlwaysRun} onChange={onIsAlwaysRunChange} />
      </Box>
      <Divider my="24" />
      <Box display="flex">
        <Text flex="1">Continue build even if this Step fails</Text>
        <Toggle defaultChecked={isSkippable} onChange={onIsSkippableChange} />
      </Box>
      <Divider my="24" />
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
