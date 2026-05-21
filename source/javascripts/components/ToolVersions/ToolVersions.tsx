import { BitkitButton, BitkitLink } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';

import ToolsService, { ToolScope } from '@/core/services/ToolsService';
import { useToolsForScope } from '@/hooks/useTools';

import ToolRow from './ToolRow';

const ToolVersions = ({ workflowId }: { workflowId?: string }) => {
  const scope: ToolScope = workflowId ? { type: 'workflow', workflowId } : { type: 'root' };
  const tools = useToolsForScope(scope);

  return (
    <Box display="flex" flexDirection="column" gap="24" marginBlockStart="24" maxWidth={640}>
      <Box display="flex" flexDirection="column" gap="8">
        <Text textStyle="heading/h3">Tool setup</Text>
        <Text textStyle="body/md/regular" color="text/secondary">
          Configure what tools and versions are required for this workflow to work. Tool setup runs before the first
          step. <BitkitLink href="#">Learn more</BitkitLink>
        </Text>
      </Box>

      {Object.keys(tools).length > 0 && (
        <Box display="flex" flexDirection="column" gap="16">
          {Object.entries(tools).map(([toolId, versionString]) => (
            <ToolRow
              key={toolId}
              toolId={toolId}
              versionString={versionString}
              existingToolIds={Object.keys(tools)}
              scope={scope}
              autoFocus={toolId === ''}
              onRemove={() => ToolsService.deleteTool(toolId, scope)}
            />
          ))}
        </Box>
      )}

      <BitkitButton
        variant="secondary"
        size="md"
        alignSelf="flex-start"
        state={'' in tools ? 'disabled' : undefined}
        onClick={() => ToolsService.setTool('', 'latest-released', '', scope)}
      >
        Add new
      </BitkitButton>
    </Box>
  );
};

export default ToolVersions;
