import { useState, useCallback } from "react";
import useAsyncError from "../utils/useAsyncError";

export interface FetchResponse<T, E> {
	result: T | undefined;
	statusCode?: number;
	loading: boolean;
	failed: E | undefined;
	call: () => void;
}

function useFetchCallback<T, E>(url: string, init?: RequestInit): FetchResponse<T, E> {
	const [result, setResult] = useState<T>();
	const [loading, setLoading] = useState(false);
	const [failed, setFailed] = useState<E>();
	const [statusCode, setStatusCode] = useState<number>();
	const throwError = useAsyncError();

	const call = useCallback(() => {
		const abortController = new AbortController();
		(async () => {
			setLoading(true);
			try {
				if (url === "") {
					throwError(new Error("Url is required"));
					return;
				}

				const result = await fetch(url, {
					signal: abortController.signal,
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
					const resBody = JSON.parse(body);

					if (body.includes("error_msg")) {
						setFailed(resBody as E);
					} else {
						setResult(resBody as T);
					}
				}
			} catch (e) {
				console.error(e);
				setFailed(e);
			} finally {
				setLoading(false);
			}
		})();
		return () => {
			setStatusCode(undefined);
			setFailed(undefined);

			abortController.abort();
		};
	}, [url, init]);

	return { result, statusCode, loading, failed, call };
}

export default useFetchCallback;
