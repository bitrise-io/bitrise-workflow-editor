// When one drawer replaces another, the page stores swap them in place instead of sliding the old one
// out and the new one in, which flashes. They mark the swap here; the drawer that mounts right after
// reads it and appears without its entrance animation.
const SWITCH_WINDOW_MS = 500;

let lastSwitchAt = 0;

export const markFloatingDrawerSwitch = () => {
  lastSwitchAt = Date.now();
};

export const isFloatingDrawerSwitch = () => Date.now() - lastSwitchAt < SWITCH_WINDOW_MS;
