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
