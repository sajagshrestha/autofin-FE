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
