import { Box, Text, Tooltip } from '@bitrise/bitkit';
import {
  BitkitIconComponent,
  BitkitTag,
  IconBranch,
  IconChat,
  IconCommit,
  IconDoc,
  IconPull,
  IconTag,
} from '@bitrise/bitkit-v2';
import { Fragment } from 'react';

import { TargetBasedCondition, TargetBasedConditionType, TriggerType } from '@/core/models/Trigger';
import { LegacyCondition, LegacyConditionType } from '@/core/models/Trigger.legacy';

type TriggerConditionsProps = {
  conditions: LegacyCondition[] | TargetBasedCondition[];
  isDraftPr?: boolean;
  triggerType?: TriggerType;
  triggerDisabled?: boolean;
  priority?: number;
};

const ICON_MAP: Record<LegacyConditionType | TargetBasedConditionType, BitkitIconComponent> = {
  branch: IconBranch,
  push_branch: IconBranch,
  commit_message: IconCommit,
  changed_files: IconDoc,
  source_branch: IconPull,
  pull_request_source_branch: IconPull,
  target_branch: IconPull,
  pull_request_target_branch: IconPull,
  label: IconTag,
  pull_request_label: IconTag,
  comment: IconChat,
  pull_request_comment: IconChat,
  tag: IconTag,
  name: IconTag,
};

const TOOLTIP_MAP: Record<LegacyConditionType | TargetBasedConditionType, string> = {
  branch: 'Push branch',
  push_branch: 'Push branch',
  commit_message: 'Commit message',
  changed_files: 'File change',
  source_branch: 'Source branch',
  pull_request_source_branch: 'Source branch',
  target_branch: 'Target branch',
  pull_request_target_branch: 'Target branch',
  label: 'PR label',
  pull_request_label: 'PR label',
  comment: 'PR comment',
  pull_request_comment: 'PR comment',
  tag: 'Tag',
  name: 'Tag',
};

const TriggerConditions = (props: TriggerConditionsProps) => {
  const { conditions, isDraftPr, triggerDisabled, triggerType, priority } = props;
  return (
    <Box display="flex" alignItems="center" flexWrap="wrap" rowGap="8" columnGap="4">
      {(!conditions || conditions.length === 0) && <BitkitTag labelText="No conditions." size="sm" />}
      {conditions.map(({ type, value }, index) => (
        <Fragment key={type + value}>
          <Tooltip label={triggerDisabled ? 'Disabled' : TOOLTIP_MAP[type]} shouldWrapChildren>
            <BitkitTag
              icon={ICON_MAP[type]}
              labelText={value}
              size="sm"
              state={triggerDisabled ? 'disabled' : undefined}
            />
          </Tooltip>
          {conditions.length - 1 > index && (
            <Text as="span" textStyle="body/md/regular" color="text/secondary">
              and
            </Text>
          )}
        </Fragment>
      ))}
      {triggerType === 'pull_request' && isDraftPr === false && (
        <Text textStyle="body/md/regular" color="text/secondary">
          • Draft PRs excluded
        </Text>
      )}
      {priority !== undefined && (
        <Text textStyle="body/md/regular" color="text/secondary">
          • Priority: {priority}
        </Text>
      )}
    </Box>
  );
};

export default TriggerConditions;
