import OpenAI from 'openai';
import { useState } from 'react';

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

  const plannerPrompt = `
You are a DevOps engineer helping Bitrise CI/CD users with their bash script step. You are given an existing (functioning) workflow and editing a bash script step and a new request to improve that step.
Your task is to understand the user's request and create a high-level plan to implement the requested changes.

Technical considerations:
- DO NOT write any code or YAML, just a high-level plan.
- DO NOT assume the user uses any CI/CD tool other than Bitrise.

Make sure to ask clarifying questions if the request is not clear. Think about various edge cases, not just the happy path.

Selected workflow to edit: ${selectedWorkflow}

bitrise.yml that implements the selected workflow:
\`\`\`yml
${bitriseYml}
\`\`\`
`;

  const coderSystemPrompt = `
You are a DevOps engineer implementing Bitrise CI/CD workflows. You are given a high-level plan to implement a new feature in an existing workflow. Your task is to output the bitrise.yml file that implements the requested changes. Only output raw YML, no explanations or comments, no Markdown code blocks.
The selected workflow to improve: ${selectedWorkflow}

This is the high-level plan you need to implement. It might contain unanswered questions. In this case, use your best judgment to fill in the gaps.
`;

  const [state, setState] = useState<StepMakerState>({
    kind: 'initial',
    examplePrompts: [
      'Add a step to send a Slack message when the build fails.',
      'Add a step to run unit tests before deploying to production.',
      'Add a step to send an email notification when the build succeeds.',
    ],
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
      instructions: state.kind === 'planning' ? plannerPrompt : coderSystemPrompt,
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
