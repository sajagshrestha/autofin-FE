import type { paths } from "@/lib/api/types";

/**
 * Typesafe endpoint constants for Gmail OAuth API
 */
export const GMAIL_ENDPOINTS = {
	AUTHORIZE: "/api/v1/gmail/oauth/authorize",
	CALLBACK: "/api/v1/gmail/oauth/callback",
	REFRESH: "/api/v1/gmail/oauth/refresh",
	REVOKE: "/api/v1/gmail/oauth/revoke",
	STATUS: "/api/v1/gmail/oauth/status",
} satisfies Record<string, keyof paths>;
