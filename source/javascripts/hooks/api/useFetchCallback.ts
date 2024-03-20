import { useCallback, useRef, useState } from "react";

import { useAsyncError } from "../utils/useAsyncError";

export interface FetchResponse<T, E> {
  result: T | undefined;
  statusCode?: number;
  loading: boolean;
  failed: E | undefined;
  call: (options?: RequestInit) => void;
}

type ResponseParser = (data: string) => any;

const defaultParser: ResponseParser = (data: string) => JSON.parse(data);

function useFetchCallback<T, E>(
  url: string,
  init?: RequestInit,
  parser: ResponseParser = defaultParser,
): FetchResponse<T, E> {
  const [result, setResult] = useState<T>();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState<E>();
  const [statusCode, setStatusCode] = useState<number>();
  const abortController = useRef<AbortController>();
  const throwError = useAsyncError();

  const call = useCallback(
    (options?: RequestInit) => {
      setStatusCode(undefined);
      setFailed(undefined);

      abortController.current?.abort();
      abortController.current = new AbortController();

      (async () => {
        setLoading(true);
        try {
          if (url === "") {
            throwError(new Error("Url is required"));
            return;
          }

          const fetchResult = await fetch(url, {
            signal: abortController.current?.signal,
            ...init,
            ...options,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              ...init?.headers,
              ...options?.headers,
            },
          });

          setStatusCode(fetchResult.status);

          if (fetchResult.status >= 500) {
            throwError(
              new Error(`Failed to fetch, ${fetchResult.statusText} ${url}`),
            );
            return;
          }
          const body = await fetchResult.text();
          if (body.length > 0) {
            const resBody = parser(body);

            if (resBody.error_msg || !fetchResult.ok) {
              setFailed(resBody as E);
            } else {
              setResult(resBody as T);
            }
          }
        } catch (e) {
          console.error(e);
          setFailed(e as E);
        } finally {
          setLoading(false);
        }
      })();
    },
    [url, init, throwError, parser],
  );

  return { result, statusCode, loading, failed, call };
}

export default useFetchCallback;
