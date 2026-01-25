import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import { env } from "@/env";
import type { paths } from "./api/types";
import { supabase } from "./supabase";

/**
 * Create the OpenAPI fetch client with Supabase auth middleware
 * The middleware automatically adds the Authorization header with the current Supabase session token
 */
const fetchClient = createFetchClient<paths>({
	baseUrl: env.VITE_API_BASE_URL || "",
});

// Add middleware to automatically inject Supabase auth token
fetchClient.use({
	async onRequest({ request }) {
		// Get the current session token
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (session?.access_token) {
			request.headers.set("Authorization", `Bearer ${session.access_token}`);
		}

		return request;
	},
});

/**
 * Create the React Query client wrapper
 *
 * Usage example:
 * ```tsx
 * import { $api } from '@/lib/api-client'
 *
 * function MyComponent() {
 *   const { data, error, isLoading } = $api.useQuery(
 *     'get',
 *     '/users/me',
 *     {}
 *   )
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return <div>{data?.name}</div>
 * }
 * ```
 */
export const $api = createClient(fetchClient);
