import { BitkitTour, BitkitTourStep, useBitkitTour } from '@bitrise/bitkit-v2';
import { useEffect, useMemo } from 'react';
import { create } from 'zustand';

import { useTree } from '@/hooks/useTree';
import { useAutoExpandedNode } from '@/pages/PipelinesPage/components/PipelineCanvas/GraphPipelineCanvas/utils/autoExpandedNode';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import { useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import { useWorkflowsPageStore } from '@/pages/WorkflowsPage/WorkflowsPage.store';

// The first-run tour: five steps through the editor, shown once on the first visit and again from the rail's
// "Take the tour". Modular configs get a step on modules; configs stored on bitrise.io get the Visual / YAML
// switch instead. Each step points at an element marked `data-tour="…"`.

// Prototype: "seen" lives in this browser. The real product would keep it per user, on the backend.
export const FIRST_RUN_TOUR_SEEN_KEY = 'wfe-first-run-tour-seen';

const hasSeenTour = () => {
  try {
    return window.localStorage.getItem(FIRST_RUN_TOUR_SEEN_KEY) === 'true';
  } catch {
    // Without storage it couldn't remember a dismissal either, so it doesn't open on its own.
    return true;
  }
};

const markTourSeen = () => {
  try {
    window.localStorage.setItem(FIRST_RUN_TOUR_SEEN_KEY, 'true');
  } catch {
    // Storage can be blocked; the tour then just won't remember.
  }
};

// `isPending`: this is a first visit and the tour will open by itself once the page has drawn. Pages hold back
// their drawers from the start, so one doesn't flash open and closed before the tour.
export const useFirstRunTour = create<{ isOpen: boolean; isPending: boolean }>(() => ({
  isOpen: false,
  isPending: !hasSeenTour(),
}));

// True while the tour runs or is about to: the time pages keep their drawers closed.
export const useIsFirstRunTourActive = () => useFirstRunTour((s) => s.isOpen || s.isPending);
// The tour shows the canvas itself: settings drawers close when it starts, and the Workflows and Step bundles
// pages hold back their automatic drawer until it ends (see useFirstRunTour there).
export const startFirstRunTour = () => {
  usePipelinesPageStore.getState().closeDialog();
  useWorkflowsPageStore.getState().closeDialog();
  useStepBundlesPageStore.getState().closeDialog();
  useFirstRunTour.setState({ isOpen: true, isPending: false });
};

const target = (name: string) => () => document.querySelector<HTMLElement>(`[data-tour="${name}"]`);

const openWorkflowNode = () => document.querySelector<HTMLElement>('[data-tour="workflow-node"][data-open]');

// The Workflows step is about one Workflow: if none is open on the canvas, the first one opens, as a click
// on it would.
const openFirstWorkflow = () => {
  if (openWorkflowNode()) {
    return;
  }
  const nodeId = document
    .querySelector('[data-tour="workflow-node"]')
    ?.closest('.react-flow__node')
    ?.getAttribute('data-id');
  if (nodeId) {
    useAutoExpandedNode.setState({ nodeId });
  }
};

const STEPS = {
  ciBlocks: {
    id: 'ci-blocks',
    target: target('ci-blocks'),
    placement: 'right-start',
    title: 'Your CI blocks',
    description:
      'Pipelines, Workflows and Step bundles from your configuration. Pick one to open it on the canvas, or add a new one with +.',
  },
  modules: {
    id: 'modules',
    target: target('file-tabs'),
    placement: 'bottom-start',
    title: 'Modules',
    description:
      'Your configuration is split into files. Each open module gets a tab, and Merged config shows them combined. Find every module under Modules in the rail.',
  },
  canvas: {
    id: 'canvas',
    // Only the Workflow, never the canvas or a drawer: the open node on a Pipeline (see openFirstWorkflow), else
    // the Workflows page's card, else the first node. The canvas is the fallback only on pages with neither.
    target: () => openWorkflowNode() ?? target('workflow-card')() ?? target('workflow-node')() ?? target('canvas')(),
    placement: 'right-start',
    title: 'Pipelines, Workflows and Steps',
    description:
      'A Pipeline runs its Workflows, and each Workflow runs its Steps. Click a Workflow to edit it. To add a Step, hover between two Steps and click +.',
  },
  // The bitrise.io-stored version lands on a Workflow (the Workflows page), so its step is about that Workflow.
  workflow: {
    id: 'canvas',
    target: () => openWorkflowNode() ?? target('workflow-card')() ?? target('workflow-node')() ?? target('canvas')(),
    placement: 'right-start',
    title: 'Your Workflow',
    description:
      'A Workflow runs its Steps from top to bottom. Click a Step to set it up, or hover between two Steps and click + to add one. Run and Settings sit in its header.',
  },
  tools: {
    id: 'tools',
    target: target('tools'),
    placement: 'right-start',
    title: 'Tools',
    description:
      'Env Vars, Secrets, Triggers and more for the whole project. Each one opens in a panel over the canvas, so you never lose your place.',
  },
  editorView: {
    id: 'editor-view',
    target: target('editor-view'),
    placement: 'bottom',
    title: 'Visual or YAML',
    description: 'Prefer code? Switch to YAML any time. Both edit the same bitrise.yml.',
  },
  saveModular: {
    id: 'save',
    target: target('save'),
    placement: 'bottom-end',
    title: 'Save your changes',
    description: 'Changes stay here until you save. Saving pushes every changed module to your repository.',
  },
  saveStored: {
    id: 'save',
    target: target('save'),
    placement: 'bottom-end',
    title: 'Save your changes',
    description: 'Changes stay here until you save them. Then your next build uses them.',
  },
} satisfies Record<string, Omit<BitkitTourStep, 'actions'>>;

// The first step offers Skip; the others go back and forth, and the last one finishes.
const withActions = (steps: Omit<BitkitTourStep, 'actions'>[]): BitkitTourStep[] =>
  steps.map((step, index) => {
    const isFirst = index === 0;
    const isLast = index === steps.length - 1;
    return {
      ...step,
      actions: [
        ...(isFirst ? [] : [{ label: 'Back', action: 'prev' as const }]),
        isLast ? { label: 'Done', action: 'dismiss' as const } : { label: 'Next', action: 'next' as const },
      ],
      ...(isFirst ? { secondaryAction: { action: 'skip' as const, label: 'Skip tour' } } : {}),
    };
  });

// The tour waits for the page it explains: the CI blocks list and a Workflow on screen (the Workflows page's
// card, or a node on a Pipeline), then a short pause so the layout settles. Pages and the config load in steps,
// so a fixed delay could start it over a half-drawn canvas, with nothing to point at. A page that never shows a
// Workflow (e.g. an empty project) gets the tour anyway, after MAX_WAIT_MS. Returns a cleanup.
const READY_SELECTORS = ['[data-tour="ci-blocks"]', '[data-tour="workflow-card"], [data-tour="workflow-node"]'];
const SETTLE_MS = 400;
const MAX_WAIT_MS = 10000;

const whenEditorReady = (onReady: () => void) => {
  let settleTimer: number | undefined;
  let fallbackTimer: number | undefined;
  const isReady = () => READY_SELECTORS.every((selector) => document.querySelector(selector));
  const start = () => {
    window.clearTimeout(fallbackTimer);
    settleTimer = window.setTimeout(onReady, SETTLE_MS);
  };
  const observer = new MutationObserver((_, self) => {
    if (isReady()) {
      self.disconnect();
      start();
    }
  });
  if (isReady()) {
    start();
  } else {
    observer.observe(document.body, { childList: true, subtree: true });
    fallbackTimer = window.setTimeout(() => {
      observer.disconnect();
      start();
    }, MAX_WAIT_MS);
  }
  return () => {
    observer.disconnect();
    window.clearTimeout(fallbackTimer);
    window.clearTimeout(settleTimer);
  };
};

// Design-system tweak: on a card beside its target (left or right), the pointer sits 16px higher than Bitkit puts
// it. `translate` leaves the tour's own positioning (`top`, `transform`) alone.
const SIDE_ARROW_NUDGE = `
[data-scope="tour"][data-part="content"]:is([data-placement^="right"], [data-placement^="left"]) [data-part="arrow"] {
  translate: 0 -16px;
}
`;

// Rendered once the config has loaded, so the setup (modular or not) and the step targets are known.
const FirstRunTour = () => {
  const tree = useTree();
  const isModular = Boolean(tree && tree.includes.length > 0);
  const isOpen = useFirstRunTour((s) => s.isOpen);

  const steps = useMemo(
    () =>
      withActions(
        isModular
          ? [STEPS.ciBlocks, STEPS.modules, STEPS.canvas, STEPS.tools, STEPS.saveModular]
          : [STEPS.ciBlocks, STEPS.workflow, STEPS.tools, STEPS.editorView, STEPS.saveStored],
      ),
    [isModular],
  );

  const tour = useBitkitTour({
    steps,
    open: isOpen,
    onStepChange: ({ stepId }) => {
      if (stepId === 'canvas') {
        openFirstWorkflow();
      }
    },
    onClose: () => {
      markTourSeen();
      useFirstRunTour.setState({ isOpen: false });
    },
  });

  // On the first visit it opens by itself, once the editor has drawn what the tour points at.
  useEffect(() => {
    if (hasSeenTour()) {
      return undefined;
    }
    return whenEditorReady(startFirstRunTour);
  }, []);

  return (
    <>
      <style>{SIDE_ARROW_NUDGE}</style>
      <BitkitTour tour={tour} />
    </>
  );
};

export default FirstRunTour;
