import { Fragment } from 'react';
import { Card, Divider, ExpandableCard, Text } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { StepInputVariable } from '@/core/models/Step';
import { FormValues } from '@/components/unified-editor/StepConfigDrawer/StepConfigDrawer.types';
import StepInput from './StepInput';
import StepSelectInput from './StepSelectInput';

type Props = {
  title?: string;
  inputs?: StepInputVariable[];
};

const StepInputGroup = ({ title, inputs }: Props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormValues>();

  const content = (
    <>
      {inputs?.map(({ opts, ...input }, index) => {
        const name = Object.keys(input)[0];
        const helper = { summary: opts?.summary, details: opts?.description };
        const isSelectInput = opts?.value_options && opts.value_options.length > 0;

        return (
          <Fragment key={name}>
            {index > 0 && <Divider my={24} />}

            {isSelectInput && (
              <StepSelectInput
                helper={helper}
                label={opts?.title}
                options={opts?.value_options ?? []}
                isSensitive={opts?.is_sensitive}
                isDisabled={opts?.is_dont_change_value}
                errorText={errors?.inputs?.[name]?.message}
                {...register(`inputs.${name}`, { required: opts?.is_required && `${name} is required` })}
              />
            )}

            {!isSelectInput && (
              <StepInput
                helper={helper}
                label={opts?.title}
                isRequired={opts?.is_required}
                isSensitive={opts?.is_sensitive}
                isDisabled={opts?.is_dont_change_value}
                errorText={errors?.inputs?.[name]?.message}
                {...register(`inputs.${name}`, { required: opts?.is_required && `${name} is required` })}
              />
            )}
          </Fragment>
        );
      })}
    </>
  );

  if (!title) {
    return (
      <Card variant="outline" p="16">
        {content}
      </Card>
    );
  }

  return <ExpandableCard buttonContent={<Text textStyle="body/lg/semibold">{title}</Text>}>{content}</ExpandableCard>;
};

export default StepInputGroup;
