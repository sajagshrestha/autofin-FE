import { z } from "zod";

export const editTransactionSchema = z.object({
	merchant: z.string().min(1, "Merchant name is required"),
	categoryId: z.string(),
	remarks: z.string(),
});

export const createFromSmsSchema = z.object({
	smsBody: z
		.string()
		.min(1, "SMS message is required")
		.refine(
			(s) => s.trim().length > 0,
			"SMS message cannot be only whitespace",
		),
	sender: z.string(),
});

export const createTransactionSchema = z.object({
	amount: z
		.string()
		.min(1, "Amount is required")
		.refine(
			(value) => Number.isFinite(Number(value)),
			"Amount must be a number",
		)
		.refine((value) => Number(value) > 0, "Amount must be greater than 0"),
	type: z.enum(["debit", "credit"]),
	categoryId: z.string(),
	merchant: z.string(),
	remarks: z.string(),
	transactionDate: z
		.string()
		.refine(
			(value) =>
				value.length === 0 || Number.isFinite(new Date(value).getTime()),
			"Transaction date is invalid",
		),
});
