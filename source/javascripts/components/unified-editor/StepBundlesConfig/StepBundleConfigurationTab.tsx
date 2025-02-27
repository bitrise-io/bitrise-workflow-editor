import { useState } from 'react';
import { Button, EmptyState } from '@bitrise/bitkit';
import StepBundleInputsCategoryCard from '@/components/unified-editor/StepBundlesConfig/StepBundleInputsCategoryCard';
import StepBundleInputsForm from '@/components/unified-editor/StepBundlesConfig/StepBundleInputsForm';
import { EnvironmentItemModel } from '@/core/models/BitriseYml';
import { useStepBundleConfigContext } from './StepBundlesConfig.context';
import { InputListItem } from './StepBundle.types';

const StepBundleConfigurationTab = () => {
  const [selectedInput, setSelectedInput] = useState<EnvironmentItemModel | null | 'empty'>(null);
  const stepBundle = useStepBundleConfigContext();

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

  const handleEdit = (index: number) => {
    setSelectedInput(stepBundle?.userValues.inputs?.[index] || 'empty');
    console.log('Edit', index);
  };

  if (selectedInput) {
    return <StepBundleInputsForm />;
  }

  return stepBundle?.userValues.inputs?.length ? (
    Object.entries(categories).map(([category, inputs]) => {
      if (category === 'uncategorized') {
        return <StepBundleInputsCategoryCard key={category} defaults={inputs} onEdit={handleEdit} />;
      }
      return <StepBundleInputsCategoryCard key={category} title={category} defaults={inputs} onEdit={handleEdit} />;
    })
  ) : (
    <EmptyState
      title="Bundle inputs"
      description="Define input variables to manage multiple Steps within a bundle. Reference their keys in Steps and assign custom values for each Workflow."
      p={48}
    >
      <Button
        leftIconName="Plus"
        variant="secondary"
        size="md"
        mt={24}
        onClick={() => {
          setSelectedInput('empty');
        }}
      >
        Add input
      </Button>
    </EmptyState>
  );
};

export default StepBundleConfigurationTab;
