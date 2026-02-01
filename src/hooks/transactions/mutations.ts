import { useQueryClient } from "@tanstack/react-query";
import { $api } from "@/lib/api-client";
import { isTransactionsQueryKey, TRANSACTIONS_ENDPOINTS } from "./endpoints";

function transactionsInvalidateOnSuccess(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return {
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) => isTransactionsQueryKey(query.queryKey),
			});
		},
	};
}

/**
 * Updates transaction details
 */
export function useUpdateTransaction() {
	const queryClient = useQueryClient();
	return $api.useMutation(
		"patch",
		TRANSACTIONS_ENDPOINTS.DETAIL,
		transactionsInvalidateOnSuccess(queryClient),
	);
}

/**
 * Deletes a transaction by ID
 */
export function useDeleteTransaction() {
	const queryClient = useQueryClient();
	return $api.useMutation(
		"delete",
		TRANSACTIONS_ENDPOINTS.DETAIL,
		transactionsInvalidateOnSuccess(queryClient),
	);
}

/**
 * Creates a transaction from an SMS message using AI extraction
 */
export function useCreateTransactionFromSms() {
	const queryClient = useQueryClient();
	return $api.useMutation(
		"post",
		TRANSACTIONS_ENDPOINTS.CREATE_FROM_SMS,
		transactionsInvalidateOnSuccess(queryClient),
	);
}
