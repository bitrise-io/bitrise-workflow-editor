import { Box, Button, EmptyState, Link, Select, Table, Tbody, Td, Text, Th, Thead, Tr } from '@bitrise/bitkit';

import StackAndMachineService, { StackAndMachineSource } from '@/core/services/StackAndMachineService';
import GlobalProps from '@/core/utils/GlobalProps';
import { useGetLicensePoolsQuery } from '@/hooks/useLicensePools';
import { useWorkflows } from '@/hooks/useWorkflows';

const LicensesPage = () => {
  const workflows = useWorkflows();
  const workspaceSlug = GlobalProps.workspaceSlug();
  const { data: licensePools, isPending } = useGetLicensePoolsQuery({ workspaceSlug });

  return (
    <Box p="32">
      <Text as="h2" textStyle="heading/h2" marginBlockEnd="4">
        Licenses
      </Text>
      <Text color="text/secondary" marginBlockEnd="32">
        You can run your builds on Bitrise machines relying on license pools. Your Workflow-specific builds will run
        utilizing the selected pool.{' '}
        <Link
          colorScheme="purple"
          href="https://devcenter.bitrise.io/en/getting-started/unity-on-bitrise.html"
          isExternal
        >
          Learn more
        </Link>
      </Text>
      {!isPending && !licensePools?.length && (
        <EmptyState
          description="Your workflow-specific builds will run utilizing the selected pool."
          iconName="Key"
          title="Workflow-specific license pools"
        >
          <Button as="a" href={`/workspaces/${workspaceSlug}/settings/integrations`} target="_blank">
            Add license pool
          </Button>
        </EmptyState>
      )}
      {!isPending && !!licensePools?.length && (
        <Table isFixed variant="borderless">
          <Thead>
            <Tr>
              <Th>Workflow</Th>
              <Th>License pool</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.keys(workflows).map((wfId) => {
              const value = workflows[wfId].meta?.['bitrise.io']?.license_pool_id || '';
              return (
                <Tr key={wfId}>
                  <Td>{wfId}</Td>
                  <Td>
                    <Select
                      placeholder={!value ? 'No license pool selected' : undefined}
                      isDisabled={!wfId}
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
                    </Select>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default LicensesPage;
