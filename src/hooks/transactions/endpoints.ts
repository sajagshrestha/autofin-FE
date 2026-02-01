import type { paths } from "@/lib/api/types";

export const TRANSACTIONS_ENDPOINTS = {
	LIST: "/api/v1/transactions",
	SUMMARY: "/api/v1/transactions/summary",
	DETAIL: "/api/v1/transactions/{id}",
	CREATE_FROM_SMS: "/api/v1/transactions/sms",
} satisfies Record<string, keyof paths>;

/** Path prefix for all transaction endpoints (used for query key matching) */
export const TRANSACTIONS_PATH_PREFIX = TRANSACTIONS_ENDPOINTS.LIST;

/** Type-safe predicate: true if this query key is a GET for any transaction endpoint */
export function isTransactionsQueryKey(queryKey: readonly unknown[]): boolean {
	return (
		queryKey[0] === "get" &&
		typeof queryKey[1] === "string" &&
		queryKey[1].startsWith(TRANSACTIONS_PATH_PREFIX)
	);
}
