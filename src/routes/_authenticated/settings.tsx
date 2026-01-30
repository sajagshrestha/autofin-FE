import { createFileRoute } from "@tanstack/react-router";
import {
	CheckCircle2,
	Loader2,
	Mail,
	Radio,
	RefreshCw,
	XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
	useDisconnectGmailAccount,
	useStartGmailWatch,
	useStopGmailWatch,
} from "@/hooks/gmail/mutations";
import {
	useGetGmailAuthorizationUrl,
	useGetGmailConnectionStatus,
} from "@/hooks/gmail/queries";

export const Route = createFileRoute("/_authenticated/settings")({
	component: SettingsPage,
});

function SettingsPage() {
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
			},
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
			},
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
			},
		);
	};

	return (
		<div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto">
			<div className="space-y-8">
				{/* Welcome Section */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
						<p className="text-muted-foreground mt-1">
							Manage your Gmail connection and preferences.
						</p>
					</div>
					<Badge variant="outline" className="px-3 py-1">
						{user?.email}
					</Badge>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Connection Status Card */}
					<Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
						<CardHeader>
							<div className="flex justify-between items-start">
								<div className="space-y-1">
									<CardTitle className="flex items-center gap-2">
										<Mail className="h-5 w-5" />
										Gmail Connection
									</CardTitle>
									<CardDescription>
										Connect your Gmail account to auto-track expenses.
									</CardDescription>
								</div>
								{isConnected ? (
									<Badge className="bg-green-500 hover:bg-green-600">
										Connected
									</Badge>
								) : (
									<Badge variant="destructive">Disconnected</Badge>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
								</div>
							) : isConnected ? (
								<div className="space-y-6">
									<div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
										<div className="bg-background p-2 rounded-full">
											<CheckCircle2 className="h-5 w-5 text-green-500" />
										</div>
										<div className="flex-1 overflow-hidden">
											<p className="text-sm font-medium truncate">
												{connectionStatus?.emailAddress}
											</p>
											<p className="text-xs text-muted-foreground">
												Active Connection
											</p>
										</div>
									</div>

									<div className="space-y-3">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">
												Watch Status
											</span>
											<span className="flex items-center gap-1.5 font-medium">
												Unknown (Check Logs)
											</span>
										</div>
										<div className="grid grid-cols-2 gap-3">
											<Button
												variant="outline"
												onClick={handleStartWatching}
												disabled={startWatchMutation.isPending}
												className="w-full"
											>
												{startWatchMutation.isPending ? (
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												) : (
													<Radio className="mr-2 h-4 w-4" />
												)}
												Start Watch
											</Button>
											<Button
												variant="outline"
												onClick={handleStopWatching}
												disabled={stopWatchMutation.isPending}
												className="w-full"
											>
												{stopWatchMutation.isPending ? (
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												) : (
													<XCircle className="mr-2 h-4 w-4" />
												)}
												Stop Watch
											</Button>
										</div>
										<Button
											variant="destructive"
											className="w-full"
											onClick={handleDisconnectGoogle}
											disabled={disconnectMutation.isPending}
										>
											{disconnectMutation.isPending ? (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											) : (
												<span className="flex items-center">
													Delete Connection
												</span>
											)}
										</Button>
									</div>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-6 space-y-4">
									<div className="p-4 bg-muted rounded-full">
										<Mail className="h-8 w-8 text-muted-foreground" />
									</div>
									<div className="text-center space-y-1 max-w-xs">
										<p className="font-medium">No Account Connected</p>
										<p className="text-sm text-muted-foreground">
											Connect your Gmail to start automatically tracking
											expenses from receipts.
										</p>
									</div>
									<Button
										onClick={handleConnectGoogle}
										disabled={isLoading}
										className="w-full"
										size="lg"
									>
										{isLoading ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<RefreshCw className="mr-2 h-4 w-4" />
										)}
										Connect Gmail
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Instructions / Info Card */}
					<Card className="shadow-sm">
						<CardHeader>
							<CardTitle>How it works</CardTitle>
							<CardDescription>
								Automated expense tracking in 3 steps
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-4">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted font-medium">
									1
								</div>
								<div className="space-y-1">
									<p className="font-medium">Connect Gmail</p>
									<p className="text-sm text-muted-foreground">
										Securely connect your account. We only read emails relevant
										to transactions.
									</p>
								</div>
							</div>
							<div className="flex gap-4">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted font-medium">
									2
								</div>
								<div className="space-y-1">
									<p className="font-medium">Enable Watch</p>
									<p className="text-sm text-muted-foreground">
										Start watching for new emails. This expires periodically (7
										days), so check back.
									</p>
								</div>
							</div>
							<div className="flex gap-4">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted font-medium">
									3
								</div>
								<div className="space-y-1">
									<p className="font-medium">View Transactions</p>
									<p className="text-sm text-muted-foreground">
										Expenses are automatically extracted and categorized in the
										Transactions page.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
