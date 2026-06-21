import { Box, Text } from '@bitrise/bitkit';

import { Container, ContainerType } from '@/core/models/Container';
import { useEntitiesGroupedByFile, useIsMergedConfigSelected } from '@/hooks/useTree';

import ContainersTable from './ContainersTable';

type Props = {
  containers: Container[];
  containerUsageLookup: Map<string, string[]>;
  openDialog: () => void;
  setEditedContainer: (value: Container | null) => void;
  source: ContainerType;
};

/**
 * Renders the containers as a single table (single module-file tab / non-modular), or — on the merged
 * (Effective config) tab — one titled table per source file. `containers` is already scoped to the
 * active document, so single-file tabs need no extra filtering.
 */
const GroupedContainersTables = ({ containers, ...tableProps }: Props) => {
  const isMergedView = useIsMergedConfigSelected();
  const groups = useEntitiesGroupedByFile(
    'containers',
    containers.map((container) => container.id),
  );

  // Single-file / non-modular, or a not-yet-built index: one plain table.
  if (!isMergedView || groups.length === 0) {
    return <ContainersTable containers={containers} {...tableProps} />;
  }

  const byId = new Map(containers.map((container) => [container.id, container]));

  return (
    <>
      {groups.map((group) => (
        <Box key={group.nodeId} marginBlockEnd="32">
          <Text as="h3" textStyle="heading/h4" marginBlockEnd="12">
            {group.path}
          </Text>
          <ContainersTable
            containers={group.ids.map((id) => byId.get(id)).filter((c): c is Container => Boolean(c))}
            {...tableProps}
          />
        </Box>
      ))}
    </>
  );
};

export default GroupedContainersTables;
