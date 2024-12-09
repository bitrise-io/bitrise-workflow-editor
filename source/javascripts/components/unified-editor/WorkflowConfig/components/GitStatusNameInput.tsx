import { ChangeEventHandler, useState } from 'react';
import { Box, CodeSnippet, Input, Link, Text } from '@bitrise/bitkit';
import WindowUtils from '../../../../core/utils/WindowUtils';

const TOOLTIP_MAP: Record<string, string> = {
  '<event_type>': 'PR / Push / Tag',
  '<project_slug>': 'The unique identifier of your project.',
  '<project_title>': 'Optional title of your project.',
  '<target_id>': 'Triggered Workflow',
};

const getValidationError = (value: string) => {
  const allowedPattern = /^[ A-Za-z,.():/[\]\-_|0-9<>]*$/;
  const invalidChars = Array.from(value).filter((char: string) => !allowedPattern.test(char));

  if (invalidChars.length > 0) {
    return `"${invalidChars[0]}" is not allowed. Allowed characters: A-Za-z,.():/-_0-9 []|<>`;
  }
  return '';
};

type GitStatusNameInputProps = {
  workflowId: string | undefined;
  onChange: (newValue: string, isValid: boolean) => void;
  statusReportName: string;
};

const GitStatusNameInput = (props: GitStatusNameInputProps) => {
  const { workflowId, onChange, statusReportName } = props;
  const [error, setError] = useState<string>('');

  const pageProps = WindowUtils.pageProps();
  const projectBasedTemplate = pageProps?.settings?.statusReport?.defaultProjectBasedStatusNameTemplate;

  const variables: Record<string, string | null> = {
    ...pageProps?.settings?.statusReport?.variables,
    '<target_id>': pageProps?.settings?.statusReport?.variables['<target_id>'] || workflowId || '',
    '<event_type>': 'pr',
  };

  let preview = !statusReportName ? `Preview: ${projectBasedTemplate}` : `Preview: ${statusReportName}`;
  Object.keys(variables).forEach((variable) => {
    if (variables[variable] !== null) {
      preview = preview?.replace(variable, variables[variable]);
    }
  });

  const onGitStatusNameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const newValue = e.target.value;
    const validationResult = getValidationError(newValue);
    setError(validationResult);
    onChange(newValue, validationResult === '');
  };

  return (
    <Box>
      <Input
        label="Git status name"
        helperText={
          <>
            {'Allowed characters: A-Za-z,.():/-_0-9 []|<> '}
            <Link isExternal href="https://devcenter.bitrise.io" colorScheme="purple">
              Learn more
            </Link>
          </>
        }
        errorText={error}
        placeholder={projectBasedTemplate}
        value={statusReportName}
        onChange={onGitStatusNameChange}
        withCounter
        maxLength={100}
      />
      {pageProps?.settings?.statusReport && (
        <>
          <Text color="input/text/helper" textStyle="body/sm/regular" marginBlockStart="8">
            {preview}
          </Text>
          <Text color="input/text/helper" textStyle="body/sm/regular" marginY="8">
            You can use the following variables in your string:
          </Text>
          {Object.keys(variables).map((variable) => (
            <CodeSnippet key={variable} variant="inline" tooltipLabel={TOOLTIP_MAP[variable]} marginRight="8">
              {variable}
            </CodeSnippet>
          ))}
        </>
      )}
    </Box>
  );
};

export default GitStatusNameInput;
