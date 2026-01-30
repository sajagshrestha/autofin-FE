import { $api } from "@/lib/api-client";
import { CATEGORIES_ENDPOINTS } from "./endpoints";

/**
 * Fetches all categories (predefined + user custom)
 */
export function useGetAllCategories() {
	return $api.useQuery("get", CATEGORIES_ENDPOINTS.LIST, {});
}

/**
 * Fetches a specific category by its ID
 */
export function useGetCategoryById(id: string) {
	return $api.useQuery("get", CATEGORIES_ENDPOINTS.DETAIL, {
		params: {
			path: { id },
		},
	});
}
