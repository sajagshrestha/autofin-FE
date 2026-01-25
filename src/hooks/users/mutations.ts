import { $api } from "@/lib/api-client";
import { USERS_ENDPOINTS } from "./endpoints";

/**
 * Creates a new user with email
 */
export function useCreateUser() {
	return $api.useMutation("post", USERS_ENDPOINTS.LIST);
}

/**
 * Updates an existing user by ID
 */
export function useUpdateUserById() {
	return $api.useMutation("put", USERS_ENDPOINTS.DETAIL);
}

/**
 * Deletes a user by ID
 */
export function useDeleteUserById() {
	return $api.useMutation("delete", USERS_ENDPOINTS.DETAIL);
}
