import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
	useGetGmailAuthorizationUrl,
	useGetGmailConnectionStatus,
} from "@/hooks/gmail/queries";
import {
	useDisconnectGmailAccount,
	useStartGmailWatch,
	useStopGmailWatch,
} from "@/hooks/gmail/mutations";

export const Route = createFileRoute("/_authenticated/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	const { user } = useAuth();
	const { data: authUrlData, isLoading: isAuthUrlLoading } =
		useGetGmailAuthorizationUrl();
	const {
		data: connectionStatus,
		isLoading: isStatusLoading,
		refetch: refetchStatus,
	} = useGetGmailConnectionStatus();
	const disconnectMutation = useDisconnectGmailAccount();
	const startWatchMutation = useStartGmailWatch();
	const stopWatchMutation = useStopGmailWatch();

	const isConnected = connectionStatus?.authorized ?? false;
	const isLoading = isAuthUrlLoading || isStatusLoading;

	const handleConnectGoogle = () => {
		if (authUrlData?.authorizationUrl) {
			window.location.href = authUrlData.authorizationUrl;
		}
	};

	const handleDisconnectGoogle = () => {
		disconnectMutation.mutate(
			{},
			{
				onSuccess: () => {
					refetchStatus();
					toast.success("Google account disconnected");
				},
				onError: (error) => {
					toast.error("Failed to disconnect", {
						description: error.message,
					});
				},
			}
		);
	};

	const handleStartWatching = () => {
		startWatchMutation.mutate(
			{},
			{
				onSuccess: (data) => {
					toast.success("Gmail watch started", {
						description: `Watching until ${new Date(data.expiration).toLocaleString()}`,
					});
				},
				onError: (error) => {
					toast.error("Failed to start watching", {
						description: error.message,
					});
				},
			}
		);
	};

	const handleStopWatching = () => {
		stopWatchMutation.mutate(
			{},
			{
				onSuccess: () => {
					toast.success("Gmail watch stopped");
				},
				onError: (error) => {
					toast.error("Failed to stop watching", {
						description: error.message,
					});
				},
			}
		);
	};

	return (
		<div className="container mx-auto p-6">
			<Card>
				<CardHeader>
					<CardTitle>Dashboard</CardTitle>
					<CardDescription>Welcome to your protected dashboard</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground">
						You are signed in as: <strong>{user?.email}</strong>
					</p>
					{isConnected ? (
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Connected as: <strong>{connectionStatus?.emailAddress}</strong>
							</p>
							<div className="flex gap-2">
								<Button
									onClick={handleStartWatching}
									disabled={startWatchMutation.isPending}
								>
									{startWatchMutation.isPending
										? "Starting..."
										: "Start Watching"}
								</Button>
								<Button
									variant="outline"
									onClick={handleStopWatching}
									disabled={stopWatchMutation.isPending}
								>
									{stopWatchMutation.isPending
										? "Stopping..."
										: "Stop Watching"}
								</Button>
								<Button
									variant="destructive"
									onClick={handleDisconnectGoogle}
									disabled={disconnectMutation.isPending}
								>
									{disconnectMutation.isPending
										? "Disconnecting..."
										: "Disconnect Google"}
								</Button>
							</div>
						</div>
					) : (
						<Button onClick={handleConnectGoogle} disabled={isLoading}>
							{isLoading ? "Loading..." : "Connect Google"}
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
