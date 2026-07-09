import { BitkitAlert, BitkitButton, BitkitLink, IconOpenInNew, rem } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { useState } from 'react';

import { VersionStrategy } from '@/core/models/Tools';
import ToolsService, { ToolScope } from '@/core/services/ToolsService';
import { useToolCatalog, useToolsForScope } from '@/hooks/useTools';

import ToolRow from './ToolRow';

const ToolVersions = ({ workflowId }: { workflowId?: string }) => {
  const scope: ToolScope = workflowId ? { type: 'workflow', workflowId } : { type: 'root' };
  const tools = useToolsForScope(scope);
  const { data: catalog, isLoading: isCatalogLoading, isError: isCatalogError } = useToolCatalog();
  const [hasPendingRow, setHasPendingRow] = useState(false);
  const [pendingStrategy, setPendingStrategy] = useState<VersionStrategy>('latest-released');
  const [pendingVersion, setPendingVersion] = useState('');

  const allowUnset = scope.type === 'workflow';
  const isCatalogReady = !!catalog;
  const existingToolIds = Object.keys(tools);

  const handleAddNew = () => {
    setPendingStrategy('latest-released');
    setPendingVersion('');
    setHasPendingRow(true);
  };

  return (
    <Box display="flex" flexDirection="column" gap="24" marginBlockStart="24" maxWidth={rem(640)}>
      <Box display="flex" flexDirection="column" gap="8">
        <Text textStyle="heading/h3">Tool setup</Text>
        <Text textStyle="body/md/regular" color="text/secondary">
          Configure what tools and versions are required for this workflow to work. Tool setup runs before the first
          step.{' '}
          <BitkitLink href="#" isExternal suffixIcon={IconOpenInNew} colorVariant="purple">
            Learn more
          </BitkitLink>
        </Text>
      </Box>

      <Box display="flex" flexDirection="column" gap="16">
        {Object.entries(tools).map(([toolId, versionString]) => {
          const parsed = ToolsService.parseToolVersion(versionString);
          const versionValue =
            parsed.strategy === 'exact' ? parsed.version : parsed.strategy === 'unset' ? '' : (parsed.prefix ?? '');
          return (
            <ToolRow
              key={toolId}
              toolId={toolId}
              strategy={parsed.strategy}
              version={versionValue}
              existingToolIds={existingToolIds}
              catalog={catalog}
              allowUnset={allowUnset}
              isCatalogReady={isCatalogReady}
              isCatalogLoading={isCatalogLoading}
              onIdChange={(newId) => {
                ToolsService.deleteTool(toolId, scope);
                ToolsService.setTool(newId, parsed.strategy, versionValue, scope);
              }}
              onStrategyChange={(strategy, ver) => ToolsService.setTool(toolId, strategy, ver, scope)}
              onVersionChange={(ver) => ToolsService.setTool(toolId, parsed.strategy, ver, scope)}
              onRemove={() => ToolsService.deleteTool(toolId, scope)}
            />
          );
        })}
        {hasPendingRow && (
          <ToolRow
            toolId=""
            strategy={pendingStrategy}
            version={pendingVersion}
            existingToolIds={existingToolIds}
            catalog={catalog}
            allowUnset={allowUnset}
            autoFocus
            isCatalogReady={isCatalogReady}
            isCatalogLoading={isCatalogLoading}
            onIdChange={(newId) => {
              ToolsService.setTool(newId, pendingStrategy, pendingVersion, scope);
              setHasPendingRow(false);
            }}
            onStrategyChange={(strategy, ver) => {
              setPendingStrategy(strategy);
              setPendingVersion(ver);
            }}
            onVersionChange={(ver) => setPendingVersion(ver)}
            onRemove={() => setHasPendingRow(false)}
          />
        )}
      </Box>

      {isCatalogError && <BitkitAlert variant="warning" messageText="Couldn't load tool suggestions." />}

      <BitkitButton
        variant="secondary"
        size="md"
        alignSelf="flex-start"
        state={hasPendingRow ? 'disabled' : undefined}
        onClick={handleAddNew}
      >
        Add new
      </BitkitButton>
    </Box>
  );
};

export default ToolVersions;
