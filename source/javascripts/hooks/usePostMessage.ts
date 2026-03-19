import { useCallback, useEffect, useState } from 'react';

type Envelope<T> = {
  channel: string;
  data: T;
};

export type UsePostMessageOptions = {
  channel: string;
  getTarget?: () => Window | null | undefined;
};

export type UsePostMessageReturn<D, P> = {
  readonly data: D | undefined;
  readonly post: (data: P) => void;
  readonly timeStamp: number;
};

export const usePostMessage = <D, P>(options: UsePostMessageOptions): UsePostMessageReturn<D, P> => {
  const { channel, getTarget } = options;

  const [data, setData] = useState<D | undefined>();
  const [timeStamp, setTimeStamp] = useState<number>(0);

  const post = useCallback(
    (payload: P) => {
      const target = getTarget ? getTarget() : window.parent;
      target?.postMessage({ channel, data: payload } satisfies Envelope<P>, '*');
    },
    [channel, getTarget],
  );

  useEffect(() => {
    const handler = (e: MessageEvent<Envelope<D>>) => {
      if (e.data?.channel !== channel) return;
      setData(e.data.data);
      setTimeStamp(Date.now());
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [channel]);

  return { data, post, timeStamp };
};
