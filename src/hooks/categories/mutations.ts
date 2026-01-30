import { $api } from "@/lib/api-client";
import { CATEGORIES_ENDPOINTS } from "./endpoints";

/**
 * Creates a new custom category
 */
export function useCreateCategory() {
	return $api.useMutation("post", CATEGORIES_ENDPOINTS.LIST);
}

/**
 * Updates an existing custom category
 */
export function useUpdateCategory() {
	return $api.useMutation("patch", CATEGORIES_ENDPOINTS.DETAIL);
}

/**
 * Deletes a custom category
 */
export function useDeleteCategory() {
	return $api.useMutation("delete", CATEGORIES_ENDPOINTS.DETAIL);
}
