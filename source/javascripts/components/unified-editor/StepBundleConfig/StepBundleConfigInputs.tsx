import { Button, EmptyState, useDisclosure } from '@bitrise/bitkit';
import { useEffect, useState } from 'react';

import { EnvironmentItemModel } from '@/core/models/BitriseYml';
import StepBundleService from '@/core/services/StepBundleService';

import useStepBundleInputs from './hooks/useStepBundleInputs';
import { useStepBundleConfigContext } from './StepBundleConfig.context';
import StepBundleInputsCategoryCard from './StepBundleInputs/StepBundleInputsCategoryCard';
import StepBundleInputsForm from './StepBundleInputs/StepBundleInputsForm';
import { FormMode } from './types/StepBundle.types';

const StepBundleConfigInputs = () => {
  const [preselectedCategory, setPreselectedCategory] = useState<string>();
  const [selectedInputIndex, setSelectedInputIndex] = useState<number>(-1);
  const { isOpen: isFormOpen, onOpen: openForm, onClose: closeForm } = useDisclosure();
  const { stepBundle, ...context } = useStepBundleConfigContext();

  const categories = useStepBundleInputs({
    inputs: stepBundle?.mergedValues.inputs,
    stepIndex: context.stepIndex,
    parentStepBundleId: context.parentStepBundleId,
    parentWorkflowId: context.parentWorkflowId,
  });

  const handleAddInput = (category?: string) => {
    setPreselectedCategory(category);
    setSelectedInputIndex(stepBundle?.mergedValues.inputs?.length || 0);
    openForm();
  };

  const handleChange = (key: string, newValue: string, index: number) => {
    const input = stepBundle?.mergedValues.inputs?.[index];
    if (context.parentStepBundleId || context.parentWorkflowId) {
      StepBundleService.updateStepBundleInputInstanceValue(key, newValue, {
        cvs: stepBundle?.cvs || `bundle::${stepBundle?.id}`,
        source: context.parentStepBundleId ? 'step_bundles' : 'workflows',
        sourceId: context.parentStepBundleId || context.parentWorkflowId || '',
        stepIndex: context.stepIndex,
      });
    } else {
      StepBundleService.updateStepBundleInput(stepBundle?.id || '', index, {
        ...input,
        [key]: newValue,
      });
    }
  };

  const handleDelete = (index: number) => {
    StepBundleService.deleteStepBundleInput(stepBundle?.id || '', index);
  };

  const handleEdit = (index: number) => {
    setSelectedInputIndex(index);
    openForm();
  };

  const handleCancel = () => {
    setPreselectedCategory(undefined);
    setSelectedInputIndex(-1);
    closeForm();
  };

  const handleSubmit = (data: EnvironmentItemModel, index: number, mode: FormMode) => {
    if (mode === 'edit') {
      StepBundleService.updateStepBundleInput(stepBundle?.id || '', index, data);
    } else {
      StepBundleService.addStepBundleInput(stepBundle?.id || '', data);
    }
    setPreselectedCategory(undefined);
    setSelectedInputIndex(-1);
    closeForm();
  };

  useEffect(() => {
    setSelectedInputIndex(-1);
    closeForm();
  }, [stepBundle, closeForm]);

  if (selectedInputIndex > -1) {
    return (
      <StepBundleInputsForm
        ids={Object.values(stepBundle?.mergedValues.inputs || []).map(({ opts, ...rest }) => Object.keys(rest)[0])}
        index={selectedInputIndex}
        input={stepBundle?.mergedValues.inputs?.[selectedInputIndex] || { opts: { category: preselectedCategory } }}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        isOpen={isFormOpen}
      />
    );
  }

  return stepBundle?.mergedValues.inputs?.length ? (
    Object.entries(categories).map(([category, items]) => (
      <StepBundleInputsCategoryCard
        key={category}
        category={category !== 'uncategorized' ? category : undefined}
        items={items}
        onAdd={handleAddInput}
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
      <Button leftIconName="Plus" variant="secondary" size="md" onClick={() => handleAddInput()}>
        Add input
      </Button>
    </EmptyState>
  );
};

export default StepBundleConfigInputs;
