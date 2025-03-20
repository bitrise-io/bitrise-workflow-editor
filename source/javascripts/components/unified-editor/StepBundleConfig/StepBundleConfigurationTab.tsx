import { useEffect, useState } from 'react';
import { Button, EmptyState } from '@bitrise/bitkit';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { EnvironmentItemModel } from '@/core/models/BitriseYml';
import useStepBundleInputs from '@/components/unified-editor/StepBundleConfig/hooks/useStepBundleInputs';
import { useStepBundleConfigContext } from './StepBundleConfig.context';
import { FormMode } from './types/StepBundle.types';
import StepBundleInputsCategoryCard from './StepBundleInputs/StepBundleInputsCategoryCard';
import StepBundleInputsForm from './StepBundleInputs/StepBundleInputsForm';

const StepBundleConfigurationTab = () => {
  const [preselectedCategory, setPreselectedCategory] = useState<string>();
  const [selectedInputIndex, setSelectedInputIndex] = useState<number>(-1);
  const { stepBundle, ...context } = useStepBundleConfigContext();

  const appendStepBundleInput = useBitriseYmlStore((s) => s.appendStepBundleInput);
  const deleteStepBundleInput = useBitriseYmlStore((s) => s.deleteStepBundleInput);
  const updateStepBundleInput = useBitriseYmlStore((s) => s.updateStepBundleInput);
  const updateStepBundleInputInstanceValue = useBitriseYmlStore((s) => s.updateStepBundleInputInstanceValue);

  const categories = useStepBundleInputs({
    inputs: stepBundle?.userValues.inputs,
    stepIndex: context.stepIndex,
    parentStepBundleId: context.parentStepBundleId,
    parentWorkflowId: context.parentWorkflowId,
  });

  const handeAddInput = (category?: string) => {
    setPreselectedCategory(category);
    setSelectedInputIndex(stepBundle?.userValues.inputs?.length || 0);
  };

  const handleChange = (key: string, newValue: string, index: number) => {
    const input = stepBundle?.userValues.inputs?.[index];
    if (context.parentStepBundleId || context.parentWorkflowId) {
      updateStepBundleInputInstanceValue(
        key,
        newValue,
        context.parentStepBundleId,
        context.parentWorkflowId,
        stepBundle?.cvs || `bundle::${stepBundle?.id}`,
        context.stepIndex,
      );
    } else {
      updateStepBundleInput(stepBundle?.id || '', index, {
        ...input,
        [key]: newValue,
      });
    }
  };

  const handleDelete = (index: number) => {
    deleteStepBundleInput(stepBundle?.id || '', index);
  };

  const handleEdit = (index: number) => {
    setSelectedInputIndex(index);
  };

  const handleCancel = () => {
    setPreselectedCategory(undefined);
    setSelectedInputIndex(-1);
  };

  const handleSubmit = (data: EnvironmentItemModel, index: number, mode: FormMode) => {
    if (mode === 'edit') {
      updateStepBundleInput(stepBundle?.id || '', index, data);
    } else {
      appendStepBundleInput(stepBundle?.id || '', data);
    }
    setPreselectedCategory(undefined);
    setSelectedInputIndex(-1);
  };

  useEffect(() => {
    setSelectedInputIndex(-1);
  }, [stepBundle]);

  if (selectedInputIndex > -1) {
    return (
      <StepBundleInputsForm
        ids={Object.values(stepBundle?.userValues.inputs || []).map(({ opts, ...rest }) => Object.keys(rest)[0])}
        index={selectedInputIndex}
        input={stepBundle?.userValues.inputs?.[selectedInputIndex] || { opts: { category: preselectedCategory } }}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    );
  }

  return stepBundle?.userValues.inputs?.length ? (
    Object.entries(categories).map(([category, items]) => (
      <StepBundleInputsCategoryCard
        key={category}
        category={category !== 'uncategorized' ? category : undefined}
        items={items}
        onAdd={handeAddInput}
        onChange={handleChange}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    ))
  ) : (
    <EmptyState
      title="Bundle inputs"
      description="Define input variables to manage multiple Steps within a bundle. Reference their keys in Steps and assign custom values for each Workflow."
      p="48"
    >
      <Button leftIconName="Plus" variant="secondary" size="md" onClick={() => handeAddInput()}>
        Add input
      </Button>
    </EmptyState>
  );
};

export default StepBundleConfigurationTab;
