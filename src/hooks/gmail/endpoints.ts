import type { paths } from "@/lib/api/types";

/**
 * Typesafe endpoint constants for Gmail OAuth API
 */
export const GMAIL_ENDPOINTS = {
	// OAuth endpoints
	AUTHORIZE: "/api/v1/gmail/oauth/authorize",
	CALLBACK: "/api/v1/gmail/oauth/callback",
	REFRESH: "/api/v1/gmail/oauth/refresh",
	REVOKE: "/api/v1/gmail/oauth/revoke",
	STATUS: "/api/v1/gmail/oauth/status",
	// Gmail API endpoints
	PROFILE: "/api/v1/gmail/profile",
	MESSAGES: "/api/v1/gmail/messages",
	MESSAGE: "/api/v1/gmail/messages/{messageId}",
	ATTACHMENT: "/api/v1/gmail/messages/{messageId}/attachments/{attachmentId}",
	HISTORY: "/api/v1/gmail/history",
	WATCH: "/api/v1/gmail/watch",
	LABELS: "/api/v1/gmail/labels",
} satisfies Record<string, keyof paths>;
