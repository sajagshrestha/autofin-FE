import { $api } from "@/lib/api-client";
import { TRANSACTIONS_ENDPOINTS } from "./endpoints";

/**
 * Fetches all transactions with optional filters
 */
export function useGetAllTransactions(params?: {
	categoryId?: string;
	type?: "debit" | "credit";
	startDate?: string;
	endDate?: string;
	minAmount?: number | null;
	maxAmount?: number | null;
	limit?: number;
	offset?: number | null;
}) {
	return $api.useQuery("get", TRANSACTIONS_ENDPOINTS.LIST, {
		params: {
			query: params,
		},
	});
}

/**
 * Fetches transaction summary statistics
 */
export function useGetTransactionSummary(params?: {
	startDate?: string;
	endDate?: string;
}) {
	return $api.useQuery("get", TRANSACTIONS_ENDPOINTS.SUMMARY, {
		params: {
			query: params,
		},
	});
}

/**
 * Fetches a single transaction by its ID
 */
export function useGetTransactionById(id: string) {
	return $api.useQuery("get", TRANSACTIONS_ENDPOINTS.DETAIL, {
		params: {
			path: { id },
		},
	});
}
