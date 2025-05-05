import { Notification, Text, useToast } from '@bitrise/bitkit';

import {
  ConditionType,
  LegacyConditionType,
  TargetBasedTriggerItem,
  TriggerItem,
  TriggerType,
} from '@/components/unified-editor/Triggers/Triggers.types';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type Props = {
  triggers: Record<TriggerType, TriggerItem[]>;
};

const CONDITION_TYPE_MAP: Record<LegacyConditionType, ConditionType> = {
  pull_request_comment: 'comment',
  push_branch: 'branch',
  commit_message: 'commit_message',
  changed_files: 'changed_files',
  pull_request_source_branch: 'source_branch',
  pull_request_target_branch: 'target_branch',
  pull_request_label: 'label',
  tag: 'name',
};

const converter = (legacy: TriggerItem): TargetBasedTriggerItem => {
  const targetBased: TargetBasedTriggerItem = {};
  if (legacy.isActive === false) {
    targetBased.enabled = false;
  }
  if (legacy.isDraftPr === false) {
    targetBased.draft_enabled = false;
  }
  legacy.conditions.forEach((c) => {
    targetBased[CONDITION_TYPE_MAP[c.type as LegacyConditionType]] = c.isRegex
      ? {
          regex: c.value,
        }
      : c.value;
  });
  return targetBased;
};

const isConvertSafe = (triggers: Props['triggers']): boolean => {
  // If there is 1 or 0 item per type -> return true
  return Object.values(triggers).every((type) => type.length < 2);
};

const ConvertLegacyTriggers = (props: Props) => {
  const { triggers } = props;

  const { updateTriggerMap, updatePipelineTriggers, updateWorkflowTriggers, yml } = useBitriseYmlStore();

  const toast = useToast();

  if (!isConvertSafe(triggers)) {
    return null;
  }

  const onClick = () => {
    const mapped: Record<'pipeline' | 'workflow', Record<string, Record<TriggerType, TargetBasedTriggerItem[]>>> = {
      pipeline: {},
      workflow: {},
    };

    Object.values(triggers)
      .flat()
      .forEach((trigger) => {
        const [targetType, targetId] = trigger.pipelineable.split('#');
        if (!mapped[targetType as 'pipeline' | 'workflow'][targetId]) {
          const type: 'pipelines' | 'workflows' = `${targetType as 'pipeline' | 'workflow'}s`;
          mapped[targetType as 'pipeline' | 'workflow'][targetId] = {
            pull_request: (yml[type]?.[targetId].triggers?.pull_request as TargetBasedTriggerItem[]) || [],
            push: (yml[type]?.[targetId].triggers?.push as TargetBasedTriggerItem[]) || [],
            tag: (yml[type]?.[targetId].triggers?.tag as TargetBasedTriggerItem[]) || [],
          };
        }
        mapped[targetType as 'pipeline' | 'workflow'][targetId][trigger.source]?.push(converter(trigger));
      });

    Object.keys(mapped.pipeline).forEach((key) => {
      updatePipelineTriggers(key, mapped.pipeline[key]);
    });

    Object.keys(mapped.workflow).forEach((key) => {
      updateWorkflowTriggers(key, mapped.workflow[key]);
    });

    updateTriggerMap([]);
    toast({
      isClosable: true,
      status: 'success',
      title: 'Successful convertion',
      description: 'Legacy triggers converted to new format.',
    });
  };

  return (
    <Notification
      action={{
        label: 'Convert triggers',
        onClick,
      }}
      marginBlockStart="16"
      status="info"
    >
      <Text as="h4" textStyle="comp/notification/title">
        Convert legacy triggers to the new format
      </Text>
      Make sure to check the converted triggers before saving.
    </Notification>
  );
};

export default ConvertLegacyTriggers;
