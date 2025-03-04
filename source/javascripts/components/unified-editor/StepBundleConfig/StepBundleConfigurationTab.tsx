import { useState } from 'react';
import { Button, EmptyState } from '@bitrise/bitkit';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { EnvironmentItemModel } from '@/core/models/BitriseYml';
import { useStepBundleConfigContext } from './StepBundleConfig.context';
import { FormMode, InputListItem } from './types/StepBundle.types';
import StepBundleInputsCategoryCard from './StepBundleInputs/StepBundleInputsCategoryCard';
import StepBundleInputsForm from './StepBundleInputs/StepBundleInputsForm';

const StepBundleConfigurationTab = () => {
  const [selectedInputIndex, setSelectedInputIndex] = useState<number>(-1);
  const stepBundle = useStepBundleConfigContext();

  const appendStepBundleInput = useBitriseYmlStore((s) => s.appendStepBundleInput);
  const deleteStepBundleInput = useBitriseYmlStore((s) => s.deleteStepBundleInput);
  const updateStepBundleInput = useBitriseYmlStore((s) => s.updateStepBundleInput);

  const categories: Record<string, InputListItem[]> = {
    uncategorized: [],
  };
  stepBundle?.userValues.inputs?.forEach((input, index) => {
    if (input?.opts?.category) {
      categories[input.opts.category] = categories[input.opts.category] || [];
      categories[input.opts.category].push({ ...input, index });
    } else {
      categories.uncategorized.push({ ...input, index });
    }
  });

  const handeAddInput = () => {
    setSelectedInputIndex(stepBundle?.userValues.inputs?.length || 0);
  };

  const handlChange = (key: string, value: string) => {
    console.log('handlChange', key, value);
  };

  const handleDelete = (index: number) => {
    deleteStepBundleInput(stepBundle?.id || '', index);
  };

  const handleEdit = (index: number) => {
    setSelectedInputIndex(index);
  };

  const handleSubmit = (data: EnvironmentItemModel, index: number, mode: FormMode) => {
    if (mode === 'edit') {
      updateStepBundleInput(stepBundle?.id || '', index, data);
    } else {
      appendStepBundleInput(stepBundle?.id || '', data);
    }
    setSelectedInputIndex(-1);
  };

  if (selectedInputIndex > -1) {
    return (
      <StepBundleInputsForm
        ids={Object.values(categories)
          .flat()
          .map(({ index, opts, ...rest }) => Object.keys({ ...rest })[0])}
        index={selectedInputIndex}
        input={stepBundle?.userValues.inputs?.[selectedInputIndex]}
        onCancel={() => setSelectedInputIndex(-1)}
        onSubmit={handleSubmit}
      />
    );
  }

  return stepBundle?.userValues.inputs?.length ? (
    Object.entries(categories).map(([category, inputs]) => (
      <StepBundleInputsCategoryCard
        key={category}
        title={category !== 'uncategorized' ? category : undefined}
        defaults={inputs}
        onAdd={handeAddInput}
        onChange={handlChange}
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
      <Button leftIconName="Plus" variant="secondary" size="md" onClick={handeAddInput}>
        Add input
      </Button>
    </EmptyState>
  );
};

export default StepBundleConfigurationTab;
