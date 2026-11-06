import { useCallback, useState } from 'react';

/**
 * Keeps a dialog mounted from the moment it opens until its close animation has finished.
 *
 * For a component that renders its own `BitkitDialog` because the dialog's `title` or
 * `footerButtons` read its state: render it only while `isMounted`, and pass `onExitComplete` to
 * the dialog. Its state then starts fresh on every open, the way it did when it was the dialog's
 * child, instead of living as long as the page does.
 */
const useMountedWhileOpen = (isOpen: boolean) => {
  const [wasOpened, setWasOpened] = useState(isOpen);

  // Derived during render rather than in an effect, so the dialog mounts in the same render that
  // opens it.
  if (isOpen && !wasOpened) {
    setWasOpened(true);
  }

  const onExitComplete = useCallback(() => setWasOpened(false), []);

  return { isMounted: isOpen || wasOpened, onExitComplete };
};

export default useMountedWhileOpen;
