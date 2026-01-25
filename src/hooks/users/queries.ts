import { $api } from "@/lib/api-client";
import { USERS_ENDPOINTS } from "./endpoints";

/**
 * Fetches all users from the API
 */
export function useGetAllUsers() {
	return $api.useQuery("get", USERS_ENDPOINTS.LIST, {});
}

/**
 * Fetches a single user by their ID
 */
export function useGetUserById(id: string) {
	return $api.useQuery("get", USERS_ENDPOINTS.DETAIL, {
		params: {
			path: { id },
		},
	});
}
