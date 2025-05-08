import OpenAI from 'openai';
import { ResponseInput } from 'openai/resources/responses/responses';
import { useState } from 'react';

import { plannerPrompt } from './prompts';

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

  const client = new OpenAI({
    apiKey: token,
    dangerouslyAllowBrowser: true,
  });

  const [messages, setMessages] = useState<Message[]>([]);

  const coderSystemPrompt = `
You are a DevOps engineer implementing Bitrise CI/CD workflows. You are given a high-level plan to implement a new feature in an existing workflow. Your task is to output the bitrise.yml file that implements the requested changes. Only output raw YML, no explanations or comments, no Markdown code blocks.
The selected workflow to improve: ${selectedWorkflow}

This is the high-level plan you need to implement. It might contain unanswered questions. In this case, use your best judgment to fill in the gaps.
`;

  // const [state, setState] = useState<StepMakerState>({
  //   kind: 'initial',
  //   examplePrompts: [
  //     'Add a step to send a Slack message when the build fails.',
  //     'Add a step to run unit tests before deploying to production.',
  //     'Add a step to send an email notification when the build succeeds.',
  //   ],
  //   messages: [],
  // });

  const sendMessage = async (action: 'chat' | 'process_with_plan', input: string) => {
    setIsLoading(true);
    console.log(coderSystemPrompt, action);
    setMessages((prev) => [...prev, { content: input, sender: 'user', type: 'message' }]);

    const inputs: ResponseInput = [
      {
        content: input,
        role: 'user', // | 'assistant' | 'system' | 'developer';
        type: 'message',
      },
    ];

    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      instructions: plannerPrompt(selectedWorkflow, bitriseYml),
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
          name: 'store_bash_script',
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
      tool_choice: {
        type: 'function',
        name: FUNCTION_CALL_PLAN,
      },
    });
    setIsLoading(false);
    setResponseId(response.id);

    console.log('Response:', response);

    // let type = 'message';
    // if(response.output[0].type === 'function_call' &&
    //   response.output[0].name === 'process_plan' )
    //   {
    //     type = 'plan';
    //   }
    //   [
    //     {
    //         "id": "fc_681c74a030b08191a5101aedcfebcef3050d103f60d8a0dc",
    //         "type": "function_call",
    //         "status": "completed",
    //         "arguments": "{\"plan\":\"1. Research Method to Fetch External IP:\\n   - Use a reliable external service or command that returns the external IP address, such as `curl` with a service like `http://ipinfo.io/ip` or `http://ifconfig.me`.\\n\\n2. Error Handling:\\n   - Ensure the command can handle potential errors gracefully. For example, handle situations where the external service is unreachable or returns an unexpected result.\\n\\n3. Security Considerations:\\n   - Ensure that using an external service does not expose sensitive information about your environment.\\n\\n4. Integration with the Bitrise Workflow:\\n   - Add the command to the existing bash script step within your Bitrise workflow.\\n   - Use `echo` to print the result to the console.\\n\\n5. Testing:\\n   - Test the script in a controlled environment to ensure it works as expected without throwing errors.\\n\\n6. Documentation:\\n   - Optionally update any relevant documentation to ensure the process is clear for future reference.\"}",
    //         "call_id": "call_YRQHlxiphLgI5wY41QDNvGTl",
    //         "name": "process_plan"
    //     }
    // ]

    if (response.output[0].type === 'message') {
      setMessages((prev) => [...prev, { content: response.output_text, sender: 'ai', type: 'message' }]);
    } else if (response.output[0].type === 'function_call' && response.output[0].name === FUNCTION_CALL_PLAN) {
      setMessages((prev) => [
        ...prev,
        { content: JSON.parse((response.output[0] as any).arguments).plan, sender: 'ai', type: 'plan' },
      ]);
    }
    // let nextState: StepMakerState;
    // switch (state.kind) {
    //   case 'initial':
    //     nextState = {
    //       kind: 'planning',
    //       messages: [...state.messages, { content: response.output_text, sender: 'ai', type: 'message' }],
    //       userQA: new Map(),
    //     };
    //     setState(nextState);
    //     break;
    //   case 'planning':
    //     nextState = {
    //       kind: 'planning',
    //       userQA: new Map(),
    //       messages: [...state.messages, { content: response.output_text, sender: 'ai', type: 'message' }],
    //     };
    //     break;
    //   case 'codeGeneration':
    //     break;
    //   case 'waitingForBuild':
    //     break;
    //   case 'buildLogEvaluation':
    //     break;
    // }
  };

  return { isLoading, messages, sendMessage };
};

export default useStepMakerAI;
