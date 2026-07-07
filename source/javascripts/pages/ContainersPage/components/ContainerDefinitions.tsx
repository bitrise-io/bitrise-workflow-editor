import { Text } from '@bitrise/bitkit';

import EntityModuleProvenance from '@/components/EntityModuleProvenance';
import { useOtherDefiningModules } from '@/hooks/useTree';

type Props = {
  id: string;
};

// The "Also defined in <module>" line under a container row in the entity list: names the module(s)
// that define it other than the one currently open, with a jump-to-definition picker. Renders nothing
// when the container is defined only in the current module (and in single-file mode, where the entity
// index is empty). — BIVS-3706
const ContainerDefinitions = ({ id }: Props) => {
  const { nodeIds } = useOtherDefiningModules('containers', id);

  if (nodeIds.length === 0) {
    return null;
  }

  return (
    <Text textStyle="body/sm/regular" color="text/secondary" mt="4">
      <EntityModuleProvenance kind="containers" id={id} />
    </Text>
  );
};

export default ContainerDefinitions;
