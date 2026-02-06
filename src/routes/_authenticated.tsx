import {
	createFileRoute,
	Outlet,
	useLocation,
	useRouter,
} from "@tanstack/react-router";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_authenticated")({
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const location = useLocation();

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (!user) {
		router.navigate({
			to: "/login",
			search: {
				redirect: location.pathname,
			},
		});
	}

	return (
		<div className="flex min-h-screen">
			<Header />
			<main className="flex-1 min-w-0 md:ml-64 lg:ml-72 pb-16 md:pb-0">
				<Outlet />
			</main>
		</div>
	);
}
