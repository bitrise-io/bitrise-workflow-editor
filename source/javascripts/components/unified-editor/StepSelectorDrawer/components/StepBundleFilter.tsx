import { useState } from 'react';
import { Box, BoxProps, Button, Card, EmptyState, Link, SearchInput, Text } from '@bitrise/bitkit';
import { useModalContext } from '@chakra-ui/react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const StepBundleFilter = (props: BoxProps) => {
  const { onClose } = useModalContext();
  const [filterString, setFilterString] = useState('');
  const { yml } = useBitriseYmlStore((s) => ({ yml: s.yml }));
  const stepBundlesLength = Object.keys(yml.step_bundles || {}).length;
  console.log('yml', yml);

  const filteredItems = Object.keys(yml.step_bundles || {}).filter((stepBundleName) => {
    const lowerCaseFilterString = filterString.toLowerCase();
    if (typeof stepBundleName === 'string' && stepBundleName.toLowerCase().includes(lowerCaseFilterString)) {
      return true;
    }
    return false;
  });

  const handleClick = (stepBundleName: string) => {
    console.log(stepBundleName);
    onClose();
  };

  return (
    <Box {...props}>
      {stepBundlesLength > 0 ? (
        <>
          <SearchInput
            placeholder="Filter by name..."
            onChange={(value: string) => setFilterString(value)}
            value={filterString}
          />
          {filteredItems.length > 0 ? (
            filteredItems.map((stepBundleName) => {
              return (
                <Card
                  key={stepBundleName}
                  variant="outline"
                  padding="8px 12px"
                  marginBlockStart="16"
                  _hover={{ borderColor: 'border/hover', cursor: 'pointer' }}
                  onClick={() => handleClick(stepBundleName)}
                >
                  <Text textStyle="body/lg/semibold" marginBlockEnd="4">
                    {stepBundleName}
                  </Text>
                  <Text textStyle="body/md/regular" color="text/secondary">
                    Not used by any Workflows
                  </Text>
                </Card>
              );
            })
          ) : (
            <EmptyState
              iconName="Magnifier"
              title="No Step bundles are matching your filter"
              description=" Modify your filters to get results."
              marginBlockStart="16"
            >
              <Button variant="secondary" onClick={() => setFilterString('')}>
                Clear filters
              </Button>
            </EmptyState>
          )}
        </>
      ) : (
        <EmptyState
          iconName="Steps"
          title="Your Step bundles will appear here"
          description="With Step bundles, you can create reusable chunks of configuration. You can create Step bundles in the YML."
        >
          <Button variant="tertiary" rightIconName="ArrowNorthEast">
            <Link
              isExternal
              href="https://devcenter.bitrise.io/en/steps-and-workflows/introduction-to-steps/step-bundles.html"
            >
              Read documentations
            </Link>
          </Button>
        </EmptyState>
      )}
    </Box>
  );
};

export default StepBundleFilter;
