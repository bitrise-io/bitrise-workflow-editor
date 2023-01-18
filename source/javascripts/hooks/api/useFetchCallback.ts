import { useState, useCallback, useRef } from "react";
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
	parser: ResponseParser = defaultParser
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

					const result = await fetch(url, {
						signal: abortController.current?.signal,
						...init,
						...options,
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json",
							...init?.headers,
							...options?.headers
						}
					});

					setStatusCode(result.status);

					if (result.status >= 500) {
						throwError(new Error(`Failed to fetch, ${result.statusText} ${url}`));
						return;
					}
					const body = await result.text();
					if (body.length > 0) {
						const resBody = parser(body);

						if (body.includes("error_msg") || !result.ok) {
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
		[url, init]
	);

	return { result, statusCode, loading, failed, call };
}

export default useFetchCallback;
