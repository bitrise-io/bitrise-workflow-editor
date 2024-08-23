import { useEffect, useRef, useState } from 'react';
import { Box, Icon, Link, Notification, Text } from '@bitrise/bitkit';
import CopyToClipboard from 'react-copy-to-clipboard';

import { AppConfig } from '@/core/AppConfig';
import useMonolithApiCallback from '@/hooks/api/useMonolithApiCallback';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';

type RepoYmlStorageActionsProps = {
  appConfig: AppConfig | string;
};

const identityParser = (result: string): any => result;

export const useFormattedYml = (appConfig: AppConfig): string => {
  const [yml, setYml] = useState(typeof appConfig === 'string' ? appConfig : '');
  const formatAppConfigRef = useRef<(options?: RequestInit) => void>();
  const { failed, result, call } = useMonolithApiCallback<string>(
    '/api/cli/format',
    {
      method: 'POST',
      headers: {
        Accept: 'application/x-yaml, application/json',
      },
    },
    identityParser,
  );

  // NOTE: call function isn't referentially stable
  useEffect(() => {
    formatAppConfigRef.current = call;
  });

  // Set the js-yaml value as fallback, kick off format endpoint
  useEffect(() => {
    const yaml = BitriseYmlApi.toYml(appConfig);
    setYml(yaml);

    if (typeof appConfig === 'object') {
      formatAppConfigRef.current?.({ body: BitriseYmlApi.toJSON(yaml) });
    }
  }, [appConfig]);

  // When result finally comes in override the fallback value
  useEffect(() => {
    if (result && !failed) {
      setYml(result);
    }
  }, [result, failed]);

  return yml;
};

const RepoYmlStorageActions = ({ appConfig }: RepoYmlStorageActionsProps): JSX.Element => {
  const [actionSelected, setActionSelected] = useState<string | null>(null);
  const [clearActionTimeout, setClearActionTimeout] = useState<number | undefined>();

  const yml = useFormattedYml(appConfig);

  const selectAction = (actionName: string): void => {
    setActionSelected(actionName);

    if (clearActionTimeout) {
      window.clearTimeout(clearActionTimeout);
    }

    setClearActionTimeout(window.setTimeout(() => setActionSelected(null), 5000));
  };

  return (
    <Box display="flex" flexDirection="column" gap="16">
      <Box display="flex" flexDirection="column" gap="24">
        <CopyToClipboard text={yml} onCopy={() => selectAction('clipboard')}>
          <Box display="flex" gap="8" cursor="pointer">
            <Icon color="purple.50" name="Duplicate" />
            <Text color="purple.50">Copy the content of the current bitrise.yml file to the clipboard</Text>
          </Box>
        </CopyToClipboard>

        <Link
          href={`data:attachment/text,${encodeURIComponent(yml)}`}
          target="_blank"
          download="bitrise.yml"
          onClick={() => selectAction('download')}
        >
          <Box display="flex" gap="8">
            <Icon color="purple.50" name="Download" />
            <Text color="purple.50">Download the bitrise.yml file</Text>
          </Box>
        </Link>
      </Box>

      {actionSelected && (
        <Notification marginY="8" status="success">
          {actionSelected === 'clipboard'
            ? 'Copied the content of the current bitrise.yml file to the clipboard. '
            : 'Downloading bitrise.yml. '}
          Commit the file to the app's repository before updating the setting.
        </Notification>
      )}
    </Box>
  );
};

export default RepoYmlStorageActions;
