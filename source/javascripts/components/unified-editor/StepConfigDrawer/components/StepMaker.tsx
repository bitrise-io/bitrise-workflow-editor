/* eslint-disable react/no-array-index-key */
import { Avatar, Box, BoxProps, Button, Input, Text } from '@bitrise/bitkit';
import { useState } from 'react';

import { useSecrets } from '@/hooks/useSecrets';

import useStepMakerAI, { Message } from '../hooks/useStepMakerAI';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
import ExpandableMessage from './ExpandableMessage';
import aiAvatar from './purr.png';

interface MessageItemProps extends BoxProps {
  message: Message;
  onPlanButtonClick?: VoidFunction;
}

const MessageItem = (props: MessageItemProps) => {
  const { message, onPlanButtonClick } = props;
  return (
    <Box display="flex" flexDir={message.sender === 'user' ? 'row-reverse' : 'row'} marginBlockEnd="8" gap="8">
      {message.sender === 'user' && (
        <Avatar
          iconName="Person"
          variant="brand"
          sx={{ borderRadius: '50%', backgroundColor: 'background/selected', svg: { color: 'icon/interactive' } }}
        />
      )}
      {message.sender === 'ai' && <Avatar name="AI" src={aiAvatar} variant="user" />}
      <Box padding="12" backgroundColor="background/secondary" borderRadius="8" flex="1">
        {message.type === 'plan' && (
          <ExpandableMessage
            buttonLabel="Proceed with plan"
            onButtonClick={onPlanButtonClick}
            title="Here is the plan"
            type="plan"
          >
            {message.content}
          </ExpandableMessage>
        )}
        {message.type === 'content' && (
          <ExpandableMessage
            buttonLabel="Approve code"
            onButtonClick={onPlanButtonClick}
            title="Here is the code"
            type="content"
          >
            {message.content}
          </ExpandableMessage>
        )}
        {message.type === 'message' && message.content}
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
    sendMessage('chat', value);
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
        {messages.length === 0 && (
          <Box
            paddingX="32"
            paddingY="40"
            backgroundColor="background/secondary"
            borderRadius="8"
            color="text/secondary"
            textAlign="center"
          >
            <Avatar name="AI" src={aiAvatar} size="64" variant="user" marginBlockEnd="12" />
            <Text marginBlockEnd="8" as="h4" textStyle="heading/h4">
              Meowdy! I'm Purr Request, your paw-sonal Step-making assistant.
            </Text>
            <Text marginBlockEnd="8" textStyle="body/md/regular">
              Just give me a whisker of a description about what you want your step to
              <br />
              do, and I’ll pounce on it for you.
            </Text>
            {!token && <Text textStyle="body/md/regular">To get started, add your ChatGPT API key as a secret.</Text>}
          </Box>
        )}
        {messages.map((message, index) => (
          <MessageItem
            key={index}
            message={message}
            onPlanButtonClick={() => sendMessage('process_with_plan', 'Proceed with code generation')}
          />
        ))}
      </Box>
      <Box as="form" display="flex" gap="8" onSubmit={handleSubmit}>
        <Input
          isDisabled={isLoading || !token}
          onChange={(e) => setValue(e.currentTarget.value)}
          size="md"
          flex="1"
          value={value}
        />
        <Button size="md" type="submit" isLoading={isLoading} isDisabled={!token}>
          Send
        </Button>
      </Box>
    </>
  );
};

export default StepMaker;
