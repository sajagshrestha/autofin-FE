import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			<div className="flex min-h-[80vh] flex-col items-center justify-center">
				<Card className="w-full max-w-2xl">
					<CardHeader>
						<CardTitle className="text-3xl">Welcome to AutoFin</CardTitle>
						<CardDescription className="text-lg">
							{user
								? `You are signed in as ${user.email}`
								: "Get started by signing in or creating an account"}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{user ? (
							<div className="flex flex-col gap-4">
								<Link to="/dashboard">
									<Button className="w-full">Go to Dashboard</Button>
								</Link>
							</div>
						) : (
							<div className="flex flex-col gap-4 sm:flex-row">
								<Link to="/login" className="flex-1">
									<Button className="w-full">Sign In</Button>
								</Link>
								<Link to="/signup" className="flex-1">
									<Button variant="outline" className="w-full">
										Sign Up
									</Button>
								</Link>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
