import { Fragment } from 'react';
import { Card, Divider, ExpandableCard, Text } from '@bitrise/bitkit';

import { StepInputVariable } from '@/core/models/Step';
import StepCodeEditor from '@/components/unified-editor/StepConfigDrawer/components/StepCodeEditor';
import StepInput from './StepInput';
import StepSelectInput from './StepSelectInput';

type Props = {
  title?: string;
  stepId?: string;
  inputs?: StepInputVariable[];
  onChange?: (name: string, value: string | null) => void;
};

const StepInputGroup = ({ title, stepId, inputs, onChange }: Props) => {
  const content = (
    <>
      {inputs?.map(({ opts, ...input }, index) => {
        const name = Object.keys(input)[0];
        const value = String(input[name] ?? '');
        const helper = { summary: opts?.summary, details: opts?.description };
        const isSelectInput = opts?.value_options && opts.value_options.length > 0;
        const useCodeEditor = stepId === 'script' && name === 'content';

        return (
          <Fragment key={name}>
            {index > 0 && <Divider my={24} />}

            {useCodeEditor && (
              <StepCodeEditor
                value={value}
                label={opts?.title}
                onChange={(changedValue) => onChange?.(name, changedValue ?? null)}
              />
            )}

            {!useCodeEditor && isSelectInput && (
              <StepSelectInput
                helper={helper}
                label={opts?.title}
                defaultValue={value}
                isSensitive={opts?.is_sensitive}
                options={opts?.value_options ?? []}
                isDisabled={opts?.is_dont_change_value}
                onChange={(changedValue) => onChange?.(name, changedValue)}
              />
            )}

            {!useCodeEditor && !isSelectInput && (
              <StepInput
                helper={helper}
                label={opts?.title}
                defaultValue={value}
                isRequired={opts?.is_required}
                isSensitive={opts?.is_sensitive}
                isDisabled={opts?.is_dont_change_value}
                onChange={(changedValue) => onChange?.(name, changedValue)}
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
