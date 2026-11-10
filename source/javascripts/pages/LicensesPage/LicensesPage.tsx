import {
  BitkitButton,
  BitkitEmptyState,
  BitkitHeading,
  BitkitLink,
  BitkitNativeSelect,
  BitkitTable,
  IconKey,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';

import StackAndMachineService, { StackAndMachineSource } from '@/core/services/StackAndMachineService';
import GlobalProps from '@/core/utils/GlobalProps';
import { useGetLicensePoolsQuery } from '@/hooks/useLicensePools';
import { useWorkflows } from '@/hooks/useWorkflows';

const LicensesPage = () => {
  const workflows = useWorkflows();
  const workspaceSlug = GlobalProps.workspaceSlug();
  const { data: licensePools, isPending } = useGetLicensePoolsQuery({
    workspaceSlug,
  });

  return (
    <Box padding="32">
      <BitkitHeading marginBlockEnd="4" data-clarity-unmask="true">
        Licenses
      </BitkitHeading>
      <Text color="text/secondary" marginBlockEnd="32" data-clarity-unmask="true">
        You can run your builds on Bitrise machines relying on license pools. Your Workflow-specific builds will run
        utilizing the selected pool.{' '}
        <BitkitLink
          colorVariant="purple"
          href="https://docs.bitrise.io/en/bitrise-ci/getting-started/unity-on-bitrise.html"
          isExternal
        >
          Learn more
        </BitkitLink>
      </Text>
      {!isPending && !licensePools?.length && (
        <BitkitEmptyState
          bodyText="Your workflow-specific builds will run utilizing the selected pool."
          icon={IconKey}
          headingText="Workflow-specific license pools"
          data-clarity-unmask="true"
        >
          <BitkitButton href={`/workspaces/${workspaceSlug}/settings/integrations`} isExternal>
            Add license pool
          </BitkitButton>
        </BitkitEmptyState>
      )}
      {!isPending && !!licensePools?.length && (
        <BitkitTable.Root variant="borderless" tableLayout="fixed">
          <BitkitTable.Header data-clarity-unmask="true">
            <BitkitTable.Row>
              <BitkitTable.ColumnHeader>Workflow</BitkitTable.ColumnHeader>
              <BitkitTable.ColumnHeader>License pool</BitkitTable.ColumnHeader>
            </BitkitTable.Row>
          </BitkitTable.Header>
          <BitkitTable.Body>
            {Object.keys(workflows).map((wfId) => {
              const value = workflows[wfId]?.meta?.['bitrise.io']?.license_pool_id || '';
              return (
                <BitkitTable.Row key={wfId}>
                  <BitkitTable.Cell>{wfId}</BitkitTable.Cell>
                  <BitkitTable.Cell>
                    <BitkitNativeSelect
                      placeholder={!value ? 'No license pool selected' : undefined}
                      optional
                      state={!wfId ? 'disabled' : undefined}
                      onChange={(e) => {
                        StackAndMachineService.updateLicensePoolId(
                          e.target.value,
                          StackAndMachineSource.Workflow,
                          wfId,
                        );
                      }}
                      size="md"
                      value={value}
                    >
                      {!!value && <option value="">No license pool selected</option>}
                      {licensePools.map((pool) => (
                        <option key={pool.id} value={pool.id}>
                          {pool.name}
                        </option>
                      ))}
                    </BitkitNativeSelect>
                  </BitkitTable.Cell>
                </BitkitTable.Row>
              );
            })}
          </BitkitTable.Body>
        </BitkitTable.Root>
      )}
    </Box>
  );
};

export default LicensesPage;
