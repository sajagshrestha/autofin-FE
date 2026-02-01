import { useQueryClient } from "@tanstack/react-query";
import { $api } from "@/lib/api-client";
import { CATEGORIES_ENDPOINTS, isCategoriesQueryKey } from "./endpoints";

function categoriesInvalidateOnSuccess(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return {
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) => isCategoriesQueryKey(query.queryKey),
			});
		},
	};
}

/**
 * Creates a new custom category
 */
export function useCreateCategory() {
	const queryClient = useQueryClient();
	return $api.useMutation(
		"post",
		CATEGORIES_ENDPOINTS.LIST,
		categoriesInvalidateOnSuccess(queryClient),
	);
}

/**
 * Updates an existing custom category
 */
export function useUpdateCategory() {
	const queryClient = useQueryClient();
	return $api.useMutation(
		"patch",
		CATEGORIES_ENDPOINTS.DETAIL,
		categoriesInvalidateOnSuccess(queryClient),
	);
}

/**
 * Deletes a custom category
 */
export function useDeleteCategory() {
	const queryClient = useQueryClient();
	return $api.useMutation(
		"delete",
		CATEGORIES_ENDPOINTS.DETAIL,
		categoriesInvalidateOnSuccess(queryClient),
	);
}
