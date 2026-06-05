import { Link } from '@bitrise/bitkit';
import { BitkitTreeView, createTreeCollection, IconFileDoc } from '@bitrise/bitkit-v2';
import { Popover } from '@chakra-ui/react/popover';
import { Portal } from '@chakra-ui/react/portal';
import { cloneElement, ReactElement, ReactNode, useMemo, useState } from 'react';

import { EntityKind, TreeNode } from '@/core/models/Tree';
import EntityIndexService from '@/core/services/EntityIndexService';
import TreeService from '@/core/services/TreeService';
import { useEntityIndex } from '@/hooks/useEntityIndex';
import useJumpToDefinition from '@/hooks/useJumpToDefinition';
import { useTree } from '@/hooks/useTree';

type Props = {
  kind: EntityKind;
  id: string;
  /** Default trigger content, rendered inside a purple text Link. */
  children?: ReactNode;
  /**
   * Custom trigger element (e.g. an icon button on a cross-file card). For a
   * single definition it's cloned with an `onClick` that jumps; for multiple it
   * becomes the chooser-popover trigger. Takes precedence over `children`.
   */
  trigger?: ReactElement<{ onClick?: () => void }>;
};

// The chooser renders the contributing files as a flat tree (same component as
// the "Open module" file selector), so wrap them in a hidden synthetic root.
const SYNTHETIC_ROOT_ID = '__jump_root__';

function syntheticRoot(nodes: TreeNode[]): TreeNode {
  return {
    nodeId: SYNTHETIC_ROOT_ID,
    path: '',
    contents: '',
    source: null,
    commitSha: '',
    editable: true,
    includes: nodes,
  };
}

/**
 * The "Edit / Go to definition" link in a cross-file drawer header. An entity can
 * be defined in more than one file (a same-repo override, or the same path from
 * different branches/tags) — the merger deep-merges the layers. When there's a
 * single definition this is a plain link that jumps to it. When there's more than
 * one it opens a chooser (a file tree in include/merge order, top-most layer
 * first) so the user picks which layer to open.
 */
const JumpToDefinitionLink = ({ kind, id, children, trigger }: Props) => {
  const tree = useTree();
  const entityIndex = useEntityIndex();
  const jumpToDefinition = useJumpToDefinition();
  const [isOpen, setIsOpen] = useState(false);

  // The contributing files, in merge order (index 0 = top-most). Resolve each
  // definition's node_id to its tree node for the file name + source label.
  const nodes = useMemo(() => {
    return EntityIndexService.definitionsOf(entityIndex, kind, id)
      .map((def) => TreeService.findNode(tree, def.nodeId))
      .filter((node): node is TreeNode => Boolean(node));
  }, [entityIndex, kind, id, tree]);

  const collection = useMemo(() => {
    return createTreeCollection<TreeNode>({
      rootNode: syntheticRoot(nodes),
      nodeToValue: (node) => node.nodeId,
      nodeToString: (node) => TreeService.fileName(node.path),
      nodeToChildren: (node) => node.includes,
    });
  }, [nodes]);

  // Single (or zero) definition: trigger jumps straight to the top-most layer.
  if (nodes.length <= 1) {
    if (trigger) {
      return cloneElement(trigger, { onClick: () => jumpToDefinition(kind, id) });
    }
    return (
      <Link as="button" colorScheme="purple" onClick={() => jumpToDefinition(kind, id)}>
        {children}
      </Link>
    );
  }

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(details) => setIsOpen(details.open)}
      positioning={{ placement: 'bottom-start' }}
    >
      <Popover.Trigger asChild>
        {trigger ?? (
          <Link as="button" colorScheme="purple">
            {children}
          </Link>
        )}
      </Popover.Trigger>
      <Portal>
        {/* z-index on Content, not Positioner — see FileTreeViewer for why. */}
        <Popover.Positioner>
          <Popover.Content
            zIndex={1500}
            width="320px"
            maxWidth="320px"
            backgroundColor="background/primary"
            border="1px solid"
            borderColor="border/regular"
            borderRadius="8"
            boxShadow="large"
          >
            <Popover.Body p="8" maxHeight="50vh" overflowY="auto">
              <BitkitTreeView
                collection={collection}
                selectionMode="single"
                defaultExpandedValue={[SYNTHETIC_ROOT_ID]}
                onSelectionChange={(details) => {
                  const nodeId = details.selectedValue[0];
                  if (nodeId && nodeId !== SYNTHETIC_ROOT_ID) {
                    jumpToDefinition(kind, id, nodeId);
                    setIsOpen(false);
                  }
                }}
                render={({ node, nodeState }) => {
                  if (nodeState.isBranch) {
                    return <BitkitTreeView.Branch label={TreeService.fileName(node.path)} />;
                  }
                  // Annotate each layer with its source (branch/tag), and mark the
                  // top-most (highest-precedence) one so precedence is visible.
                  const isTopMost = node.nodeId === nodes[0]?.nodeId;
                  const sourceLabel = TreeService.sourceLabel(node.source);
                  const suffix = [sourceLabel, isTopMost ? 'top layer' : null].filter(Boolean).join(' • ');

                  return (
                    <BitkitTreeView.Leaf
                      label={TreeService.fileName(node.path)}
                      icon={IconFileDoc}
                      suffixText={suffix || undefined}
                    />
                  );
                }}
              />
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default JumpToDefinitionLink;
