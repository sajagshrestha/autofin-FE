import type { paths } from "@/lib/api/types";

export const CATEGORIES_ENDPOINTS = {
	LIST: "/api/v1/categories",
	DETAIL: "/api/v1/categories/{id}",
} satisfies Record<string, keyof paths>;
