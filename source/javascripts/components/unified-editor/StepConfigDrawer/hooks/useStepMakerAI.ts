import OpenAI from 'openai';
import { useState } from 'react';

type Message = {
  content: string;
  sender: 'user' | 'ai';
  type: 'message' | 'plan' | 'content';
};

type Props = {
  bitriseYml: string;
  selectedWorkflow: string;
  token: string;
};

const useStepMakerAI = (props: Props) => {
  const { bitriseYml, selectedWorkflow, token } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const client = new OpenAI({
    apiKey: token,
    dangerouslyAllowBrowser: true,
  });

  const systemPrompt = `
You are a DevOps engineer helping Bitrise CI/CD users with their workflows. You are given an existing (functioning) workflow and a new request to improve that workflow.
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

  const sendMessage = async (input: string) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { content: input, sender: 'user', type: 'message' }]);

    const response = await client.responses.create({
      model: 'gpt-4o',
      instructions: systemPrompt,
      input,
      previous_response_id: responseId,
    });
    setIsLoading(false);
    setResponseId(response.id);

    setMessages((prev) => [...prev, { content: response.output_text, sender: 'ai', type: 'message' }]);
  };

  return { isLoading, messages, sendMessage };
};

export default useStepMakerAI;
