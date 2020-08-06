import useFetchCallback, { FetchResponse } from "./useFetchCallback";
import getCookie from "../utils/cookies";

export default function useMonolithApiCallback<T, E>(url: string, init?: RequestInit): FetchResponse<T, E> {
	return useFetchCallback<T, E>(url, {
		...init,
		headers: {
			"X-CSRF-TOKEN": getCookie("CSRF-TOKEN"),
			...init?.headers
		}
	});
}
