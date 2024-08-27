import { Fragment } from 'react';
import { Card, Divider, ExpandableCard, Text } from '@bitrise/bitkit';
import { StepInputVariable } from '@/core/models/Step';
import StepInput from './StepInput';
import StepSelectInput from './StepSelectInput';

type Props = {
  title?: string;
  inputs?: StepInputVariable[];
};

const StepInputGroup = ({ title, inputs }: Props) => {
  const content = (
    <>
      {inputs?.map(({ opts, ...input }, index) => {
        const [name, defaultValue] = Object.entries(input)[0];
        const helper = { summary: opts?.summary, details: opts?.description };
        const isSelectInput = opts?.value_options && opts.value_options.length > 0;

        return (
          <Fragment key={name}>
            {index > 0 && <Divider my={24} />}

            {isSelectInput && (
              <StepSelectInput
                name={name}
                helper={helper}
                label={opts?.title}
                options={opts?.value_options ?? []}
                defaultValue={defaultValue as string}
                isSensitive={opts?.is_sensitive}
                isDisabled={opts?.is_dont_change_value}
              />
            )}

            {!isSelectInput && (
              <StepInput
                name={name}
                helper={helper}
                label={opts?.title}
                defaultValue={defaultValue as string}
                isRequired={opts?.is_required}
                isSensitive={opts?.is_sensitive}
                isDisabled={opts?.is_dont_change_value}
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
