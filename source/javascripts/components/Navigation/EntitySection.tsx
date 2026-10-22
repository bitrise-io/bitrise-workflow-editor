import {
  BitkitBadge,
  BitkitEmptyState,
  bitkitIcon,
  BitkitIconComponent,
  BitkitTooltip,
  BitkitTreeView,
  createTreeCollection,
  IconAbortCircleFilled,
  IconCheckCircleFilled,
  IconChevronDown,
  IconChevronRight,
  IconCircleDashed,
  IconCircleHalfFilled,
  IconCrossCircleFilled,
  IconSkipCircle,
  IconTrigger,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { chakra } from '@chakra-ui/react/styled-system';
import { Text } from '@chakra-ui/react/text';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { EntityRowStatus } from './useEntityStatuses';

export type EntityItem = { id: string; label: string; status?: EntityRowStatus };

// The tree colours a row's end (icons and text) in its secondary text color; the trigger marker is a quiet
// hint, so it stays tertiary. `bitkitIcon` is Bitkit's way to make a custom icon.
const IconTriggerTertiary = bitkitIcon(function IconTriggerTertiary(props) {
  return <IconTrigger color="icon/tertiary" {...props} />;
});

const RUN_LOOK = {
  succeeded: { icon: IconCheckCircleFilled, color: 'icon/positive', text: 'Last run passed' },
  failed: { icon: IconCrossCircleFilled, color: 'icon/negative', text: 'Last run failed' },
  aborted: { icon: IconAbortCircleFilled, color: 'icon/warning', text: 'Last run was aborted' },
  running: { icon: IconCircleHalfFilled, color: 'icon/interactive', text: 'Running now' },
  skipped: { icon: IconSkipCircle, color: 'icon/tertiary', text: 'Skipped in the last run' },
  never: { icon: IconCircleDashed, color: 'icon/tertiary', text: 'No runs yet' },
} as const;

// "5m", "3h", "2d": how long ago, short enough for the row's end.
const since = (iso: string) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / (60 * 24))}d`;
};

// The row: last run status first, then on its end a warning for a problem, a trigger icon when it starts
// on its own, and how long ago it last ran. Hovering it says all of that in words.
const EntityLeaf = ({ label, status }: EntityItem) => {
  const run = status?.run && RUN_LOOK[status.run.status];
  const ranAgo = status?.run?.at && status.run.status !== 'running' ? since(status.run.at) : undefined;
  const summary = [status?.problem, run && (ranAgo ? `${run.text} ${ranAgo} ago` : run.text), status?.triggers]
    .filter(Boolean)
    .join(' · ');
  const leaf = (
    <BitkitTreeView.Leaf
      label={label}
      icon={run?.icon}
      iconColor={run?.color}
      hasWarning={Boolean(status?.problem)}
      suffixIcon={status?.triggers ? IconTriggerTertiary : undefined}
      suffixText={ranAgo}
    />
  );
  return summary ? (
    <BitkitTooltip text={summary} placement="right">
      {leaf}
    </BitkitTooltip>
  ) : (
    leaf
  );
};

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
  // Empty sections start collapsed (their count says 0); the user's own open/close wins after that.
  const [isOpenedByUser, setIsOpenedByUser] = useState<boolean>();
  // A list that becomes empty (e.g. on a file switch) folds again, whatever was open before; unfolding it
  // by hand still shows its empty state.
  const isEmpty = items.length === 0;
  const [wasEmpty, setWasEmpty] = useState(isEmpty);
  if (wasEmpty !== isEmpty) {
    setWasEmpty(isEmpty);
    if (isEmpty) {
      setIsOpenedByUser(undefined);
    }
  }
  const isOpen = isSearching || (isOpenedByUser ?? !isEmpty);

  // Selecting an item unfolds its section and scrolls the row into view in the sidebar, so you can see
  // where you are. Folding it again afterwards is still up to you.
  const sectionRef = useRef<HTMLDivElement>(null);
  const isSelectedHere = Boolean(selectedId && items.some((item) => item.id === selectedId));
  // Unfold when the selection arrives here (adjusted while rendering, as React recommends over an effect).
  const [revealedId, setRevealedId] = useState<string>();
  if (isSelectedHere && selectedId !== revealedId) {
    setRevealedId(selectedId);
    setIsOpenedByUser(true);
  }
  useEffect(() => {
    if (isSelectedHere) {
      sectionRef.current?.querySelector('[data-selected]')?.scrollIntoView({ block: 'nearest' });
    }
  }, [isSelectedHere, selectedId]);

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
    <Box ref={sectionRef} display="flex" flexDirection="column">
      <Box
        display="flex"
        alignItems="center"
        gap="4"
        paddingBlock="4"
        paddingInlineEnd="4"
        borderBlockEnd="1px solid"
        borderColor="border/minimal"
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
          onClick={() => setIsOpenedByUser(!isOpen)}
        >
          {isOpen ? <IconChevronDown size="16" /> : <IconChevronRight size="16" />}
          <Text textStyle="heading/h6" textTransform="uppercase">
            {label}
          </Text>
          <BitkitBadge colorVariant="neutral" size="xs" variant="subtle">
            {items.length}
          </BitkitBadge>
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
              render={({ node }) => <EntityLeaf {...node} />}
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
