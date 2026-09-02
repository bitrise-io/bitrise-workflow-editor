/**
 * @jest-environment jsdom
 */
/* eslint-disable testing-library/no-node-access --
 * The subject under test is a DOM attribute on a container, not user-facing behaviour, so there is
 * no semantic query that expresses it: `data-clarity-unmask` is invisible to the accessibility tree
 * and several of the tagged elements (Thead, TabList, DialogFooter, Box, Card) have no role or name
 * to query by. Attribute selectors and `closest()` are the assertion, not a shortcut around one. */
import fs from 'node:fs';
import path from 'node:path';

import {
  Box,
  Breadcrumb,
  BreadcrumbLink,
  Button,
  Card,
  Dialog,
  DialogFooter,
  EmptyState,
  List,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Notification,
  Provider,
  Ribbon,
  Sidebar,
  Tab,
  Table,
  TabList,
  Tabs,
  Text,
  Th,
  Thead,
  Tr,
} from '@bitrise/bitkit';
import { BitkitActionMenu, BitkitAlert, BitkitProvider, BitkitSegmentedControl } from '@bitrise/bitkit-v2';
import { render, screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';

// The bitkit barrels re-export a markdown component, and react-markdown's ESM dependency tree is
// not transformed for tests. Nothing here renders markdown, so stub it at the leaf.
jest.mock('react-markdown', () => ({ __esModule: true, default: () => null }));

const UNMASK_ATTR = 'data-clarity-unmask';
const UNMASK = `${UNMASK_ATTR}="true"`;
const UNMASK_SELECTOR = `[${UNMASK}]`;
const SOURCE_ROOT = path.join(__dirname, '..');
const SELF = path.relative(SOURCE_ROOT, __filename);

// jsdom implements none of these; Chakra v3's recipe layer and the responsive/motion hooks need them.
const deepClone = (value: unknown): unknown => {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  return Array.isArray(value)
    ? value.map(deepClone)
    : Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepClone(v)]));
};
globalThis.structuredClone ??= deepClone as typeof structuredClone;
window.ResizeObserver ??= class {
  observe() {}

  unobserve() {}

  disconnect() {}
} as unknown as typeof ResizeObserver;
window.matchMedia ??= ((query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList) as typeof window.matchMedia;

function tsxFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return tsxFiles(full);
    }
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

function unmaskCountsBySourceFile(): Record<string, number> {
  const counts: Record<string, number> = {};
  tsxFiles(SOURCE_ROOT).forEach((file) => {
    const relative = path.relative(SOURCE_ROOT, file);
    if (relative === SELF) {
      return;
    }
    const occurrences = fs.readFileSync(file, 'utf-8').split(UNMASK).length - 1;
    if (occurrences > 0) {
      counts[relative] = occurrences;
    }
  });
  return counts;
}

// Both design-system providers: bitkit v1 components read the Chakra v2 theme through `Provider`,
// bitkit-v2 components read the Chakra v3 system through `BitkitProvider` — same as the app root.
const Wrapper = ({ children }: PropsWithChildren) => (
  <Provider resetCSS={false}>
    <BitkitProvider>{children}</BitkitProvider>
  </Provider>
);
const unmasked = () => document.querySelectorAll(UNMASK_SELECTOR);

/**
 * Clarity masks recorded text by default; `data-clarity-unmask="true"` opts an element **and its
 * whole subtree** out. That makes the convention load-bearing in two opposite directions:
 *
 * - Fail-safe: if a component stops forwarding the attribute, chrome silently goes back to being
 *   masked — recordings get less readable, but nothing leaks. `forwards the attribute to the DOM`
 *   guards this direction.
 * - Fail-open: if a dynamic child is added under an already-unmasked container, customer data starts
 *   being recorded with no visible signal at all. `unmask sites` guards this direction by pinning
 *   every opted-out location, so a new or widened one cannot land without being reviewed.
 *
 * See the convention note next to the Clarity loader in `clrty.js`.
 */
describe('Clarity unmasking', () => {
  describe('forwards the attribute to the DOM', () => {
    // Every component the app tags. A composite that swallows an unknown `data-*` prop instead of
    // spreading it onto its DOM root would silently re-mask that chrome, so each one is pinned here.
    it('through the bitkit components the app tags', () => {
      render(
        <Wrapper>
          <Box data-clarity-unmask="true">box</Box>
          <Text data-clarity-unmask="true">text</Text>
          <Button data-clarity-unmask="true">button</Button>
          <Card data-clarity-unmask="true">card</Card>
          <EmptyState title="empty state" data-clarity-unmask="true" />
          <Notification status="info" data-clarity-unmask="true">
            notification
          </Notification>
          <Ribbon colorScheme="blue" data-clarity-unmask="true">
            ribbon
          </Ribbon>
          <List data-clarity-unmask="true">
            <ListItem>list item</ListItem>
          </List>
          <Breadcrumb>
            <BreadcrumbLink data-clarity-unmask="true">breadcrumb link</BreadcrumbLink>
          </Breadcrumb>
          <Sidebar data-clarity-unmask="true">sidebar</Sidebar>
          <Table>
            <Thead data-clarity-unmask="true">
              <Tr>
                <Th>column header</Th>
              </Tr>
            </Thead>
          </Table>
          <Tabs>
            <TabList data-clarity-unmask="true">
              <Tab>tab label</Tab>
            </TabList>
          </Tabs>
          <Menu isOpen>
            <MenuButton as={Button} data-clarity-unmask="true">
              menu button
            </MenuButton>
            <MenuList data-clarity-unmask="true">
              <MenuItem>menu item</MenuItem>
            </MenuList>
          </Menu>
          {/* DialogFooter reads the modal style context, so it is mounted the way the app mounts it. */}
          <Dialog isOpen title="dialog title" onClose={() => {}}>
            <DialogFooter data-clarity-unmask="true">
              <Button>dialog action</Button>
            </DialogFooter>
          </Dialog>
        </Wrapper>,
      );

      expect(unmasked()).toHaveLength(15);
      // The wrappers above must actually contain their label, not just carry the attribute somewhere.
      ['column header', 'tab label', 'menu item', 'list item', 'dialog action', 'sidebar'].forEach((label) => {
        expect(screen.getByText(label).closest(UNMASK_SELECTOR)).not.toBeNull();
      });
    });

    it('through the bitkit-v2 components the app tags', () => {
      render(
        <Wrapper>
          <BitkitAlert variant="info" messageText="alert message" data-clarity-unmask="true" />
          <BitkitSegmentedControl value="a" data-clarity-unmask="true">
            <BitkitSegmentedControl.Item value="a">segment label</BitkitSegmentedControl.Item>
          </BitkitSegmentedControl>
          {/* Portalled: the attribute has to sit on the item itself, since a tagged ancestor in the
              main tree would not enclose the portalled node. */}
          <BitkitActionMenu.Root open trigger={<button type="button">trigger</button>}>
            <BitkitActionMenu.Item value="x" data-clarity-unmask="true">
              action menu item
            </BitkitActionMenu.Item>
          </BitkitActionMenu.Root>
        </Wrapper>,
      );

      expect(unmasked()).toHaveLength(3);
      ['alert message', 'segment label', 'action menu item'].forEach((label) => {
        expect(screen.getByText(label).closest(UNMASK_SELECTOR)).not.toBeNull();
      });
    });
  });

  describe('unmask sites', () => {
    // Pinning every opted-out location is what makes a new or widened unmask visible in review —
    // an unmasked ancestor silently unmasks anything added under it later. When this fails, confirm
    // the added subtree renders no configuration or user input, then update the map.
    const EXPECTED: Record<string, number> = {
      'components/Header.tsx': 4,
      'components/LoadingState.tsx': 1,
      'components/Navigation.tsx': 1,
      'components/ReadOnlyViewNotification.tsx': 1,
      'components/tabs/TabHeader.tsx': 1,
      'components/unified-editor/ChainWorkflowDrawer/ChainWorkflowDrawer.tsx': 2,
      'components/unified-editor/ConfigSettingsMenu/ConfigSettingsMenu.tsx': 3,
      'components/unified-editor/ContainersTab/ContainerCard.tsx': 1,
      'components/unified-editor/DeleteStepBundleDialog/DeleteStepBundleDialog.tsx': 2,
      'components/unified-editor/DeleteWorkflowDialog/DeleteWorkflowDialog.tsx': 3,
      'components/unified-editor/EntitySelector/EntitySelector.tsx': 1,
      'components/unified-editor/StepBundleConfig/StepBundleConfigHeader.tsx': 1,
      'components/unified-editor/StepConfigDrawer/StepConfigDrawer.tsx': 1,
      'components/unified-editor/StepSelectorDrawer/StepSelectorDrawer.tsx': 2,
      'components/unified-editor/StepSelectorDrawer/components/AlgoliaStepListEmptyState.tsx': 1,
      'components/unified-editor/StepSelectorDrawer/components/AlgoliaStepListErrorState.tsx': 1,
      'components/unified-editor/Triggers/ConditionCard.tsx': 1,
      'components/unified-editor/Triggers/TargetBasedTriggers/TargetBasedTriggerNotification.tsx': 1,
      'components/unified-editor/WorkflowConfig/components/WorkflowConfigHeader.tsx': 1,
      'components/unified-editor/WorkflowEmptyState.tsx': 1,
      'pages/ContainersPage/ContainersPage.tsx': 3,
      'pages/ContainersPage/components/ContainerUsageTable.tsx': 1,
      'pages/ContainersPage/components/ContainersTable.tsx': 1,
      'pages/EnvVarsPage/EnvVarsPage.tsx': 2,
      'pages/EnvVarsPage/components/PrivateInfoNotification.tsx': 1,
      'pages/EnvVarsPage/tabs/ProjectTab.tsx': 1,
      'pages/EnvVarsPage/tabs/WorkflowsTab.tsx': 1,
      'pages/LicensesPage/LicensesPage.tsx': 4,
      'pages/PipelinesPage/components/EmptyStates/CreateFirstGraphPipelineEmptyState.tsx': 1,
      'pages/PipelinesPage/components/EmptyStates/GraphPipelineCanvasEmptyState.tsx': 1,
      'pages/PipelinesPage/components/EmptyStates/ReactivatePlanEmptyState.tsx': 1,
      'pages/PipelinesPage/components/EmptyStates/UpgradePlanEmptyState.tsx': 1,
      'pages/PipelinesPage/components/PipelineCanvas/PipelineConversionNotification.tsx': 1,
      'pages/PipelinesPage/components/PipelineCanvas/PipelineConversionSignposting.tsx': 1,
      'pages/PipelinesPage/components/PipelineConfigDrawer/PipelineConfigDrawer.tsx': 1,
      'pages/PipelinesPage/components/Toolbar/Toolbar.tsx': 3,
      'pages/PipelinesPage/components/WorkflowSelectorDrawer/WorkflowSelectorDrawer.tsx': 1,
      'pages/PipelinesPage/components/WorkflowSelectorDrawer/components/NoWorkflowsEmptyState.tsx': 1,
      'pages/PipelinesPage/components/WorkflowSelectorDrawer/components/SearchResultEmptyState.tsx': 1,
      'pages/SecretsPage/SecretsPage.tsx': 11,
      'pages/StacksAndMachinesPage/StacksAndMachinesPage.tsx': 2,
      'pages/StacksAndMachinesPage/tabs/WorkflowsTab.tsx': 1,
      'pages/StepBundlesPage/StepBundlesPage.tsx': 1,
      'pages/TriggersPage/SetupWebhookNotification.tsx': 1,
      'pages/TriggersPage/TriggersPage.tsx': 2,
      'pages/TriggersPage/components/LegacyTriggers/ConvertLegacyTriggers.tsx': 1,
      'pages/TriggersPage/components/LegacyTriggers/LegacyEmptyState.tsx': 1,
      'pages/TriggersPage/components/LegacyTriggers/LegacyTriggers.tsx': 3,
      'pages/TriggersPage/components/LegacyTriggers/OrderOfTriggersNotification.tsx': 1,
      'pages/TriggersPage/components/TargetBasedTriggers/AddTriggerButton.tsx': 2,
      'pages/TriggersPage/components/TargetBasedTriggers/TargetBasedTriggers.tsx': 2,
      'pages/YmlPage/components/YourCiConfigIsSplitNotification.tsx': 1,
    };

    it('are exactly the reviewed set', () => {
      expect(unmaskCountsBySourceFile()).toEqual(EXPECTED);
    });

    it('never unmasks customer data', () => {
      // Modules whose whole job is rendering configuration or user input: workflow and step names,
      // step inputs, env var names and values, secrets, trigger condition values, the YAML itself.
      // These must never appear above, whatever the surrounding refactor looks like.
      const OFF_LIMITS = [
        'components/DiffEditor/',
        'components/EditableInput/',
        'components/SortableEnvVars/',
        'components/unified-editor/StepBundleConfig/StepBundleConfigInputs.tsx',
        'components/unified-editor/StepConfigDrawer/components/',
        'components/unified-editor/Triggers/TriggerConditions.tsx',
        'components/unified-editor/WithGroupDrawer/',
        'components/unified-editor/WorkflowCard/',
        'pages/EnvVarsPage/components/EnvVarsTable.tsx',
        'pages/SecretsPage/SecretCard.tsx',
        'pages/YmlPage/components/ModularYmlEditor.tsx',
        'pages/YmlPage/components/YmlEditor.tsx',
      ];

      const violations = Object.keys(unmaskCountsBySourceFile()).filter((file) =>
        OFF_LIMITS.some((prefix) => file.startsWith(prefix)),
      );

      expect(violations).toEqual([]);
    });

    it('is always spelled so that Clarity acts on it', () => {
      // A misspelled attribute or a `"false"` value is inert, and Clarity gives no feedback either
      // way — so any other `clarity` attribute in the app has to be deliberate and reviewed.
      const stray = tsxFiles(SOURCE_ROOT)
        .filter((file) => path.relative(SOURCE_ROOT, file) !== SELF)
        .flatMap((file) => {
          const contents = fs.readFileSync(file, 'utf-8');
          const sanctioned = contents.split(UNMASK).join('');
          return sanctioned.includes(UNMASK_ATTR) ? [path.relative(SOURCE_ROOT, file)] : [];
        });

      expect(stray).toEqual([]);
    });
  });
});
