import { dequal } from 'dequal';
import { useRef } from 'react';

/**
 * This hook is an extended version of the Zustand useShallow hook. In Zustand v5,
 * the useShallow hook does not deeply compare selector results.
 *
 * https://github.com/pmndrs/zustand/discussions/2801#discussioncomment-10981346
 *
 * @param selector A function that takes the current state and returns the value to memoize.
 * @returns A memoized value that is shallowly compared to the previous value.
 */
export function useShallow<S, U>(selector: (state: S) => U): (state: S) => U {
  const prev = useRef<U>(undefined);

  return (state) => {
    const next = selector(state);

    if (dequal(prev.current, next)) {
      return prev.current as U;
    }

    prev.current = next;

    return next;
  };
}
