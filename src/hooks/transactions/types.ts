import type { paths } from "@/lib/api/types";

import type { TRANSACTIONS_ENDPOINTS } from "./endpoints";

export type Transaction =
	paths[typeof TRANSACTIONS_ENDPOINTS.LIST]["get"]["responses"]["200"]["content"]["application/json"]["transactions"][number];

export type UpdateTransactionBody = NonNullable<
	paths[typeof TRANSACTIONS_ENDPOINTS.DETAIL]["patch"]["requestBody"]
>["content"]["application/json"];

/** Form values for editing a transaction (subset of fields + amount for display). */
export type EditTransactionFormValues = {
	merchant: string;
	categoryId: string;
	remarks: string;
	amount: string;
};

/** Map form values to API update body (null/empty → undefined for optional fields). */
export function mapEditFormToUpdateBody(
	values: EditTransactionFormValues,
): UpdateTransactionBody {
	return {
		merchant: values.merchant || undefined,
		categoryId: values.categoryId || undefined,
		remarks: values.remarks || undefined,
	};
}
