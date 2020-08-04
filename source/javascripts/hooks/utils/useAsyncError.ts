import { useState, useCallback } from "react";

export default function useAsyncError(): (e: Error) => void {
	const [, setError] = useState();
	return useCallback(
		e => {
			setError(() => {
				throw e;
			});
		},
		[setError]
	);
}
