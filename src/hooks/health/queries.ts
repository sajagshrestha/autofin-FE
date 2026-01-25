import { $api } from "@/lib/api-client";
import { HEALTH_ENDPOINTS } from "./endpoints";

/**
 * Checks if the API is healthy and available
 */
export function useGetApiHealthStatus() {
	return $api.useQuery("get", HEALTH_ENDPOINTS.CHECK, {});
}
