import { Card, DefinitionTooltip, Link, Table, Tbody, Td, Text, Th, Thead, Tr } from '@bitrise/bitkit';

import ContainerCardItem from '@/components/unified-editor/ContainersTab/ContainerCardItem';
import { Container, ContainerReference, ContainerType } from '@/core/models/Container';
import useNavigation from '@/hooks/useNavigation';

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

  const getContainerById = (containerId: string) => {
    return containers.find((c) => c.id === containerId);
  };

  const references = [...(definitionReferences || []), ...(instanceReferences || [])];
  const selectedReferenceIds = new Set(references.map((ref) => ref.id));
  const availableContainers = containers.filter((container) => !selectedReferenceIds.has(container.id));

  return (
    <Card variant="outline" overflow="hidden">
      <Table variant="borderless" disableRowHover isFixed>
        <Thead>
          <Tr>
            <Th>
              <Text px="12" color="text/primary">
                {type === 'execution' ? 'Execution' : 'Service'} Container
              </Text>
            </Th>
            <Th color="text/primary">
              <DefinitionTooltip label='By default, this step will use an already running container if any. Check "Recreate container" to destroy it and create a clean instance.'>
                Behavior
              </DefinitionTooltip>
            </Th>
            <Th width="60px" />
          </Tr>
        </Thead>
        <Tbody>
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
          <Tr>
            {!containers.length ? (
              <Td colSpan={3}>
                <Text textStyle="body/md/regular" color="text/secondary" pl="12">
                  No {type} containers available.{' '}
                  <Link colorScheme="purple" onClick={() => replace('/containers', { tab: type })}>
                    Manage {type} containers
                  </Link>
                </Text>
              </Td>
            ) : (
              <>
                <Td>
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
                </Td>
                <Td />
                <Td />
              </>
            )}
          </Tr>
        </Tbody>
      </Table>
    </Card>
  );
};

export default ContainerCard;
