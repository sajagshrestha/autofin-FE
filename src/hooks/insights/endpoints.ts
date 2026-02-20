import type { paths } from "@/lib/api/types";
export const INSIGHTS_ENDPOINTS = {
	GENERATE: "/api/v1/insights/generate",
	GET_LAST: "/api/v1/insights/latest",
} satisfies Record<string, keyof paths>;
