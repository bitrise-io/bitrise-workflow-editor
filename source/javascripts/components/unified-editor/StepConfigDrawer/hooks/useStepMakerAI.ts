import OpenAI from 'openai';
import { ResponseInput } from 'openai/resources/responses/responses';
import { useState } from 'react';

import { coderSystemPrompt, plannerPrompt } from './prompts';

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

const FUNCTION_CALL_PLAN = 'store_plan';
const FUNCTION_CALL_STORE_BASH_SCRIPT = 'store_bash_script';

// type StepMakerState = InitialState | Planning | CodeGeneration | WaitingForBuild | BuildLogEvaluation;

// type InitialState = {
//   kind: 'initial';
//   messages: Message[];
//   examplePrompts: string[];
// };

// type Planning = {
//   kind: 'planning';
//   messages: Message[];
//   userQA: Map<string, string>;
// };

// type CodeGeneration = {
//   kind: 'codeGeneration';
//   messages: Message[];
//   userQA: Map<string, string>;
// };

// type WaitingForBuild = {
//   kind: 'waitingForBuild';
//   buildSlug: string;
//   messages: Message[];
// };

// type BuildLogEvaluation = {
//   kind: 'buildLogEvaluation';
//   plan: string;
//   messages: Message[];
//   buildLogSnippet: string;
// };

const useStepMakerAI = (props: Props) => {
  const { bitriseYml, selectedWorkflow, token } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [toolOutputId, setToolOutputId] = useState<string | null>(null);

  const client = new OpenAI({
    apiKey: token,
    dangerouslyAllowBrowser: true,
  });

  const reset = () => {
    setMessages([]);
    setToolOutputId(null);
    setResponseId(null);
  };

  const sendMessage = async (action: 'chat' | 'process_with_plan', input: string) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { content: input, sender: 'user', type: 'message' }]);

    const inputs: ResponseInput = [
      {
        content: input,
        role: 'user', // | 'assistant' | 'system' | 'developer';
        type: 'message',
      },
    ];

    if (toolOutputId) {
      let output = 'ok';
      if (action !== 'process_with_plan') {
        output = 'requires refinement';
      }

      inputs.push({
        output,
        call_id: toolOutputId,
        type: 'function_call_output',
      });

      setToolOutputId('');
    }

    let instructions = plannerPrompt(selectedWorkflow, bitriseYml);
    if (action === 'process_with_plan') {
      instructions = coderSystemPrompt(selectedWorkflow, bitriseYml);
    }

    // let selectedTool = FUNCTION_CALL_PLAN;
    // if (action === 'process_with_plan') {
    //   selectedTool = FUNCTION_CALL_STORE_BASH_SCRIPT;
    // }

    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      instructions,
      input: inputs,
      previous_response_id: responseId,
      tools: [
        {
          name: FUNCTION_CALL_PLAN,
          strict: false,
          parameters: {
            type: 'object',
            properties: {
              plan: {
                type: 'string',
                description: 'The plan you created in Markdown.',
              },
              questions: {
                description: 'The questions to ask the user.',
                type: 'array',
                items: {
                  type: 'string',
                },
                minItems: 0,
                maxItems: 3,
              },
            },
            required: ['plan', 'questions'],
            additionalProperties: false,
          },
          type: 'function',
          description: 'Store the current high-level plan for the next phase (code generation).',
        },
        {
          name: FUNCTION_CALL_STORE_BASH_SCRIPT,
          strict: false,
          parameters: {
            type: 'object',
            properties: {
              script: {
                type: 'string',
                description: 'The text of the bash script.',
              },
            },
            required: ['script'],
            additionalProperties: false,
          },
          type: 'function',
          description:
            'The provided bash script gets stored in the selected Bitrise workflow script step. The script is a part of the workflow.',
        },
      ],
      // tool_choice: {
      //   type: 'function',
      //   name: selectedTool,
      // },
    });
    setIsLoading(false);
    setResponseId(response.id);

    console.log('Response:', response);

    response.output.forEach((outputItem) => {
      if (outputItem.type === 'message') {
        setMessages((prev) => [...prev, { content: response.output_text, sender: 'ai', type: 'message' }]);
      } else if (outputItem.type === 'function_call' && outputItem.name === FUNCTION_CALL_PLAN) {
        setToolOutputId(outputItem.call_id);
        setMessages((prev) => [
          ...prev,
          { content: JSON.parse((outputItem as any).arguments).plan, sender: 'ai', type: 'plan' },
        ]);
      } else if (outputItem.type === 'function_call' && outputItem.name === FUNCTION_CALL_STORE_BASH_SCRIPT) {
        setToolOutputId(outputItem.call_id);
        setMessages((prev) => [
          ...prev,
          { content: JSON.parse((outputItem as any).arguments).script, sender: 'ai', type: 'content' },
        ]);
      }
    });
  };

  return { isLoading, messages, sendMessage, reset };
};

export default useStepMakerAI;
