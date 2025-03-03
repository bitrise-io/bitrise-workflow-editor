/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Collapse,
  Input,
  Link,
  Text,
  Textarea,
  useDisclosure,
} from '@bitrise/bitkit';
import { useController, useForm } from 'react-hook-form';
import StepInput from '../../StepConfigDrawer/components/StepInput';
import { FormItems, InputListItem } from '../types/StepBundle.types';

function expandInputListItem(listItem: InputListItem = { index: -1 }) {
  const { index, opts, ...keyValuePair } = listItem;
  const key = Object.keys(keyValuePair)[0] || '';
  const value = (Object.values(keyValuePair)[0] as string | null) || '';
  return {
    index: typeof index === 'number' ? index : -1,
    key,
    value,
    opts: opts || {},
  };
}

type StepBundleInputsFormProps = {
  input?: InputListItem;
  onCancel: VoidFunction;
};

const StepBundleInputsForm = (props: StepBundleInputsFormProps) => {
  const { onCancel, input } = props;
  const { isOpen, onToggle } = useDisclosure();

  const { index, opts, key, value } = expandInputListItem(input);

  const { control, handleSubmit, register, reset, watch } = useForm<FormItems>({
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

  const { field: valueField } = useController({ control, name: 'value' });
  const { field: valueOptionsField } = useController({ control, name: 'opts.value_options' });

  const onFormSubmit = (data: FormItems) => {
    console.log({ [data.key]: data.value, opts: data.opts }, index);
  };

  const onCancelClick = () => {
    reset();
    onCancel();
  };

  return (
    <Box as="form" display="flex" flexDir="column" gap="16" height="100%" onSubmit={handleSubmit(onFormSubmit)}>
      <Box display="flex" flexDir="column" gap="16" flex="1">
        <Text textStyle="heading/h3">New bundle input</Text>
        <Input
          label="Title"
          helperText="This will be the label of the input. Keep it short and descriptive."
          size="md"
          isRequired
          {...register('opts.title')}
        />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Input
            label="Key"
            helperText="Use this key as variable in Step inputs."
            size="md"
            flex={1}
            isRequired
            {...register('key')}
          />
          <Text as="span" mx="8">
            =
          </Text>
          <StepInput label="Default value" helperText="Value must be a string." {...valueField} />
        </Box>
        <Collapse in={isOpen}>
          <Box display="flex" flexDirection="column" gap="16">
            <Input label="Summary" {...register('opts.summary')} />
            <Textarea
              label="Value options"
              helperText="Add values as new lines."
              {...valueOptionsField}
              value={valueOptionsField.value?.join('\n')}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                valueOptionsField.onChange(e.target.value.split('\n'))
              }
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
              {...register('opts.is_expand')}
            >
              Expand Env Vars in inputs
            </Checkbox>
          </Box>
        </Collapse>
        <Link colorScheme="purple" cursor="pointer" size="2" onClick={onToggle}>
          {isOpen ? 'Show less options' : 'Show more options'}
        </Link>
      </Box>
      <ButtonGroup display="flex" justifyContent="space-between" paddingBottom={isOpen ? '24' : undefined}>
        <Button variant="tertiary" isDanger onClick={onCancelClick}>
          Cancel
        </Button>
        <Button type="submit">Create</Button>
      </ButtonGroup>
    </Box>
  );
};

export default StepBundleInputsForm;
