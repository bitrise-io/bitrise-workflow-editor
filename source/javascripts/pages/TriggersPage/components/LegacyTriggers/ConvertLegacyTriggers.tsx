import { Button } from '@bitrise/bitkit';
import { TargetBasedTriggerItem, TriggerItem, TriggerType } from '@/components/unified-editor/Triggers/Triggers.types';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type Props = {
  triggers: Record<TriggerType, TriggerItem[]>;
};

const ConvertLegacyTriggers = (props: Props) => {
  const { triggers } = props;

  const { updateTriggerMap, updateWorkflowTriggers, yml } = useBitriseYmlStore();

  const onClick = () => {
    const mapped: Record<'pipeline' | 'workflow', Record<string, Record<TriggerType, TargetBasedTriggerItem> | any>> = {
      pipeline: {},
      workflow: {},
    };
    Object.values(triggers)
      .flat()
      .forEach((trigger) => {
        const [targetType, targetId] = trigger.pipelineable.split('#');
        if (!mapped[targetType as 'pipeline' | 'workflow'][targetId]) {
          mapped[targetType as 'pipeline' | 'workflow'][targetId] = {};
        }
        if (targetType === 'pipeline' && yml.pipelines?.[targetId]?.triggers) {
          mapped.pipeline[targetId] = yml.pipelines?.[targetId]?.triggers;
        }
        if (targetType === 'workflow' && yml.workflows?.[targetId]?.triggers) {
          mapped.workflow[targetId] = { ...yml.workflows?.[targetId]?.triggers };
        }
        if (!mapped[targetType as 'pipeline' | 'workflow'][targetId][trigger.source]) {
          mapped[targetType as 'pipeline' | 'workflow'][targetId][trigger.source] = [];
        }
        mapped[targetType as 'pipeline' | 'workflow'][targetId][trigger.source].push(trigger);
      });

    console.log(mapped);
    updateWorkflowTriggers('wf6', {
      tag: [
        {
          name: '1',
        } as TargetBasedTriggerItem,
      ],
    });
    updateTriggerMap([]);
  };

  return (
    <Button marginBlockStart="16" leftIconName="MagicWand" size="md" onClick={onClick}>
      Convert all to target-based triggers
    </Button>
  );
};

export default ConvertLegacyTriggers;
