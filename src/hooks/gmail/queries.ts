import { $api } from '@/lib/api-client'
import { GMAIL_ENDPOINTS } from './endpoints'

/**
 * Fetches the Gmail OAuth authorization URL to redirect the user
 */
export function useGetGmailAuthorizationUrl() {
	return $api.useQuery('get', GMAIL_ENDPOINTS.AUTHORIZE, {})
}

/**
 * Handles the Gmail OAuth callback after user authorization
 */
export function useGetGmailOAuthCallback(params?: {
	code?: string
	state?: string
	error?: string
}) {
	return $api.useQuery('get', GMAIL_ENDPOINTS.CALLBACK, {
		params: {
			query: params,
		},
	})
}

/**
 * Fetches the current Gmail OAuth connection status for the user
 */
export function useGetGmailConnectionStatus() {
	return $api.useQuery('get', GMAIL_ENDPOINTS.STATUS, {})
}
