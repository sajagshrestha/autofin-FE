import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/auth/callback")({
	component: AuthCallbackPage,
});

function AuthCallbackPage() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!loading) {
			if (user) {
				navigate({ to: "/dashboard" });
			} else {
				navigate({ to: "/login" });
			}
		}
	}, [user, loading, navigate]);

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Completing sign in</CardTitle>
					<CardDescription>
						Please wait while we finish signing you in...
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-4">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
