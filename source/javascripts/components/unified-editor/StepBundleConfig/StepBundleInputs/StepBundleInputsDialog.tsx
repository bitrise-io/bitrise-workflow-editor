import { Collapse, Dialog, DialogBody, DialogFooter, Input, Textarea } from '@bitrise/bitkit';
import { BitkitButton, BitkitCheckbox, BitkitLinkButton } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { ButtonGroup } from '@chakra-ui/react/button';
import { useDisclosure } from '@chakra-ui/react/hooks';
import { Text } from '@chakra-ui/react/text';
import { ChangeEvent } from 'react';
import { Controller, useController, useForm } from 'react-hook-form';

import { EnvironmentItemModel } from '@/core/models/BitriseYml';
import StepBundleService from '@/core/services/StepBundleService';

import StepInput from '../../StepConfigDrawer/components/StepInput';
import StepSelectInput from '../../StepConfigDrawer/components/StepSelectInput';
import { FormItems, FormMode } from '../types/StepBundle.types';
import { expandInput } from '../utils/StepBundle.utils';

type StepBundleInputsDialogProps = {
  ids: string[];
  index: number;
  input?: EnvironmentItemModel;
  isOpen: boolean;
  onCancel: VoidFunction;
  onSubmit: (data: EnvironmentItemModel, index: number, mode: FormMode) => void;
};

const StepBundleInputsDialog = (props: StepBundleInputsDialogProps) => {
  const { ids, index, input, isOpen, onCancel, onSubmit } = props;
  const { open: isShowMore, onToggle } = useDisclosure();

  const { opts, key, value } = expandInput(input);

  const { control, formState, handleSubmit, register, reset, watch } = useForm<FormItems>({
    mode: 'onChange',
    values: {
      key,
      value,
      opts: {
        title: '',
        summary: '',
        value_options: [],
        category: '',
        description: '',
        is_required: false,
        is_expand: false,
        is_sensitive: false,
        is_dont_change_value: false,
        ...opts,
      },
    },
  });

  const { field: keyField } = useController({
    control,
    name: 'key',
    rules: {
      validate: (k) => {
        if (k === 'opts') {
          return 'They key could not be "opts".';
        }
        return ids.includes(k) && k !== key ? 'This key is used in this step bundle, Choose another one.' : undefined;
      },
    },
  });
  const { field: valueField } = useController({ control, name: 'value' });
  const { field: valueOptionsField } = useController({ control, name: 'opts.value_options' });

  const mode = key ? 'edit' : 'append';

  const onFormSubmit = (data: FormItems) => {
    onSubmit({ [data.key]: data.value, opts: data.opts }, index, mode);
  };

  const valueOptions = watch('opts.value_options');

  const isSubmitDisabled = !(!!watch('key') && formState.isDirty) || !!formState.errors.key?.message;
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      onCloseComplete={reset}
      title={mode === 'edit' ? 'Edit bundle input' : 'New bundle input'}
      scrollBehavior="inside"
      as="form"
      onSubmit={handleSubmit(onFormSubmit)}
    >
      <DialogBody>
        <Input
          label="Title"
          helperText="This will be the label of the input. Keep it short and descriptive."
          size="md"
          mb="16"
          {...register('opts.title')}
        />
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBlockEnd="16">
          <Input
            errorText={formState.errors.key?.message}
            label="Key"
            helperText="Use this key as variable in Step inputs."
            size="md"
            flex={1}
            isRequired
            {...keyField}
            onChange={(e) => keyField.onChange(StepBundleService.sanitizeInputKey(e.target.value))}
          />
          <Text as="span" marginInline="8">
            =
          </Text>
          {valueOptions?.length ? (
            <StepSelectInput
              label="Default value"
              helperText="Value must be a string."
              options={valueOptions ?? []}
              {...valueField}
            />
          ) : (
            <StepInput label="Default value" helperText="Value must be a string." {...valueField} />
          )}
        </Box>
        <Collapse in={isShowMore} style={{ overflow: 'visible' }}>
          <Box display="flex" flexDirection="column" gap="16">
            <Input label="Summary" {...register('opts.summary')} />
            <Textarea
              label="Value options"
              helperText="Add values as new lines."
              {...valueOptionsField}
              value={valueOptionsField.value?.join('\n')}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                const v = e.target.value.trimStart();
                valueOptionsField.onChange(v ? v.split('\n') : []);
              }}
            />
            <Input label="Category" {...register('opts.category')} />
            <Textarea label="Description" {...register('opts.description')} />
            <Controller
              control={control}
              name="opts.is_required"
              render={({ field }) => (
                <BitkitCheckbox
                  labelText="Required"
                  helperText="Input must have a valid value, or the Step will fail."
                  checked={!!field.value}
                  name={field.name}
                  onCheckedChange={({ checked }) => field.onChange(checked === true)}
                />
              )}
            />
            <Controller
              control={control}
              name="opts.is_sensitive"
              render={({ field }) => (
                <BitkitCheckbox
                  labelText="Sensitive"
                  helperText="Input accepts only Secrets as values."
                  checked={!!field.value}
                  name={field.name}
                  onCheckedChange={({ checked }) => field.onChange(checked === true)}
                />
              )}
            />
            <Controller
              control={control}
              name="opts.is_dont_change_value"
              render={({ field }) => (
                <BitkitCheckbox
                  labelText="Read-only value"
                  helperText="The default value shouldn't be changed on the UI."
                  checked={!!field.value}
                  name={field.name}
                  onCheckedChange={({ checked }) => field.onChange(checked === true)}
                />
              )}
            />
            <Controller
              control={control}
              name="opts.is_expand"
              render={({ field }) => (
                <BitkitCheckbox
                  labelText="Expand Env Vars in inputs"
                  helperText="If a value is an Env Var, the CLI will pass its value to the Step. Uncheck to pass the key as a string."
                  marginBlockEnd="16"
                  checked={!!field.value}
                  name={field.name}
                  onCheckedChange={({ checked }) => field.onChange(checked === true)}
                />
              )}
            />
          </Box>
        </Collapse>
        <BitkitLinkButton onClick={onToggle}>{isShowMore ? 'Show less options' : 'Show more options'}</BitkitLinkButton>
      </DialogBody>
      <DialogFooter>
        <ButtonGroup display="flex" gap="8">
          <BitkitButton variant="secondary" onClick={onCancel}>
            Cancel
          </BitkitButton>
          <BitkitButton state={isSubmitDisabled ? 'disabled' : undefined} type="submit">
            {mode === 'edit' ? 'Update' : 'Create'}
          </BitkitButton>
        </ButtonGroup>
      </DialogFooter>
    </Dialog>
  );
};

export default StepBundleInputsDialog;
