import { BitkitLinkButton, BitkitTable } from '@bitrise/bitkit-v2';
import { Card } from '@chakra-ui/react/card';
import { Text } from '@chakra-ui/react/text';

import ContainerCardItem from '@/components/unified-editor/ContainersTab/ContainerCardItem';
import { Container, ContainerReference, ContainerType } from '@/core/models/Container';
import useNavigation from '@/hooks/useNavigation';
import { useIsReadOnlyView } from '@/hooks/useTree';

import ContainersMenu, { type ContainerReferenceSource } from './ContainersMenu';

type ContainerCardProps = {
  containers: Container[];
  definitionReferences?: ContainerReference[];
  instanceReferences?: ContainerReference[];
  isDefinitionReferencesDisabled?: boolean;
  onAddContainer: (containerId: string) => void;
  onRecreate: (containerId: string, recreate: boolean) => void;
  onRemove: (containerId: string) => void;
  source: ContainerReferenceSource;
  stepBundleId?: string;
  stepId?: string;
  stepVersion?: string;
  type: ContainerType;
};

const ContainerCard = (props: ContainerCardProps) => {
  const {
    containers,
    definitionReferences,
    instanceReferences,
    isDefinitionReferencesDisabled,
    onAddContainer,
    onRecreate,
    onRemove,
    source,
    stepBundleId,
    stepId,
    stepVersion,
    type,
  } = props;
  const { replace } = useNavigation();
  const isReadOnlyView = useIsReadOnlyView();

  const getContainerById = (containerId: string) => {
    return containers.find((c) => c.id === containerId);
  };

  const references = [...(definitionReferences || []), ...(instanceReferences || [])];
  const selectedReferenceIds = new Set(references.map((ref) => ref.id));
  const availableContainers = containers.filter((container) => !selectedReferenceIds.has(container.id));

  return (
    <Card.Root elevation={false} overflow="hidden">
      {/* A plain card, not BitkitTableCard: that one always renders a title bar, and this table has no title. */}
      <Card.Body padding="0">
        <BitkitTable.Root variant="card" rowHover={false} tableLayout="fixed">
          <BitkitTable.Header data-clarity-unmask="true">
            <BitkitTable.Row>
              <BitkitTable.ColumnHeader>
                {type === 'execution' ? 'Execution' : 'Service'} Container
              </BitkitTable.ColumnHeader>
              <BitkitTable.DefinitionColumnHeader
                method="hover"
                text='By default, this step will use an already running container if any. Check "Recreate container" to destroy it and create a clean instance.'
              >
                Behavior
              </BitkitTable.DefinitionColumnHeader>
              <BitkitTable.ColumnHeader width="96" />
            </BitkitTable.Row>
          </BitkitTable.Header>
          <BitkitTable.Body>
            {!!definitionReferences &&
              (!instanceReferences?.length || type === ContainerType.Service) &&
              definitionReferences.map((reference) => {
                const container = getContainerById(reference.id);
                return (
                  <ContainerCardItem
                    container={container}
                    isDisabled={isDefinitionReferencesDisabled}
                    key={`definition-${reference.id}`}
                    onRecreate={onRecreate}
                    onRemove={onRemove}
                    reference={reference}
                    source={source}
                    stepBundleId={stepBundleId}
                    stepId={stepId}
                    stepVersion={stepVersion}
                  />
                );
              })}
            {!!instanceReferences &&
              instanceReferences.map((reference) => {
                const container = getContainerById(reference.id);
                return (
                  <ContainerCardItem
                    key={`instance-${reference.id}`}
                    reference={reference}
                    container={container}
                    onRecreate={onRecreate}
                    onRemove={onRemove}
                    source={source}
                    stepBundleId={stepBundleId}
                    stepId={stepId}
                    stepVersion={stepVersion}
                  />
                );
              })}
            {isReadOnlyView ? (
              // Read-only (e.g. a cross-file step/step bundle defined in another module): no add menu —
              // just a note when nothing is assigned. Assigned containers render as read-only rows above.
              references.length === 0 && (
                <BitkitTable.Row>
                  <BitkitTable.Cell colSpan={3}>
                    <Text textStyle="body/md/regular" color="text/secondary">
                      No {type} containers.
                    </Text>
                  </BitkitTable.Cell>
                </BitkitTable.Row>
              )
            ) : (
              <BitkitTable.Row>
                {!containers.length ? (
                  <BitkitTable.Cell colSpan={3}>
                    <Text textStyle="body/md/regular" color="text/secondary">
                      No {type} containers available.{' '}
                      <BitkitLinkButton onClick={() => replace('/containers', { tab: type })}>
                        {`Manage ${type} containers`}
                      </BitkitLinkButton>
                    </Text>
                  </BitkitTable.Cell>
                ) : (
                  <BitkitTable.Cell colSpan={3}>
                    <ContainersMenu
                      actionType={type === ContainerType.Execution && references?.length ? 'Change' : 'Add'}
                      containers={availableContainers}
                      onSelectContainer={onAddContainer}
                      source={source}
                      stepBundleId={stepBundleId}
                      stepId={stepId}
                      stepVersion={stepVersion}
                      type={type}
                    />
                  </BitkitTable.Cell>
                )}
              </BitkitTable.Row>
            )}
          </BitkitTable.Body>
        </BitkitTable.Root>
      </Card.Body>
    </Card.Root>
  );
};

export default ContainerCard;
