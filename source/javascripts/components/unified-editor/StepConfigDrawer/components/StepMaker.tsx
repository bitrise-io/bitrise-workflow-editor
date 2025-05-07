/* eslint-disable react/no-array-index-key */
import { Box, Button, Input } from '@bitrise/bitkit';
import { useState } from 'react';

import { useSecrets } from '@/hooks/useSecrets';

import useStepMakerAI from '../hooks/useStepMakerAI';
import { useStepDrawerContext } from '../StepConfigDrawer.context';

const StepMaker = () => {
  const { workflowId } = useStepDrawerContext();

  const [value, setValue] = useState<string>('');

  const { data } = useSecrets({ appSlug: '' });
  const token = data?.find(({ key }) => key === 'OPENAI_API_KEY')?.value || '';

  const { isLoading, messages, sendMessage } = useStepMakerAI({
    bitriseYml: '',
    selectedWorkflow: workflowId,
    token,
  });

  const handleSubmit = (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    sendMessage(value);
    setValue('');
  };

  if (!token) {
    return 'No token provided';
  }

  return (
    <>
      <Box marginBlockEnd="16">
        {messages.map((message, index) => (
          <Box
            key={index}
            display="flex"
            flexDir={message.sender === 'user' ? 'row-reverse' : 'row'}
            gap="8"
            marginBlockEnd="8"
          >
            <Box
              padding="8"
              backgroundColor={message.sender === 'user' ? 'blue.100' : 'gray.100'}
              borderRadius="8"
              maxWidth="80%"
            >
              {message.content}
            </Box>
          </Box>
        ))}
      </Box>
      <Box as="form" display="flex" gap="8" onSubmit={handleSubmit}>
        <Input
          isDisabled={isLoading}
          onChange={(e) => setValue(e.currentTarget.value)}
          size="md"
          flex="1"
          value={value}
        />
        <Button size="md" type="submit" isLoading={isLoading}>
          Send
        </Button>
      </Box>
    </>
  );
};

export default StepMaker;
