import { $api } from "@/lib/api-client";
import { INSIGHTS_ENDPOINTS } from "./endpoints";

/**
 * Fetches the most recent financial insight for the authenticated user.
 * Returns 404 when no insights exist yet.
 */
export function useGetLatestInsight() {
	return $api.useQuery("get", INSIGHTS_ENDPOINTS.GET_LAST, {
		params: {
			query: {
				limit: 1,
				offset: 0,
			},
		},
	});
}
