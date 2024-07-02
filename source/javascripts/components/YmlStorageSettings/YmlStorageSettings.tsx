import { useEffect, useMemo, useState } from 'react';
import { Box, Link, Text } from '@bitrise/bitkit';

import StoreInRepository from './StoreInRepository';
import StoreOnWebsite from './StoreOnWebsite';
import YmlStorageOption from './YmlStorageOption';

type YmlStorageSettingsProps = {
  appSlug: string;
  usesRepositoryYml: boolean;
  repositoryYmlAvailable: boolean;
  onUsesRepositoryYmlChangeSaved: (usesRepositoryYml: boolean) => void;
};

const YmlStorageSettings = ({
  appSlug,
  usesRepositoryYml: _initialUsesRepositoryYml,
  repositoryYmlAvailable,
  onUsesRepositoryYmlChangeSaved,
}: YmlStorageSettingsProps): JSX.Element => {
  const [initialUsesRepositoryYml, setInitialUsesRepositoryYml] = useState(_initialUsesRepositoryYml);
  const [usesRepositoryYml, setUsesRepositoryYml] = useState(_initialUsesRepositoryYml);

  const selectionDiffers = useMemo(
    () => usesRepositoryYml !== initialUsesRepositoryYml,
    [initialUsesRepositoryYml, usesRepositoryYml],
  );

  const resetStorageSettings = (): void => {
    setUsesRepositoryYml(initialUsesRepositoryYml);
  };

  useEffect(() => {
    onUsesRepositoryYmlChangeSaved(initialUsesRepositoryYml);
  }, [initialUsesRepositoryYml, onUsesRepositoryYmlChangeSaved]);

  return (
    <Box borderRadius="8" borderStyle="solid" borderWidth="1px" borderColor="neutral.80" overflow="hidden">
      <Box backgroundColor="neutral.93" paddingX="16" paddingY="12" gap="8" display="flex" flexDirection="column">
        <Text fontWeight="bold" size="3" textColor="purple.10">
          Where do you want to store the bitrise.yml file?
        </Text>
        <Text size="2" textColor="neutral.40">
          Store and manage the bitrise.yml configuration file on either bitrise.io or in your project's repository.
          Check out the{' '}
          <Link
            href="https://devcenter.bitrise.io/builds/bitrise-yml-online/"
            colorScheme="purple"
            isUnderlined
            isExternal
          >
            documentation
          </Link>{' '}
          for the details.
        </Text>
      </Box>
      <Box paddingX="16" paddingY="24">
        <Box width="750px" gap="24" display="flex" flexDirection="column">
          <Box display="flex" flexDirection="row" gap="24">
            <YmlStorageOption
              onClick={() => setUsesRepositoryYml(false)}
              icon="Globe"
              isActive={!usesRepositoryYml}
              title="Store on bitrise.io"
              description="The bitrise.yml file is stored and managed on bitrise.io."
            />
            <YmlStorageOption
              onClick={() => setUsesRepositoryYml(true)}
              icon="Branch"
              isActive={usesRepositoryYml}
              title="Store in project repository"
              available={repositoryYmlAvailable}
              // eslint-disable-next-line max-len
              description="The bitrise.yml file is stored in your project's repository and it's versioned and maintained using Git."
            />
          </Box>

          {selectionDiffers && !usesRepositoryYml && (
            <StoreOnWebsite
              appSlug={appSlug}
              onCancel={resetStorageSettings}
              onSuccess={() => setInitialUsesRepositoryYml(false)}
            />
          )}

          {selectionDiffers && usesRepositoryYml && (
            <StoreInRepository
              appSlug={appSlug}
              onCancel={resetStorageSettings}
              onSuccess={() => setInitialUsesRepositoryYml(true)}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default YmlStorageSettings;
