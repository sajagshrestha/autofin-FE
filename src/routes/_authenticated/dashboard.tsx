import { createFileRoute } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_authenticated/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	const { user } = useAuth();

	return (
		<div className="container mx-auto p-6">
			<Card>
				<CardHeader>
					<CardTitle>Dashboard</CardTitle>
					<CardDescription>Welcome to your protected dashboard</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						You are signed in as: <strong>{user?.email}</strong>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
