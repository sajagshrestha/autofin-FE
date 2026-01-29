import { $api } from "@/lib/api-client";
import { GMAIL_ENDPOINTS } from "./endpoints";

/**
 * Fetches the Gmail OAuth authorization URL to redirect the user
 */
export function useGetGmailAuthorizationUrl() {
	return $api.useQuery("get", GMAIL_ENDPOINTS.AUTHORIZE, {});
}

/**
 * Handles the Gmail OAuth callback after user authorization
 */
export function useGetGmailOAuthCallback(params?: {
	code?: string;
	state?: string;
	error?: string;
}) {
	return $api.useQuery("get", GMAIL_ENDPOINTS.CALLBACK, {
		params: {
			query: params,
		},
	});
}

/**
 * Fetches the current Gmail OAuth connection status for the user
 */
export function useGetGmailConnectionStatus() {
	return $api.useQuery("get", GMAIL_ENDPOINTS.STATUS, {});
}

/**
 * Fetches the Gmail profile for the authenticated user
 */
export function useGetGmailProfile() {
	return $api.useQuery("get", GMAIL_ENDPOINTS.PROFILE, {});
}

/**
 * Lists messages in the user's mailbox with optional search query
 */
export function useGetGmailMessages(params?: {
	q?: string;
	maxResults?: number;
	pageToken?: string;
}) {
	return $api.useQuery("get", GMAIL_ENDPOINTS.MESSAGES, {
		params: {
			query: params,
		},
	});
}

/**
 * Fetches a specific Gmail message by ID
 */
export function useGetGmailMessage(
	messageId: string,
	params?: {
		format?: "full" | "metadata" | "minimal";
	}
) {
	return $api.useQuery("get", GMAIL_ENDPOINTS.MESSAGE, {
		params: {
			path: { messageId },
			query: params,
		},
	});
}

/**
 * Fetches an attachment from a Gmail message
 */
export function useGetGmailAttachment(messageId: string, attachmentId: string) {
	return $api.useQuery("get", GMAIL_ENDPOINTS.ATTACHMENT, {
		params: {
			path: { messageId, attachmentId },
		},
	});
}

/**
 * Fetches the history of changes to the mailbox since a given historyId
 */
export function useGetGmailHistory(params: {
	startHistoryId: string;
	maxResults?: number;
}) {
	return $api.useQuery("get", GMAIL_ENDPOINTS.HISTORY, {
		params: {
			query: params,
		},
	});
}
