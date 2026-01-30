import type { paths } from "@/lib/api/types";

import type { CATEGORIES_ENDPOINTS } from "./endpoints";

export type Category =
	paths[typeof CATEGORIES_ENDPOINTS.LIST]["get"]["responses"]["200"]["content"]["application/json"]["categories"][number];
