import { useState, useCallback, useRef } from "react";
import { useAsyncError } from "../utils/useAsyncError";

export interface FetchResponse<T, E> {
	result: T | undefined;
	statusCode?: number;
	loading: boolean;
	failed: E | undefined;
	call: () => void;
}

function useFetchCallback<T, E>(url: string, init?: RequestInit, parser = JSON.parse): FetchResponse<T, E> {
	const [result, setResult] = useState<T>();
	const [loading, setLoading] = useState(false);
	const [failed, setFailed] = useState<E>();
	const [statusCode, setStatusCode] = useState<number>();
	const abortController = useRef<AbortController>();
	const throwError = useAsyncError();

	const call = useCallback(() => {
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
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						...init?.headers
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

					if (body.includes("error_msg")) {
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
	}, [url, init]);

	return { result, statusCode, loading, failed, call };
}

export default useFetchCallback;
