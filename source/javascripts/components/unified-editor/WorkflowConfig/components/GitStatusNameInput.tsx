import { Input } from '@bitrise/bitkit';
import { BitkitCodeSnippet, BitkitLink } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { ChangeEventHandler, Fragment, useState } from 'react';

import PageProps from '@/core/utils/PageProps';

const VARIABLE_DESCRIPTIONS: Record<string, string> = {
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
  isDisabled?: boolean;
};

const GitStatusNameInput = (props: GitStatusNameInputProps) => {
  const { targetId, onChange, statusReportName, isDisabled } = props;
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
        isDisabled={isDisabled}
        label="Git status name"
        helperText={
          <>
            {'Allowed characters: A-Za-z,.():/-_0-9 []|<> '}
            <BitkitLink
              isExternal
              href="https://docs.bitrise.io/en/bitrise-ci/configure-builds/configuring-build-settings/reporting-the-build-status-to-your-git-hosting-provider.html#custom-status-reports"
              colorVariant="purple"
            >
              Learn more
            </BitkitLink>
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
          <Text color="text/helper" textStyle="body/sm/regular" marginBlockStart="8">
            {preview}
          </Text>
          <Text color="text/helper" textStyle="body/sm/regular" marginBlock="8">
            You can use the following variables in your string:
          </Text>
          <Box as="dl" display="grid" gridTemplateColumns="auto 1fr" alignItems="baseline" columnGap="8" rowGap="4">
            {Object.keys(variables).map((variable) => (
              <Fragment key={variable}>
                <Box as="dt">
                  <BitkitCodeSnippet variant="inline" interactive>
                    {variable}
                  </BitkitCodeSnippet>
                </Box>
                <Text as="dd" color="text/helper" textStyle="body/sm/regular">
                  {VARIABLE_DESCRIPTIONS[variable]}
                </Text>
              </Fragment>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default GitStatusNameInput;
