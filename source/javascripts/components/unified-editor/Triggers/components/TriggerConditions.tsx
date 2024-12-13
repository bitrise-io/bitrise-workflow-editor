import { Fragment } from 'react';
import { Box, Tag, Text, Tooltip, TypeIconName } from '@bitrise/bitkit';
import { Condition, ConditionType, LegacyConditionType, TriggerType } from '../Triggers.types';

type TriggerConditionsProps = {
  conditions: Condition[];
  isDraftPr?: boolean;
  triggerType?: TriggerType;
  triggerDisabled?: boolean;
};

const iconMap: Record<LegacyConditionType | ConditionType, TypeIconName> = {
  branch: 'Branch',
  push_branch: 'Branch',
  commit_message: 'Commit',
  changed_files: 'Doc',
  source_branch: 'Pull',
  pull_request_source_branch: 'Pull',
  target_branch: 'Pull',
  pull_request_target_branch: 'Pull',
  label: 'Tag',
  pull_request_label: 'Tag',
  comment: 'Chat',
  pull_request_comment: 'Chat',
  tag: 'Tag',
  name: 'Tag',
};

const toolTip: Record<LegacyConditionType | ConditionType, string> = {
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
  const { conditions, isDraftPr, triggerDisabled, triggerType } = props;
  return (
    <Box display="flex" alignItems="center" flexWrap="wrap" rowGap="8" columnGap="4">
      {(!conditions || conditions.length === 0) && <Tag size="sm">No conditions.</Tag>}
      {conditions.map(({ type, value }, index) => (
        <Fragment key={type + value}>
          <Tooltip label={triggerDisabled ? 'Disabled' : toolTip[type]}>
            <Tag
              iconName={iconMap[type]}
              iconColor={triggerDisabled ? 'neutral.80' : 'neutral.60'}
              size="sm"
              isDisabled={triggerDisabled}
            >
              {value}
            </Tag>
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
    </Box>
  );
};

export default TriggerConditions;
