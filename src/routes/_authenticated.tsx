import { createFileRoute, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'

export const Route = createFileRoute('/_authenticated')({
	component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
	const { user, loading } = useAuth()
	const location = useLocation()

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		)
	}

	if (!user) {
		throw redirect({
			to: '/login',
			search: {
				redirect: location.pathname,
			},
		})
	}

	return <Outlet />
}
