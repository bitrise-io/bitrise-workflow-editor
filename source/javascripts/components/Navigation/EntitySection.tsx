import {
  BitkitEmptyState,
  BitkitIconComponent,
  BitkitTreeView,
  createTreeCollection,
  IconChevronDown,
  IconChevronRight,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { chakra } from '@chakra-ui/react/styled-system';
import { Text } from '@chakra-ui/react/text';
import { ReactNode, useMemo, useState } from 'react';

export type EntityItem = { id: string; label: string };

type EntityNode = EntityItem & { children: EntityNode[] };

type Props = {
  label: string;
  items: EntityItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  addControl: ReactNode;
  // Shown when the list is empty: what the entity is, and a button that creates one.
  empty: { icon: BitkitIconComponent; heading: string; body: string; action: ReactNode };
  // While searching, every section with a match is shown open, whatever the user collapsed.
  isSearching: boolean;
};

const ROOT_ID = '__entities__';

// The design system has no section header with a permanent action: an accordion trigger takes text
// or a badge only, and a tree branch shows its actions on hover. This header is put together from
// primitives until Bitkit has one.
const EntitySection = ({ label, items, selectedId, onSelect, addControl, empty, isSearching }: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isOpen = isSearching || !isCollapsed;

  const collection = useMemo(
    () =>
      createTreeCollection<EntityNode>({
        rootNode: { id: ROOT_ID, label: '', children: items.map((item) => ({ ...item, children: [] })) },
        nodeToValue: (node) => node.id,
        nodeToString: (node) => node.label,
        nodeToChildren: (node) => node.children,
      }),
    [items],
  );

  return (
    <Box display="flex" flexDirection="column">
      <Box
        display="flex"
        alignItems="center"
        gap="4"
        paddingBlock="4"
        paddingInlineEnd="4"
        borderBlockEnd="1px solid"
        borderColor="border/minimal"
        background="background/secondary"
      >
        <chakra.button
          type="button"
          display="flex"
          flex="1"
          alignItems="center"
          gap="4"
          paddingBlock="4"
          paddingInlineStart="8"
          cursor={isSearching ? 'default' : 'pointer'}
          color="text/secondary"
          aria-expanded={isOpen}
          disabled={isSearching}
          onClick={() => setIsCollapsed((collapsed) => !collapsed)}
        >
          {isOpen ? <IconChevronDown size="16" /> : <IconChevronRight size="16" />}
          <Text textStyle="heading/h6" textTransform="uppercase">
            {label}
          </Text>
        </chakra.button>
        {addControl}
      </Box>
      {isOpen &&
        (items.length > 0 ? (
          // Entity names are the customer's config: keep them out of session recordings.
          <Box data-clarity-mask="true">
            <BitkitTreeView
              variant="files"
              collection={collection}
              selectionMode="single"
              selectedValue={selectedId ? [selectedId] : []}
              onSelectionChange={(details) => {
                const id = details.selectedValue[0];
                if (id) onSelect(id);
              }}
              render={({ node }) => <BitkitTreeView.Leaf label={node.label} />}
            />
          </Box>
        ) : (
          // Compact, as the empty Workflow card's empty state is: the sidebar is narrow.
          <BitkitEmptyState
            padding="16"
            marginBlockStart="8"
            icon={empty.icon}
            headingText={empty.heading}
            bodyText={empty.body}
          >
            {empty.action}
          </BitkitEmptyState>
        ))}
    </Box>
  );
};

export default EntitySection;
