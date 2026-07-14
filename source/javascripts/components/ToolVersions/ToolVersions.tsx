import {
  BitkitAlert,
  BitkitButton,
  BitkitLink,
  BitkitTooltip,
  IconFlutter,
  IconNodejs,
  IconOpenInNew,
  IconPython,
  IconRuby,
  rem,
} from '@bitrise/bitkit-v2';
import { Stack } from '@chakra-ui/react/stack';
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
  const existingToolIds = Object.keys(tools);

  const handleAddNew = () => {
    setPendingStrategy('latest-released');
    setPendingVersion('');
    setHasPendingRow(true);
  };

  return (
    <Stack gap="24" marginBlockStart="24" maxWidth={rem(640)}>
      <Stack gap="4">
        <Text textStyle="heading/h3">Tool setup</Text>
        <Text textStyle="body/md/regular" color="text/secondary">
          Customize tools and versions required in {scope.type === 'workflow' ? 'this workflow' : 'workflows'}. Tool
          setup runs before the first step.{' '}
          <BitkitLink
            href="https://docs.bitrise.io/en/bitrise-ci/configure-builds/configuring-build-settings/configuring-tool-versions"
            isExternal
            suffixIcon={IconOpenInNew}
            colorVariant="purple"
          >
            Learn more
          </BitkitLink>
        </Text>
        <Text textStyle="body/md/regular" color="text/secondary">
          Need more flexibility or want to use an existing version file? Check out{' '}
          <BitkitLink
            href="https://docs.bitrise.io/en/bitrise-ci/configure-builds/configuring-build-settings/configuring-tool-versions#tool-setup-during-workflow-execution"
            isExternal
            suffixIcon={IconOpenInNew}
            colorVariant="purple"
          >
            CLI and step use
          </BitkitLink>
        </Text>
      </Stack>

      <Stack gap="16">
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
              isCatalogLoading={isCatalogLoading}
              onIdChange={(newId) => ToolsService.renameTool(toolId, newId, scope)}
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
      </Stack>

      {isCatalogError && <BitkitAlert variant="warning" messageText="Couldn't load tool suggestions." />}

      {existingToolIds.length === 0 && !hasPendingRow && (
        <Text textStyle="body/md/regular" color="text/primary">
          Set up the first tool. Supports{' '}
          <BitkitTooltip text="Ruby">
            <IconRuby size="16" aria-label="Ruby" />
          </BitkitTooltip>{' '}
          <BitkitTooltip text="Flutter">
            <IconFlutter size="16" aria-label="Flutter" />
          </BitkitTooltip>{' '}
          <BitkitTooltip text="Node.js">
            <IconNodejs size="16" aria-label="Node.js" />
          </BitkitTooltip>{' '}
          <BitkitTooltip text="Python">
            <IconPython size="16" aria-label="Python" />
          </BitkitTooltip>{' '}
          and many more.
        </Text>
      )}

      <BitkitButton
        variant="secondary"
        size="md"
        alignSelf="flex-start"
        state={hasPendingRow ? 'disabled' : undefined}
        onClick={handleAddNew}
      >
        Add new
      </BitkitButton>
    </Stack>
  );
};

export default ToolVersions;
