import type { paths } from "@/lib/api/types";

import type { TRANSACTIONS_ENDPOINTS } from "./endpoints";

export type Transaction =
	paths[typeof TRANSACTIONS_ENDPOINTS.LIST]["get"]["responses"]["200"]["content"]["application/json"]["transactions"][number];

export type UpdateTransactionBody = NonNullable<
	paths[typeof TRANSACTIONS_ENDPOINTS.DETAIL]["patch"]["requestBody"]
>["content"]["application/json"];

/** Form values for editing a transaction. */
export type CreateTransactionBody = NonNullable<
	paths[typeof TRANSACTIONS_ENDPOINTS.LIST]["post"]["requestBody"]
>["content"]["application/json"];

/** Form values for editing a transaction (subset of fields + amount for display). */
export type EditTransactionFormValues = {
	merchant: string;
	categoryId: string;
	remarks: string;
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

/** Form values for creating a manual transaction. */
export type CreateTransactionFormValues = {
	amount: string;
	type: "debit" | "credit";
	categoryId: string;
	merchant: string;
	remarks: string;
	transactionDate: string;
};

/** Map create form values to API body (trim + convert primitives). */
export function mapCreateFormToCreateBody(
	values: CreateTransactionFormValues,
): CreateTransactionBody {
	return {
		amount: Number(values.amount),
		type: values.type,
		categoryId: values.categoryId || undefined,
		merchant: values.merchant.trim() || undefined,
		remarks: values.remarks.trim() || undefined,
		transactionDate: values.transactionDate
			? new Date(values.transactionDate).toISOString()
			: undefined,
	};
}
