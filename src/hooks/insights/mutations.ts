import { useQueryClient } from "@tanstack/react-query";
import { getDateRangeForPeriod } from "@/components/ui/date-filter";
import { $api } from "@/lib/api-client";
import { INSIGHTS_ENDPOINTS } from "./endpoints";

/**
 * Generates AI-powered financial insights for a given period.
 * Defaults to the current month when no params are provided.
 */
export function useGenerateInsight() {
	const queryClient = useQueryClient();

	return $api.useMutation("post", INSIGHTS_ENDPOINTS.GENERATE, {
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "get" &&
					query.queryKey[1] === INSIGHTS_ENDPOINTS.GET_LAST,
			});
		},
	});
}

/**
 * Returns startDate and endDate for the current month (ISO strings).
 */
export function getCurrentMonthRange() {
	const range = getDateRangeForPeriod("monthly");
	return {
		startDate: range.startDate ?? "",
		endDate: range.endDate ?? "",
	};
}
