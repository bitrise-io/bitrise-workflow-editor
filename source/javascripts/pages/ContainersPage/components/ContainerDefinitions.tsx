import { Text } from '@bitrise/bitkit';

import JumpToDefinitionLink from '@/components/JumpToDefinitionLink/JumpToDefinitionLink';
import { useEntityDefinitionPaths, useSelectedNodeId } from '@/hooks/useTree';

type Props = {
  id: string;
};

const MULTIPLE_LABEL = 'multiple modules';

// Names the module(s) that define this container other than the one currently open, and offers a
// jump-to-definition picker over them. On a module tab the entity list is scoped to that module, so a
// listed container is always defined there too — hence "Also defined in", with the current module
// excluded from the list. On the merged view there is no single current module, so we fall back to a
// plain "Defined in". Renders nothing when the container is defined only in the current module (and in
// single-file mode, where the entity index is empty). — BIVS-3706
const ContainerDefinitions = ({ id }: Props) => {
  const selectedNodeId = useSelectedNodeId();
  const definitions = useEntityDefinitionPaths('containers', id);
  const otherDefinitions = definitions.filter((definition) => definition.nodeId !== selectedNodeId);

  if (otherDefinitions.length === 0) {
    return null;
  }

  const definedInCurrentModule = otherDefinitions.length < definitions.length;
  const paths = otherDefinitions.map((definition) => definition.path);
  const label = paths.length > 2 ? MULTIPLE_LABEL : paths.join(', ');

  return (
    <Text textStyle="body/sm/regular" color="text/secondary" mt="4">
      {definedInCurrentModule ? 'Also defined in' : 'Defined in'}{' '}
      <Text as="span" textStyle="body/sm/semibold">
        {label}
      </Text>
      {' • '}
      <JumpToDefinitionLink
        kind="containers"
        id={id}
        nodeIds={otherDefinitions.map((definition) => definition.nodeId)}
      />
    </Text>
  );
};

export default ContainerDefinitions;
