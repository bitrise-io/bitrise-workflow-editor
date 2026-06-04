import {
  BitkitButton,
  BitkitTreeView,
  createTreeCollection,
  IconFileDoc,
  IconFolder,
  IconLock,
} from '@bitrise/bitkit-v2';
import { Popover } from '@chakra-ui/react/popover';
import { Portal } from '@chakra-ui/react/portal';
import { useMemo, useState } from 'react';

import { TreeNode } from '@/core/models/Tree';
import TreeService from '@/core/services/TreeService';
import { useTabs } from '@/hooks/useTabs';
import { useSelectedNodeId, useTree } from '@/hooks/useTree';

// The tree-view renders the root node's children, so wrap the real root in a
// hidden synthetic node to keep `bitrise.yml` visible as the top-level entry.
const SYNTHETIC_ROOT_ID = '__tree_root__';

function syntheticRoot(root: TreeNode): TreeNode {
  return {
    nodeId: SYNTHETIC_ROOT_ID,
    path: '',
    contents: '',
    source: null,
    commitSha: '',
    editable: true,
    includes: [root],
  };
}

const FileTreeViewer = () => {
  const tree = useTree();
  const selectedNodeId = useSelectedNodeId();
  const { openFile } = useTabs();
  const [isOpen, setIsOpen] = useState(false);

  const collection = useMemo(() => {
    if (!tree) {
      return undefined;
    }
    return createTreeCollection<TreeNode>({
      rootNode: syntheticRoot(tree),
      nodeToValue: (node) => node.nodeId,
      nodeToString: (node) => TreeService.fileName(node.path),
      nodeToChildren: (node) => node.includes,
    });
  }, [tree]);

  // Expand every container node by default so the whole module graph is visible.
  const expandedValue = useMemo(() => {
    if (!tree) {
      return [];
    }
    const branches = [SYNTHETIC_ROOT_ID];
    TreeService.walk(tree, (node) => {
      if (node.includes.length > 0) {
        branches.push(node.nodeId);
      }
    });
    return branches;
  }, [tree]);

  if (!tree || !collection) {
    return null;
  }

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(details) => setIsOpen(details.open)}
      positioning={{ placement: 'bottom-end' }}
    >
      <Popover.Trigger asChild>
        <BitkitButton variant="secondary" size="sm" icon={IconFolder}>
          Open module
        </BitkitButton>
      </Popover.Trigger>
      <Portal>
        {/* This raw @chakra-ui/react Popover doesn't pick up bitkit's Popover
            recipe z-index, so the portaled positioner defaults to `auto` and
            loses to positioned canvas chrome (e.g. the Pipelines toolbar at
            zIndex 10, whose relative parent forms no stacking context). Pin it
            to the popover layer so it sits above the editor surfaces. */}
        <Popover.Positioner zIndex="popover">
          <Popover.Content
            width="360px"
            maxWidth="360px"
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
                selectedValue={selectedNodeId ? [selectedNodeId] : []}
                defaultExpandedValue={expandedValue}
                onSelectionChange={(details) => {
                  const nodeId = details.selectedValue[0];
                  if (nodeId && nodeId !== SYNTHETIC_ROOT_ID) {
                    openFile(nodeId);
                    setIsOpen(false);
                  }
                }}
                render={({ node, nodeState }) => {
                  const label = TreeService.fileName(node.path);
                  const refLabel = TreeService.sourceLabel(node.source);
                  const lock = node.editable ? undefined : IconLock;

                  return nodeState.isBranch ? (
                    <BitkitTreeView.Branch label={label} suffixIcon={lock} suffixText={refLabel ?? undefined} />
                  ) : (
                    <BitkitTreeView.Leaf
                      label={label}
                      icon={IconFileDoc}
                      suffixIcon={lock}
                      suffixText={refLabel ?? undefined}
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

export default FileTreeViewer;
