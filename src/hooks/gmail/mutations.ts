import { useQueryClient } from "@tanstack/react-query";
import { $api } from "@/lib/api-client";
import { GMAIL_ENDPOINTS } from "./endpoints";

/**
 * Refreshes the Gmail OAuth access token
 */
export function useRefreshGmailAccessToken() {
	return $api.useMutation("post", GMAIL_ENDPOINTS.REFRESH);
}

/**
 * Revokes and disconnects the Gmail OAuth connection
 */
export function useDisconnectGmailAccount() {
	return $api.useMutation("delete", GMAIL_ENDPOINTS.REVOKE);
}

function invalidateWatchStatus(queryClient: ReturnType<typeof useQueryClient>) {
	queryClient.invalidateQueries({
		predicate: (query) =>
			query.queryKey[0] === "get" &&
			query.queryKey[1] === GMAIL_ENDPOINTS.WATCH_STATUS,
	});
}

/**
 * Starts watching Gmail for push notifications via Pub/Sub
 */
export function useStartGmailWatch() {
	const queryClient = useQueryClient();
	return $api.useMutation("post", GMAIL_ENDPOINTS.WATCH, {
		onSuccess: () => invalidateWatchStatus(queryClient),
	});
}

/**
 * Stops watching Gmail push notifications
 */
export function useStopGmailWatch() {
	const queryClient = useQueryClient();
	return $api.useMutation("delete", GMAIL_ENDPOINTS.WATCH, {
		onSuccess: () => invalidateWatchStatus(queryClient),
	});
}

/**
 * Sets the sender filter (emails to monitor, e.g. bank alerts).
 * Creates a Gmail filter that auto-applies the monitor label to emails from the given senders.
 */
export function useSetSenderFilters() {
	const queryClient = useQueryClient();
	return $api.useMutation("post", GMAIL_ENDPOINTS.SENDER_FILTERS, {
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "get" &&
					query.queryKey[1] === GMAIL_ENDPOINTS.SENDER_FILTERS,
			});
		},
	});
}
