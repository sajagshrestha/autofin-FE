import { $api } from "@/lib/api-client";
import { TRANSACTIONS_ENDPOINTS } from "./endpoints";

/**
 * Updates transaction details
 */
export function useUpdateTransaction() {
	return $api.useMutation("patch", TRANSACTIONS_ENDPOINTS.DETAIL);
}

/**
 * Deletes a transaction by ID
 */
export function useDeleteTransaction() {
	return $api.useMutation("delete", TRANSACTIONS_ENDPOINTS.DETAIL);
}
