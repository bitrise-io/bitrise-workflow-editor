import { Card, Divider, ExpandableCard, Text } from '@bitrise/bitkit';
import { Fragment } from 'react';

import { EnvModel } from '@/core/models/BitriseYml';
import StepVariableService from '@/core/services/StepVariableService';

import StepCodeEditor from './StepCodeEditor';
import StepInput from './StepInput';
import StepSelectInput from './StepSelectInput';

type Props = {
  title?: string;
  stepId?: string;
  inputs?: EnvModel;
  defaults?: EnvModel;
  onChange?: (name: string, value: string | null) => void;
};

const StepInputGroup = ({ title, stepId, defaults = [], inputs = [], onChange }: Props) => {
  const content = (
    <>
      {defaults?.map(({ opts, ...defaultInput }, index) => {
        const name = StepVariableService.getName(defaultInput);
        const input = StepVariableService.findInput(inputs, name);
        const defaultValue = StepVariableService.getValue(defaultInput);
        const value = input ? StepVariableService.getValue(input) : '';

        const helper = { summary: opts?.summary, details: opts?.description };
        const isSelectInput = opts?.value_options && opts.value_options.length > 0;
        const useCodeEditor = stepId === 'script' && name === 'content';

        return (
          <Fragment key={name}>
            {index > 0 && <Divider my={24} />}

            {useCodeEditor && (
              <StepCodeEditor
                value={value}
                defaultValue={defaultValue}
                label={opts?.title}
                onChange={(changedValue) => onChange?.(name, changedValue ?? null)}
              />
            )}

            {!useCodeEditor && isSelectInput && (
              <StepSelectInput
                helper={helper}
                label={opts?.title}
                value={value}
                defaultValue={defaultValue}
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
                value={value}
                defaultValue={defaultValue}
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
