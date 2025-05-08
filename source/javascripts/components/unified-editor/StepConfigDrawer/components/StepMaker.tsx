/* eslint-disable react/no-array-index-key */
import { Avatar, Box, BoxProps, Button, Input } from '@bitrise/bitkit';
import { useState } from 'react';

import { useSecrets } from '@/hooks/useSecrets';

import useStepMakerAI, { Message } from '../hooks/useStepMakerAI';
import { useStepDrawerContext } from '../StepConfigDrawer.context';

interface MessageItemProps extends BoxProps {
  message: Message;
}

const MessageItem = (props: MessageItemProps) => {
  const { message } = props;
  return (
    <Box display="flex" flexDir={message.sender === 'user' ? 'row-reverse' : 'row'} marginBlockEnd="8" gap="8">
      <Avatar name={message.sender === 'user' ? 'You' : 'Bitbot'} variant="user" />
      <Box padding="12" backgroundColor="background/secondary" borderRadius="8">
        {message.content}
      </Box>
    </Box>
  );
};

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

  return (
    <>
      <Box
        marginBlockEnd="16"
        borderTop="1px solid"
        borderColor="border/minimal"
        paddingBlockStart="8"
        marginBlockStart="16"
      >
        {messages.map((message, index) => (
          <MessageItem key={index} message={message} />
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
