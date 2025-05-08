/* eslint-disable react/no-array-index-key */
import { Avatar, Box, BoxProps, Button, Input, MarkdownContent, ProgressBitbot, Text } from '@bitrise/bitkit';
import { useState } from 'react';

import { useSecrets } from '@/hooks/useSecrets';

import { examplePrompts } from '../hooks/prompts';
import useStepMakerAI, { Message } from '../hooks/useStepMakerAI';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
import ExpandableMessage from './ExpandableMessage';
import aiAvatar from './purr.png';

interface MessageItemProps extends BoxProps {
  isLoading: boolean;
  message: Message;
  onPlanButtonClick?: VoidFunction;
  onSaveButtonClick?: (value: string | null) => void;
}

const MessageItem = (props: MessageItemProps) => {
  const { isLoading, message, onPlanButtonClick, onSaveButtonClick } = props;
  return (
    <Box display="flex" flexDir={message.sender === 'user' ? 'row-reverse' : 'row'} marginBlockEnd="12" gap="8">
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
            title="The Purr-fect plan"
            type="plan"
            isLoading={isLoading}
          >
            {message.content}
          </ExpandableMessage>
        )}
        {message.type === 'content' && (
          <ExpandableMessage
            buttonLabel="Apply code"
            onButtonClick={() => onSaveButtonClick?.(message.content)}
            title="Here is the purr-fect code. Apply to write it into the YML."
            type="content"
            isLoading={isLoading}
          >
            {message.content}
          </ExpandableMessage>
        )}
        {message.type === 'message' && <MarkdownContent md={message.content} />}
      </Box>
    </Box>
  );
};

type StepMakerProps = {
  onChange: (value: string | null) => void;
};

const StepMaker = (props: StepMakerProps) => {
  const { onChange } = props;
  const { workflowId } = useStepDrawerContext();

  const [value, setValue] = useState<string>('');

  const { data } = useSecrets({ appSlug: '' });
  const token = data?.find(({ key }) => key === 'OPENAI_API_KEY')?.value || '';

  const { isLoading, messages, sendMessage, reset } = useStepMakerAI({
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
      <Box marginBlockEnd="16" marginBlockStart="16" minHeight="245px">
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
            {!token && (
              <Text textStyle="body/md/regular">
                To get started, add your ChatGPT API key as a secret. The key must
                <br />
                be OPENAI_API_KEY e.g: OPENAI_API_KEY=’your_API_key’
              </Text>
            )}
            <Box display="flex" flexDir="column" gap="4" borderRadius="4" marginBlockStart="24">
              {!!token &&
                examplePrompts.map((p) => (
                  <Box
                    as="button"
                    key={p}
                    paddingY="8"
                    paddingX="12"
                    borderRadius="8"
                    background="#fff"
                    _hover={{ background: 'background/selected-hover' }}
                    marginBlockEnd="8"
                    textAlign="left"
                    textStyle="body/md/regular"
                    onClick={() => {
                      sendMessage('chat', p);
                    }}
                  >
                    {p}
                  </Box>
                ))}
            </Box>
          </Box>
        )}
        {messages.map((message, index) => (
          <MessageItem
            key={index}
            message={message}
            onPlanButtonClick={() => sendMessage('process_with_plan', 'Proceed with code generation')}
            onSaveButtonClick={onChange}
            isLoading={isLoading}
          />
        ))}
        {isLoading && <ProgressBitbot color="text/secondary" />}
        {messages.length > 0 && (
          <Box textAlign="center" marginBlockStart="8">
            <Button
              variant="tertiary"
              size="sm"
              isDanger
              leftIconName="Trash"
              onClick={() => reset()}
              isDisabled={isLoading}
            >
              Discard chat
            </Button>
          </Box>
        )}
      </Box>
      <Box as="form" display="flex" gap="8" onSubmit={handleSubmit}>
        <Input
          isDisabled={isLoading || !token}
          onChange={(e) => setValue(e.currentTarget.value)}
          size="md"
          flex="1"
          value={value}
          autoFocus
          placeholder="What do you need?"
        />
        <Button size="md" type="submit" isLoading={isLoading} isDisabled={!token}>
          Send
        </Button>
      </Box>
      <Text color="text/secondary" marginBlockStart="8" textStyle="body/sm/regular" textAlign="center">
        Purr Request uses ChatGPT4 and may not be reliable. Always review and test code before deploying.
      </Text>
    </>
  );
};

export default StepMaker;
