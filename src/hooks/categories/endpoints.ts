import type { paths } from "@/lib/api/types";

export const CATEGORIES_ENDPOINTS = {
	LIST: "/api/v1/categories",
	DETAIL: "/api/v1/categories/{id}",
} satisfies Record<string, keyof paths>;

/** Path prefix for all category endpoints (used for query key matching) */
export const CATEGORIES_PATH_PREFIX = CATEGORIES_ENDPOINTS.LIST;

/** Type-safe predicate: true if this query key is a GET for any category endpoint */
export function isCategoriesQueryKey(queryKey: readonly unknown[]): boolean {
	return (
		queryKey[0] === "get" &&
		typeof queryKey[1] === "string" &&
		queryKey[1].startsWith(CATEGORIES_PATH_PREFIX)
	);
}
