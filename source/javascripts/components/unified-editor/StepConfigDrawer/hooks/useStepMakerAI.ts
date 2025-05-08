import OpenAI from 'openai';
import { useState } from 'react';

import { coderSystemPrompt, examplePrompts, plannerPrompt } from './prompts';

export type Message = {
  content: string;
  sender: 'user' | 'ai';
  type: 'message' | 'plan' | 'content';
};

type Props = {
  bitriseYml: string;
  selectedWorkflow: string;
  token: string;
};

type StepMakerState = InitialState | Planning | CodeGeneration | WaitingForBuild | BuildLogEvaluation;

type InitialState = {
  kind: 'initial';
  messages: Message[];
  examplePrompts: string[];
};

type Planning = {
  kind: 'planning';
  messages: Message[];
  userQA: Map<string, string>;
};

type CodeGeneration = {
  kind: 'codeGeneration';
  messages: Message[];
  userQA: Map<string, string>;
};

type WaitingForBuild = {
  kind: 'waitingForBuild';
  buildSlug: string;
  messages: Message[];
};

type BuildLogEvaluation = {
  kind: 'buildLogEvaluation';
  plan: string;
  messages: Message[];
  buildLogSnippet: string;
};

const useStepMakerAI = (props: Props) => {
  const { bitriseYml, selectedWorkflow, token } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);

  const client = new OpenAI({
    apiKey: token,
    dangerouslyAllowBrowser: true,
  });

  const [state, setState] = useState<StepMakerState>({
    kind: 'initial',
    examplePrompts,
    messages: [],
  });

  const sendMessage = async (input: string) => {
    setIsLoading(true);
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, { content: input, sender: 'user', type: 'message' }],
    }));

    const response = await client.responses.create({
      model: 'gpt-4o',
      instructions:
        state.kind === 'planning' ? plannerPrompt(selectedWorkflow, bitriseYml) : coderSystemPrompt(selectedWorkflow),
      input,
      previous_response_id: responseId,
      tools: [
        {
          name: 'process_plan',
          strict: false,
          parameters: {
            type: 'object',
            properties: {
              plan: {
                type: 'string',
                description: 'The text of a plan.',
              },
            },
            required: ['plan'],
            additionalProperties: false,
          },
          type: 'function',
          description:
            'The provided plan gets processed and forwarded to help the customer proceed with their workflow/bash script setup.',
        },
      ],
    });
    setIsLoading(false);
    setResponseId(response.id);
    console.log('Response:', response);

    let nextState: StepMakerState;
    switch (state.kind) {
      case 'initial':
        nextState = {
          kind: 'planning',
          messages: [...state.messages, { content: response.output_text, sender: 'ai', type: 'message' }],
          userQA: new Map(),
        };
        setState(nextState);
        break;
      case 'planning':
        nextState = {
          kind: 'planning',
          userQA: new Map(),
          messages: [...state.messages, { content: response.output_text, sender: 'ai', type: 'message' }],
        };
        break;
      case 'codeGeneration':
        break;
      case 'waitingForBuild':
        break;
      case 'buildLogEvaluation':
        break;
    }
  };

  return { isLoading, state, sendMessage };
};

export default useStepMakerAI;
