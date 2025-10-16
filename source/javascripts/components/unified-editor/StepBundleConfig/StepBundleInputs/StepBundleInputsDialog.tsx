/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Collapse,
  Dialog,
  DialogBody,
  DialogFooter,
  Input,
  Link,
  Text,
  Textarea,
  useDisclosure,
} from '@bitrise/bitkit';
import { useController, useForm } from 'react-hook-form';

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
  const { isOpen: isShowMore, onToggle } = useDisclosure();

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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb="16">
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
          <Text as="span" mx="8">
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
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const v = e.target.value.trimStart();
                valueOptionsField.onChange(v ? v.split('\n') : []);
              }}
            />
            <Input label="Category" {...register('opts.category')} />
            <Textarea label="Description" {...register('opts.description')} />
            <Checkbox
              isChecked={watch('opts.is_required')}
              helperText="Input must have a valid value, or the Step will fail."
              {...register('opts.is_required')}
            >
              Required
            </Checkbox>
            <Checkbox
              isChecked={watch('opts.is_sensitive')}
              helperText="Input accepts only Secrets as values."
              {...register('opts.is_sensitive')}
            >
              Sensitive
            </Checkbox>
            <Checkbox
              isChecked={watch('opts.is_dont_change_value')}
              helperText="The default value shouldn't be changed on the UI."
              {...register('opts.is_dont_change_value')}
            >
              Read-only value
            </Checkbox>
            <Checkbox
              isChecked={watch('opts.is_expand')}
              helperText="If a value is an Env Var, the CLI will pass its value to the Step. Uncheck to pass the key as a string."
              mb="16"
              {...register('opts.is_expand')}
            >
              Expand Env Vars in inputs
            </Checkbox>
          </Box>
        </Collapse>
        <Link colorScheme="purple" cursor="pointer" size="2" onClick={onToggle}>
          {isShowMore ? 'Show less options' : 'Show more options'}
        </Link>
      </DialogBody>
      <DialogFooter>
        <ButtonGroup display="flex" gap="8">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button isDisabled={isSubmitDisabled} type="submit">
            {mode === 'edit' ? 'Update' : 'Create'}
          </Button>
        </ButtonGroup>
      </DialogFooter>
    </Dialog>
  );
};

export default StepBundleInputsDialog;
