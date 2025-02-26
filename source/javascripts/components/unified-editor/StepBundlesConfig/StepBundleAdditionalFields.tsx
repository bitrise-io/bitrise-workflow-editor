import { ChangeEventHandler, useState } from 'react';
import { Box, Checkbox, Input, Textarea } from '@bitrise/bitkit';
import { useDebounceCallback } from 'usehooks-ts';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { StepBundleModel } from '@/core/models/BitriseYml';
import { useStepBundleConfigContext } from '@/components/unified-editor/StepBundlesConfig/StepBundlesConfig.context';

const StepBundleAdditionalFields = () => {
  const stepBundle = useStepBundleConfigContext();
  const updateStepBundle = useBitriseYmlStore((s) => s.updateStepBundle);
  const debouncedUpdateStepBundle = useDebounceCallback(updateStepBundle, 100);

  const [{ summary, valueOptions, category, description }, setValues] = useState({
    summary: stepBundle?.userValues.summary || '',
    valueOptions: stepBundle?.userValues.valueOptions || '',
    category: stepBundle?.userValues.category || '',
    description: stepBundle?.userValues.description || '',
  });

  const handleSummaryChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValues((prev) => ({ ...prev, summary: e.target.value }));
    debouncedUpdateStepBundle(stepBundle?.id || '', { summary: e.target.value } as StepBundleModel);
  };

  const handleValueOptionsChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValues((prev) => ({ ...prev, valueOptions: e.target.value }));
    debouncedUpdateStepBundle(stepBundle?.id || '', {
      valueOptions: e.target.value,
    } as StepBundleModel);
  };

  const handleCategoryChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValues((prev) => ({ ...prev, category: e.target.value }));
    debouncedUpdateStepBundle(stepBundle?.id || '', { category: e.target.value } as StepBundleModel);
  };

  const handleDescriptionChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValues((prev) => ({ ...prev, description: e.target.value }));
    debouncedUpdateStepBundle(stepBundle?.id || '', {
      description: e.target.value,
    } as StepBundleModel);
  };

  return (
    <Box display="flex" flexDirection="column" gap={16}>
      <Input label="Summary" value={summary} onChange={handleSummaryChange} />
      <Textarea
        label="Value options"
        value={valueOptions}
        onChange={handleValueOptionsChange}
        helperText="Add values as new lines."
      />
      <Input label="Category" value={category} onChange={handleCategoryChange} />
      <Textarea label="Description" value={description} onChange={handleDescriptionChange} />
      <Checkbox helperText="Input must have a valid value, or the Step will fail.">Required</Checkbox>
      <Checkbox helperText="Input accepts only Secrets as values.">Sensitive</Checkbox>
      <Checkbox helperText="The default value shouldn't be changed on the UI.">Read-only value</Checkbox>
      <Checkbox helperText="If a value is an Env Var, the CLI will pass its value to the Step. Uncheck to pass the key as a string.">
        Expand Env Vars in inputs
      </Checkbox>
    </Box>
  );
};

export default StepBundleAdditionalFields;
