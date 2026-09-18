import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import { AssistId } from './assistRegistry';

export type AssistAnchor = {
  id: AssistId;
  element: HTMLElement;
};

// The parent page owns the on/off state (it persists it and syncs it across the iframe
// boundary), so unlike the monolith's store this one holds no persisted copy: it starts
// off and only ever changes via ASSIST_MODE_CHANGED.
const useAssistStore = create(
  combine(
    {
      isActive: false,
      anchor: null as AssistAnchor | null,
    },
    (set) => ({
      setActive(isActive: boolean) {
        set(isActive ? { isActive } : { isActive, anchor: null });
      },
      showCard(anchor: AssistAnchor) {
        set({ anchor });
      },
      hideCard() {
        set({ anchor: null });
      },
    }),
  ),
);

export default useAssistStore;
