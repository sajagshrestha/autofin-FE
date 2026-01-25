import type { paths } from '@/lib/api/types'

/**
 * Typesafe endpoint constants for Users API
 */
export const USERS_ENDPOINTS = {
	LIST: '/api/v1/users',
	DETAIL: '/api/v1/users/{id}',
} satisfies Record<string, keyof paths>
