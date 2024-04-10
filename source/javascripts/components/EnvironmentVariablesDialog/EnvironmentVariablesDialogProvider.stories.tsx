import { FocusEventHandler, useState } from 'react';
import { Box, Button, Textarea } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';

import EnvironmentVariablesDialogProvider, {
  useEnvironmentVariablesDialog,
} from './EnvironmentVariablesDialogProvider';
import { EnvironmentVariable } from './types';

const environmentVariables: EnvironmentVariable[] = [
  {
    source: 'Bitrise.io',
    key: 'BITRISE_APP_SLUG',
    value: '7ce75f61-556f-4163-8a5f-a9b16ef55a8',
    isExpand: true,
  },
  {
    source: 'Bitrise.io',
    key: 'BITRISE_BUILD_URL',
    value: 'https://app.bitrise.io/build/7ce75f61-556f-4163-8a5f-a9b16ef55a8',
    isExpand: true,
  },
  {
    source: 'Bitrise.io',
    key: 'REPOSITORY_URL',
    value: 'git@github.com:flutter/flutter.git',
    isExpand: true,
  },
];

export default {
  component: EnvironmentVariablesDialogProvider,
} as Meta<typeof EnvironmentVariablesDialogProvider>;

export const WithProps: StoryObj<typeof EnvironmentVariablesDialogProvider> = {
  decorators: [
    (Story) => {
      return (
        <EnvironmentVariablesDialogProvider onOpen={() => Promise.resolve(environmentVariables)}>
          <Story />
        </EnvironmentVariablesDialogProvider>
      );
    },
  ],
  render() {
    const { open } = useEnvironmentVariablesDialog();
    const [cursorPosition, setCursorPosition] = useState<{ start: number; end: number }>();

    const { register, getValues, setValue } = useForm({
      defaultValues: {
        input: ['hello', 'world'].join('\n'),
      },
    });

    const onOpen = () => {
      open({
        onSelect: ({ key }) => {
          const value = getValues('input');
          const { start, end } = cursorPosition ?? { start: value.length, end: value.length };

          setCursorPosition({ start, end: end + `$${key}`.length });
          setValue('input', `${value.slice(0, start)}$${key}${value.slice(end)}`);
        },
      });
    };

    const onBlur: FocusEventHandler<HTMLTextAreaElement> = (e) => {
      setCursorPosition({
        end: Math.max(e.currentTarget.selectionStart, e.currentTarget.selectionEnd),
        start: Math.min(e.currentTarget.selectionStart, e.currentTarget.selectionEnd),
      });
    };

    return (
      <Box display="flex" flexDirection="column" height="100dvh" justifyContent="center" alignItems="center" gap="8">
        <Button onClick={onOpen}>Select secret</Button>
        <Textarea {...register('input', { onBlur })} />
      </Box>
    );
  },
};
