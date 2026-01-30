import type { paths } from "@/lib/api/types";

export const TRANSACTIONS_ENDPOINTS = {
	LIST: "/api/v1/transactions",
	SUMMARY: "/api/v1/transactions/summary",
	DETAIL: "/api/v1/transactions/{id}",
} satisfies Record<string, keyof paths>;
