import { Text } from '@bitrise/bitkit';

import CrossFileProvenanceText from '@/components/CrossFileProvenanceText';
import JumpToDefinitionLink from '@/components/JumpToDefinitionLink/JumpToDefinitionLink';
import { useEntityDefinitionPaths } from '@/hooks/useTree';

type Props = {
  id: string;
};

// A container defined in more than one module: name the defining modules and offer a
// jump-to-definition picker over them. Renders nothing for the common single-definition case (and in
// single-file mode, where the entity index is empty). — BIVS-3706
const ContainerDefinitions = ({ id }: Props) => {
  const definitions = useEntityDefinitionPaths('containers', id);

  if (definitions.length <= 1) {
    return null;
  }

  return (
    <Text textStyle="body/sm/regular" color="text/secondary" mt="4">
      <CrossFileProvenanceText definingPaths={definitions.map((definition) => definition.path)} />
      {' • '}
      <JumpToDefinitionLink kind="containers" id={id} />
    </Text>
  );
};

export default ContainerDefinitions;
