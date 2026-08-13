import {
  BitkitAlert,
  BitkitButton,
  BitkitLink,
  BitkitLinkButton,
  BitkitTooltip,
  IconFlutter,
  IconNodejs,
  IconOpenInNew,
  IconPython,
  IconRuby,
  rem,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Stack } from '@chakra-ui/react/stack';
import { Text } from '@chakra-ui/react/text';
import { useState } from 'react';

import { VersionStrategy } from '@/core/models/Tools';
import ToolsService, { ToolScope } from '@/core/services/ToolsService';
import useNavigation from '@/hooks/useNavigation';
import { useToolCatalog, useToolsForScope } from '@/hooks/useTools';
import { paths } from '@/routes';

import ToolRow from './ToolRow';

const DOCS_URL =
  'https://docs.bitrise.io/en/bitrise-ci/configure-builds/configuring-build-settings/configuring-tool-versions';
const CLI_DOCS_URL = `${DOCS_URL}#tool-setup-during-workflow-execution`;

const HeaderLinkSeparator = () => (
  <Text as="span" color="text/tertiary" aria-hidden="true">
    &middot;
  </Text>
);

type Props = {
  workflowId?: string;
  /** Where the "Installed tools" link points: the selected stack's report, or the stack index. */
  stackReportUrl: string;
  /** The store drops mutations here, so the rows must not pretend to accept edits. */
  isReadOnly?: boolean;
};

const ToolVersions = ({ workflowId, stackReportUrl, isReadOnly }: Props) => {
  const scope: ToolScope = workflowId ? { type: 'workflow', workflowId } : { type: 'root' };
  const tools = useToolsForScope(scope);
  const { replace } = useNavigation();
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
    <Stack gap="24" marginBlockStart="24" maxWidth={rem(800)}>
      <Stack gap="8">
        <Stack gap="4">
          <Text textStyle="heading/h3">Tool setup</Text>
          <Text textStyle="body/md/regular" color="text/secondary">
            Customize tools and versions required in {scope.type === 'workflow' ? 'this workflow' : 'workflows'}. Tool
            setup runs before the first step.
          </Text>
        </Stack>
        <Box display="flex" alignItems="center" flexWrap="wrap" gap="8">
          <BitkitLink href={DOCS_URL} isExternal suffixIcon={IconOpenInNew} colorVariant="purple">
            Learn more
          </BitkitLink>
          <HeaderLinkSeparator />
          <BitkitLink href={CLI_DOCS_URL} isExternal suffixIcon={IconOpenInNew} colorVariant="purple">
            CLI and step use
          </BitkitLink>
          <HeaderLinkSeparator />
          <BitkitLink href={stackReportUrl} isExternal suffixIcon={IconOpenInNew} colorVariant="purple">
            Installed tools
          </BitkitLink>
          {scope.type === 'workflow' && (
            <>
              <HeaderLinkSeparator />
              <BitkitLinkButton onClick={() => replace(paths.stacksAndMachines)}>Global settings</BitkitLinkButton>
            </>
          )}
        </Box>
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
              isReadOnly={isReadOnly}
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
            isReadOnly={isReadOnly}
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
        {existingToolIds.length === 0 && !hasPendingRow && (
          <Box display="flex" alignItems="center" minHeight="48">
            <Text textStyle="body/md/regular" color="text/primary">
              {isReadOnly ? (
                'No tools are set up here.'
              ) : (
                <>
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
                </>
              )}
            </Text>
          </Box>
        )}
      </Stack>

      {isCatalogError && <BitkitAlert variant="warning" messageText="Couldn't load tool suggestions." />}

      {!isReadOnly && (
        <BitkitButton
          variant="secondary"
          size="md"
          alignSelf="flex-start"
          state={hasPendingRow ? 'disabled' : undefined}
          onClick={handleAddNew}
        >
          Add new
        </BitkitButton>
      )}
    </Stack>
  );
};

export default ToolVersions;
