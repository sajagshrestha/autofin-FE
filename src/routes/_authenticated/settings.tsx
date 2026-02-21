import { createFileRoute } from "@tanstack/react-router";
import {
	CheckCircle2,
	Filter,
	Loader2,
	Mail,
	Radio,
	RefreshCw,
	XCircle,
} from "lucide-react";
import { useId, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
	useDisconnectGmailAccount,
	useSetSenderFilters,
	useStartGmailWatch,
	useStopGmailWatch,
} from "@/hooks/gmail/mutations";
import {
	useGetGmailAuthorizationUrl,
	useGetGmailConnectionStatus,
	useGetGmailWatchStatus,
	useGetSenderFilters,
} from "@/hooks/gmail/queries";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmailsFromTextarea(text: string): string[] {
	return text
		.split("\n")
		.map((line) => line.trim().toLowerCase())
		.filter((line) => line.length > 0);
}

function validateEmails(emails: string[]): {
	valid: string[];
	invalid: string[];
} {
	const valid: string[] = [];
	const invalid: string[] = [];
	for (const email of emails) {
		if (EMAIL_REGEX.test(email)) {
			valid.push(email);
		} else {
			invalid.push(email);
		}
	}
	return { valid, invalid };
}

export const Route = createFileRoute("/_authenticated/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { user } = useAuth();
	const filterEmailsId = useId();
	const [filterInput, setFilterInput] = useState("");

	const { data: authUrlData, isLoading: isAuthUrlLoading } =
		useGetGmailAuthorizationUrl();
	const {
		data: connectionStatus,
		isLoading: isStatusLoading,
		refetch: refetchStatus,
	} = useGetGmailConnectionStatus();
	const {
		data: senderFilters,
		isLoading: isFiltersLoading,
		isFetched: isFiltersFetched,
	} = useGetSenderFilters({ enabled: connectionStatus?.authorized ?? false });
	const { data: watchStatus } = useGetGmailWatchStatus({
		enabled:
			(connectionStatus?.authorized ?? false) &&
			(senderFilters?.emails?.length ?? 0) > 0,
	});

	const disconnectMutation = useDisconnectGmailAccount();
	const setFiltersMutation = useSetSenderFilters();
	const startWatchMutation = useStartGmailWatch();
	const stopWatchMutation = useStopGmailWatch();

	const isConnected = connectionStatus?.authorized ?? false;
	const isLoading = isAuthUrlLoading || isStatusLoading;
	const emails = senderFilters?.emails ?? [];
	const hasFilters = emails.length > 0;

	// Sync filter input when data loads (only on first fetch to avoid overwriting user edits)
	const displayFilterValue =
		filterInput !== "" ? filterInput : emails.join("\n");

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
					setFilterInput("");
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

	const handleSaveFilters = () => {
		const parsed = parseEmailsFromTextarea(displayFilterValue);
		const { valid, invalid } = validateEmails(parsed);

		if (invalid.length > 0) {
			toast.error("Invalid email addresses", {
				description: invalid.join(", "),
			});
			return;
		}

		setFiltersMutation.mutate(
			{ body: { emails: valid } },
			{
				onSuccess: () => {
					setFilterInput("");
					toast.success("Filter list saved");
				},
				onError: (error) => {
					toast.error("Failed to save filters", {
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

	const step1Complete = isConnected;
	const step2Complete = hasFilters;
	const step2Current = isConnected && !hasFilters;
	const step3Complete = watchStatus?.hasWatch ?? false;
	const step3Current = hasFilters && !step3Complete;

	return (
		<div className="mx-auto max-w-2xl space-y-8">
			{/* Welcome Section */}
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
					<p className="mt-1 text-muted-foreground">
						Set up Gmail integration in 3 steps.
					</p>
				</div>
				<Badge variant="outline" className="px-3 py-1">
					{user?.email}
				</Badge>
			</div>

			{/* Step Indicator */}
			<div className="flex items-center gap-2">
				<StepCircle
					step={1}
					complete={step1Complete}
					current={!step1Complete}
					label="Connect Gmail"
				/>
				<StepConnector active={step1Complete} />
				<StepCircle
					step={2}
					complete={step2Complete}
					current={step2Current}
					label="Set Filters"
				/>
				<StepConnector active={step2Complete} />
				<StepCircle
					step={3}
					complete={step3Complete}
					current={step3Current}
					label="Start Watch"
				/>
			</div>

			{/* Step 1: Connect Gmail */}
			<Card
				className={`border-l-4 transition-shadow ${
					step1Complete
						? "border-l-green-500"
						: "border-l-primary shadow-sm hover:shadow-md"
				}`}
			>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-2 space-y-1">
							<Mail className="h-5 w-5 shrink-0" />
							<div>
								<CardTitle>Step 1: Connect Gmail</CardTitle>
								<CardDescription>
									Securely connect your account. We only read emails from
									senders you specify.
								</CardDescription>
							</div>
						</div>
						{isConnected && (
							<Badge className="bg-green-500 hover:bg-green-600">
								<CheckCircle2 className="mr-1 h-3 w-3" />
								Connected
							</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : isConnected ? (
						<div className="space-y-4">
							<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
								<div className="rounded-full bg-background p-2">
									<CheckCircle2 className="h-5 w-5 text-green-500" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">
										{connectionStatus?.emailAddress}
									</p>
									<p className="text-xs text-muted-foreground">
										Active Connection
									</p>
								</div>
							</div>
							<Button
								variant="destructive"
								className="w-full"
								onClick={handleDisconnectGoogle}
								disabled={disconnectMutation.isPending}
							>
								{disconnectMutation.isPending ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : null}
								Disconnect
							</Button>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center space-y-4 py-6">
							<div className="rounded-full bg-muted p-4">
								<Mail className="h-8 w-8 text-muted-foreground" />
							</div>
							<div className="max-w-xs space-y-1 text-center">
								<p className="font-medium">No Account Connected</p>
								<p className="text-sm text-muted-foreground">
									Connect your Gmail to automatically track expenses from bank
									alerts and receipts.
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

			{/* Step 2: Set Filter List */}
			<Card
				className={`border-l-4 transition-shadow ${
					step2Complete
						? "border-l-green-500"
						: isConnected
							? "border-l-primary shadow-sm hover:shadow-md"
							: "border-l-muted opacity-60"
				}`}
			>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-2 space-y-1">
							<Filter className="h-5 w-5 shrink-0" />
							<div>
								<CardTitle>Step 2: Set Filter List</CardTitle>
								<CardDescription>
									Add sender email addresses to monitor (e.g. bank alerts,
									noreply@yourbank.com). One per line.
								</CardDescription>
							</div>
						</div>
						{step2Complete && (
							<Badge className="bg-green-500 hover:bg-green-600">
								<CheckCircle2 className="mr-1 h-3 w-3" />
								{emails.length} filter{emails.length !== 1 ? "s" : ""}
							</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{!isConnected ? (
						<p className="py-4 text-center text-sm text-muted-foreground">
							Connect Gmail first to set up filters.
						</p>
					) : isFiltersLoading && !isFiltersFetched ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor={filterEmailsId}>
									Sender emails (one per line)
								</Label>
								<Textarea
									id={filterEmailsId}
									placeholder={"alerts@bank.com\nnoreply@anotherbank.com"}
									rows={5}
									value={displayFilterValue}
									onChange={(e) => setFilterInput(e.target.value)}
									className="font-mono text-sm"
								/>
							</div>
							<Button
								onClick={handleSaveFilters}
								disabled={setFiltersMutation.isPending}
								className="w-full"
							>
								{setFiltersMutation.isPending ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : null}
								Save Filters
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Step 3: Start Watch */}
			<Card
				className={`border-l-4 transition-shadow ${
					step3Complete
						? "border-l-green-500"
						: hasFilters
							? "border-l-primary shadow-sm hover:shadow-md"
							: "border-l-muted opacity-60"
				}`}
			>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-2 space-y-1">
							<Radio className="h-5 w-5 shrink-0" />
							<div>
								<CardTitle>Step 3: Start Watch</CardTitle>
								<CardDescription>
									Start watching for new emails. Watch expires every 7
									days—check back to renew.
								</CardDescription>
							</div>
						</div>
						{step3Complete && (
							<Badge className="bg-green-500 hover:bg-green-600">
								<CheckCircle2 className="mr-1 h-3 w-3" />
								Watching
							</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{!hasFilters ? (
						<p className="py-4 text-center text-sm text-muted-foreground">
							Set your filter list first, then start the watch.
						</p>
					) : (
						<div className="space-y-4">
							{step3Complete && watchStatus?.expiration && (
								<p className="text-sm text-muted-foreground">
									Expires: {new Date(watchStatus.expiration).toLocaleString()}
								</p>
							)}
							<div className="flex gap-3">
								<Button
									variant="outline"
									onClick={handleStartWatching}
									disabled={startWatchMutation.isPending}
									className="flex-1"
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
									className="flex-1"
								>
									{stopWatchMutation.isPending ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<XCircle className="mr-2 h-4 w-4" />
									)}
									Stop Watch
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function StepCircle({
	step,
	complete,
	current,
	label,
}: {
	step: number;
	complete: boolean;
	current: boolean;
	label: string;
}) {
	return (
		<div className="flex flex-col items-center gap-1">
			<div
				className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-medium transition-colors ${
					complete
						? "border-green-500 bg-green-500 text-white"
						: current
							? "border-primary bg-primary text-primary-foreground"
							: "border-muted bg-muted text-muted-foreground"
				}`}
			>
				{complete ? <CheckCircle2 className="h-5 w-5" /> : step}
			</div>
			<span className="text-xs font-medium text-muted-foreground">{label}</span>
		</div>
	);
}

function StepConnector({ active }: { active: boolean }) {
	return (
		<div
			className={`h-0.5 flex-1 min-w-[24px] rounded transition-colors ${
				active ? "bg-green-500" : "bg-muted"
			}`}
		/>
	);
}
