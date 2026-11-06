import {
  BitkitLinkButton,
  BitkitRowAction,
  BitkitTable,
  IconDetails,
  IconMinusCircle,
  IconPencil,
  rem,
  useResponsive,
} from '@bitrise/bitkit-v2';
import { useDisclosure } from '@chakra-ui/react/hooks';
import { Text } from '@chakra-ui/react/text';
import { useState } from 'react';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { Container, ContainerType } from '@/core/models/Container';
import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import { useIsReadOnlyView } from '@/hooks/useTree';

import ContainerDefinitions from './ContainerDefinitions';
import ContainerUsageDialog from './ContainerUsageDialog';
import DeleteContainerDialog from './DeleteContainerDialog';

type ContainersTableProps = {
  containers: Container[];
  containerUsageLookup: Map<string, string[]>;
  openDialog: () => void;
  setEditedContainer: (value: Container | null) => void;
  source: ContainerType;
};

const ContainersTable = ({
  containers,
  containerUsageLookup,
  openDialog,
  setEditedContainer,
  source,
}: ContainersTableProps) => {
  const isReadOnlyView = useIsReadOnlyView();
  const [selectedContainerId, setSelectedContainerId] = useState<Container['id']>('');

  const {
    open: isContainerUsageDialogOpen,
    onOpen: onContainerUsageDialogOpen,
    onClose: onContainerUsageDialogClose,
  } = useDisclosure();
  const {
    open: isDeleteContainerDialogOpen,
    onOpen: onDeleteContainerDialogOpen,
    onClose: onDeleteContainerDialogClose,
  } = useDisclosure();

  const { isMobile } = useResponsive();

  return (
    <>
      <BitkitTable.ScrollArea>
        <BitkitTable.Root tableLayout={isMobile ? undefined : 'fixed'}>
          <BitkitTable.Header data-clarity-unmask="true">
            <BitkitTable.Row>
              <BitkitTable.ColumnHeader width={rem(160)}>Unique ID</BitkitTable.ColumnHeader>
              <BitkitTable.ColumnHeader>Image</BitkitTable.ColumnHeader>
              <BitkitTable.ColumnHeader>Used in</BitkitTable.ColumnHeader>
              <BitkitTable.ColumnHeader width="128" />
            </BitkitTable.Row>
          </BitkitTable.Header>
          <BitkitTable.Body>
            {containers.map((container) => {
              const workflowCount = containerUsageLookup.get(container.id)?.length || 0;
              const usageLabel =
                workflowCount === 0 ? '(not used)' : workflowCount === 1 ? '1 Workflow' : `${workflowCount} Workflows`;

              const openContainer = () => {
                setEditedContainer(container);
                openDialog();
              };

              const actions: BitkitRowAction[] = isReadOnlyView
                ? // Merged/cross-file (read-only) view: edit + delete collapse to a single read-only detail view.
                  [
                    {
                      icon: IconDetails,
                      label: 'View container details',
                      onClick: openContainer,
                    },
                  ]
                : [
                    {
                      icon: IconPencil,
                      label: 'Edit container',
                      onClick: openContainer,
                    },
                    {
                      danger: true,
                      icon: IconMinusCircle,
                      label: 'Delete container',
                      onClick: () => {
                        setSelectedContainerId(container.id);
                        onDeleteContainerDialogOpen();
                        segmentTrack('Container Usage Popup Shown', {
                          app_slug: PageProps.appSlug(),
                          workspace_slug: GlobalProps.workspaceSlug(),
                          number_of_containers_in_use: workflowCount,
                          source: 'container_deletion_dialog',
                        });
                      },
                    },
                  ];

              return (
                <BitkitTable.Row key={container.id}>
                  <BitkitTable.Cell>
                    <Text textStyle="body/md/regular">{container.id}</Text>
                    <ContainerDefinitions id={container.id} />
                  </BitkitTable.Cell>
                  <BitkitTable.Cell>
                    <Text textStyle="body/md/regular">{container.userValues.image}</Text>
                  </BitkitTable.Cell>
                  <BitkitTable.Cell>
                    {workflowCount === 0 ? (
                      <Text color="text/tertiary">{usageLabel}</Text>
                    ) : (
                      <BitkitLinkButton
                        onClick={() => {
                          onContainerUsageDialogOpen();
                          setSelectedContainerId(container.id);
                          segmentTrack('Container Usage Popup Shown', {
                            app_slug: PageProps.appSlug(),
                            workspace_slug: GlobalProps.workspaceSlug(),
                            number_of_containers_in_use: workflowCount,
                            source:
                              source === ContainerType.Execution
                                ? 'execution_containers_subtab'
                                : 'service_containers_subtab',
                          });
                        }}
                      >
                        {usageLabel}
                      </BitkitLinkButton>
                    )}
                  </BitkitTable.Cell>
                  <BitkitTable.RowActionsCell actions={actions} />
                </BitkitTable.Row>
              );
            })}
          </BitkitTable.Body>
        </BitkitTable.Root>
      </BitkitTable.ScrollArea>
      <ContainerUsageDialog
        isOpen={isContainerUsageDialogOpen}
        onClose={onContainerUsageDialogClose}
        selectedContainerId={selectedContainerId}
      />
      <DeleteContainerDialog
        isOpen={isDeleteContainerDialogOpen}
        onClose={onDeleteContainerDialogClose}
        selectedContainerId={selectedContainerId}
        type="definition"
        source={source}
      />
    </>
  );
};

export default ContainersTable;
