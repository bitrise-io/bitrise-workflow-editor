import { useState } from 'react';
import { Input } from '@bitrise/bitkit';
import { useDebounceCallback } from 'usehooks-ts';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useStepDrawerContext } from '@/components/unified-editor/StepConfigDrawer/StepConfigDrawer.context';

type StepBundlesPropertiesTabProps = {
  stepBundleName: string | undefined;
  workflowId: string;
  stepIndex: number;
};

const StepBundlesPropertiesTab = (props: StepBundlesPropertiesTabProps) => {
  const { stepBundleName, stepIndex, workflowId } = props;

  const [name, setName] = useState(stepBundleName);
  const { data } = useStepDrawerContext();
  const updateStep = useDebounceCallback(
    useBitriseYmlStore((s) => s.updateStep),
    250,
  );

  const handleNameChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setName(e.currentTarget.value);
    updateStep(workflowId, stepIndex, { title: e.currentTarget.value }, data?.defaultValues ?? {});
  };

  return <Input type="text" label="Name" defaultValue={name} onChange={handleNameChange} isRequired />;
};

export default StepBundlesPropertiesTab;
