import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * @title UseBroadcastChannelOptions
 */
export interface UseBroadcastChannelOptions {
  /**
   * @en channel name
   */
  name: string;
}

/**
 * @title UseBroadcastChannel
 */
export type UseBroadcastChannel = <D, P>(
  /**
   * @en options
   */
  options: UseBroadcastChannelOptions,
) => UseBroadcastChannelReturn<D, P>;

/**
 * @title UseBroadcastChannelReturn
 */
export interface UseBroadcastChannelReturn<D, P> {
  /**
   * @en data
   */
  readonly data: D | undefined;

  /**
   * @en post data
   */
  readonly post: (data: P) => void;

  /**
   * @en close
   */
  readonly close: () => void;

  /**
   * @en error
   */
  readonly error: Event | null;

  /**
   * @en is closed
   */
  readonly isClosed: boolean;

  /**
   * @en timestamp
   */
  readonly timeStamp: number;
}

export const useBroadcastChannel: UseBroadcastChannel = <D, P>(options: UseBroadcastChannelOptions) => {
  const { name } = options;

  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [data, setData] = useState<D | undefined>();
  const [error, setError] = useState<Event | null>(null);
  const [timeStamp, setTimeStamp] = useState<number>(0);

  const channelRef = useRef<BroadcastChannel | undefined>();

  const post = useCallback((data: P) => {
    if (channelRef.current) {
      channelRef.current.postMessage(data);
    }
  }, []);

  const close = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.close();
    }
    setIsClosed(true);
  }, []);

  useEffect(() => {
    const bc = new BroadcastChannel(name);
    channelRef.current = bc;

    const handleMessage = (e: MessageEvent) => {
      setData(e.data);
      // avoid data is same between two messages
      setTimeStamp(Date.now());
    };

    const handleError = (e: Event) => {
      setError(e);
    };

    bc.addEventListener('message', handleMessage, { passive: true });
    bc.addEventListener('messageerror', handleError, { passive: true });

    return () => {
      bc.removeEventListener('message', handleMessage);
      bc.removeEventListener('messageerror', handleError);
      bc.close();
      channelRef.current = undefined;
    };
  }, [name]);

  return {
    data,
    post,
    close,
    error,
    isClosed,
    timeStamp,
  } as const;
};
