type Listener = () => void;

let isAIDrawerOpen = false;
const listeners = new Set<Listener>();

export function setAIDrawerOpen(value: boolean) {
  isAIDrawerOpen = value;
  listeners.forEach((listener) => listener());
}

export function getAIDrawerOpen(): boolean {
  return isAIDrawerOpen;
}

export function subscribeAIDrawerOpen(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
