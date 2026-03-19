import { useEffect, useRef } from 'react';

import WindowUtils from '@/core/utils/WindowUtils';

function useParentMessageListener<T = unknown>(type: string, callback: (payload: T) => void) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    return WindowUtils.onMessageFromParent<T>((messageType, payload) => {
      if (messageType === type) {
        callbackRef.current(payload);
      }
    });
  }, [type]);
}

export default useParentMessageListener;
