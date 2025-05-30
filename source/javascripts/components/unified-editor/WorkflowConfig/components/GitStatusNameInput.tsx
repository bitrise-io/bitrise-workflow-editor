import { Box, CodeSnippet, Input, Link, Text } from '@bitrise/bitkit';
import { ChangeEventHandler, useState } from 'react';

import PageProps from '@/core/utils/PageProps';

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
  targetId: string | undefined;
  onChange: (newValue: string, isValid: boolean) => void;
  statusReportName: string;
};

const GitStatusNameInput = (props: GitStatusNameInputProps) => {
  const { targetId, onChange, statusReportName } = props;
  const [error, setError] = useState<string>('');

  const statusReport = PageProps.settings()?.statusReport;
  const projectBasedTemplate = statusReport?.defaultProjectBasedStatusNameTemplate;

  const variables: Record<string, string | null> = {
    ...statusReport?.variables,
    '<target_id>': statusReport?.variables['<target_id>'] || targetId || '',
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
        size="md"
        label="Git status name"
        helperText={
          <>
            {'Allowed characters: A-Za-z,.():/-_0-9 []|<> '}
            <Link
              isExternal
              href="https://devcenter.bitrise.io/en/builds/configuring-build-settings/reporting-the-build-status-to-your-git-hosting-provider.html#custom-status-reports"
              colorScheme="purple"
            >
              Learn more
            </Link>
          </>
        }
        errorText={error}
        placeholder={projectBasedTemplate}
        value={statusReportName}
        onChange={onGitStatusNameChange}
        maxLength={100}
      />
      {statusReport && (
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
