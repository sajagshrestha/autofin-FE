import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Lightbulb, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getCurrentMonthRange,
	useGenerateInsight,
	useGetLatestInsight,
} from "@/hooks/insights";

export const Route = createFileRoute("/_authenticated/insights/")({
	component: InsightsPage,
});

function InsightsPage() {
	const { data, isLoading, isError, refetch } = useGetLatestInsight();
	const generateMutation = useGenerateInsight();

	const handleGenerate = () => {
		const { startDate, endDate } = getCurrentMonthRange();
		generateMutation.mutate(
			{
				params: {
					query: { startDate, endDate },
				},
			},
			{
				onSuccess: () => {
					toast.success("Insight generated successfully");
				},
				onError: (err) => {
					const errObj =
						err && typeof err === "object"
							? (err as { error?: string; message?: string })
							: null;
					const msg =
						errObj?.message ??
						errObj?.error ??
						(err instanceof Error ? err.message : "");
					const isNoTransactions =
						msg.toLowerCase().includes("no transactions") ||
						msg.toLowerCase().includes("transactions in period");
					if (isNoTransactions) {
						toast.error("No transactions found for this month", {
							description: "Add some transactions first, then try again.",
						});
					} else {
						toast.error("Failed to generate insight", {
							description: msg || "Please try again.",
						});
					}
				},
			},
		);
	};

	if (isLoading) {
		return (
			<div className="max-w-3xl mx-auto space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Insights</h1>
						<p className="text-muted-foreground">
							AI-powered financial advice based on your transactions
						</p>
					</div>
					<Button variant="outline" size="sm" disabled>
						<Sparkles className="h-4 w-4" />
						Generate for this month
					</Button>
				</div>
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-4 w-48" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError && !data) {
		return (
			<div className="max-w-3xl mx-auto space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Insights</h1>
					<p className="text-muted-foreground">
						AI-powered financial advice based on your transactions
					</p>
				</div>
				<Card className="flex flex-col items-center justify-center py-16">
					<div className="flex flex-col items-center gap-4 text-center">
						<div className="rounded-full bg-primary/10 p-4">
							<Lightbulb className="h-10 w-10 text-primary" />
						</div>
						<div className="space-y-2">
							<h2 className="text-lg font-semibold">Something went wrong</h2>
							<p className="max-w-sm text-sm text-muted-foreground">
								{"We couldn't load your insights. Please try again."}
							</p>
						</div>
						<div className="flex gap-2">
							<Button variant="outline" onClick={() => refetch()}>
								Retry
							</Button>
							<Button
								onClick={handleGenerate}
								disabled={generateMutation.isPending}
							>
								{generateMutation.isPending ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Generating...
									</>
								) : (
									<>
										<Sparkles className="h-4 w-4" />
										Generate insight for this month
									</>
								)}
							</Button>
						</div>
					</div>
				</Card>
			</div>
		);
	}

	const insight = data?.insights[0];
	if (!insight) {
		return null;
	}

	const periodStart = new Date(insight.periodStart);
	const periodEnd = new Date(insight.periodEnd);
	const periodLabel = `${format(periodStart, "MMM d, yyyy")} – ${format(periodEnd, "MMM d, yyyy")}`;

	return (
		<div className="max-w-3xl mx-auto space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Insights</h1>
					<p className="text-muted-foreground">
						AI-powered financial advice based on your transactions
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={handleGenerate}
					disabled={generateMutation.isPending}
				>
					{generateMutation.isPending ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Generating...
						</>
					) : (
						<>
							<Sparkles className="h-4 w-4" />
							Generate for this month
						</>
					)}
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Latest insight</CardTitle>
					<CardDescription>{periodLabel}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="prose prose-sm dark:prose-invert max-w-none [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:leading-relaxed [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground">
						<ReactMarkdown>{insight.content}</ReactMarkdown>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
