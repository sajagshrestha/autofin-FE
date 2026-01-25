import type { paths } from "@/lib/api/types";

/**
 * Typesafe endpoint constants for Health API
 */
export const HEALTH_ENDPOINTS = {
	CHECK: "/api/v1/health",
} satisfies Record<string, keyof paths>;
