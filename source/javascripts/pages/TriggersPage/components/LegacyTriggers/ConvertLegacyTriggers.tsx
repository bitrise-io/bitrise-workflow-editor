import { Notification } from '@bitrise/bitkit';
import {
  ConditionType,
  LegacyConditionType,
  TargetBasedTriggerItem,
  TriggerItem,
  TriggerType,
} from '@/components/unified-editor/Triggers/Triggers.types';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

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

type Props = {
  triggers: Record<TriggerType, TriggerItem[]>;
};

const ConvertLegacyTriggers = (props: Props) => {
  const { triggers } = props;

  const { updateTriggerMap, updatePipelineTriggers, updateWorkflowTriggers, yml } = useBitriseYmlStore();

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
        mapped[targetType as 'pipeline' | 'workflow'][targetId][trigger.source].push(converter(trigger));
      });

    Object.keys(mapped.pipeline).forEach((key) => {
      updatePipelineTriggers(key, mapped.pipeline[key]);
    });

    Object.keys(mapped.workflow).forEach((key) => {
      updateWorkflowTriggers(key, mapped.workflow[key]);
    });

    updateTriggerMap([]);
  };

  return (
    <Notification
      action={{
        label: 'CONVERT!',
        onClick,
      }}
      marginBlockStart="16"
      status="info"
    >
      Convert legacy triggers to target-based
    </Notification>
  );
};

export default ConvertLegacyTriggers;
