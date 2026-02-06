import { createFileRoute } from "@tanstack/react-router";
import {
	eachDayOfInterval,
	eachMonthOfInterval,
	eachWeekOfInterval,
	format,
	startOfWeek,
} from "date-fns";
import {
	ArrowDownRight,
	ArrowUpRight,
	CreditCard,
	PiggyBank,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { z } from "zod";
import {
	BankBarChart,
	CategoryBarChart,
	CategoryPieChart,
	MonthlyTrendsChart,
	SpendingLineChart,
} from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DateFilter,
	type DatePeriod,
	type DateRange,
	getDateRangeForPeriod,
} from "@/components/ui/date-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllTransactions } from "@/hooks/transactions/queries";
import { formatCurrency } from "@/lib/formatCurrency";

const defaultRange = getDateRangeForPeriod("monthly");

const searchParamsSchema = z.object({
	period: z
		.enum(["daily", "weekly", "monthly", "yearly", "all"])
		.optional()
		.default("monthly"),
	startDate: z
		.string()
		.optional()
		.default(defaultRange.startDate ?? ""),
	endDate: z
		.string()
		.optional()
		.default(defaultRange.endDate ?? ""),
});

export const Route = createFileRoute("/_authenticated/")({
	validateSearch: searchParamsSchema,
	component: AnalyticsDashboard,
});

// Chart colors – diverse hues for clear distinction
const CHART_COLORS = [
	"hsl(221, 78%, 52%)", // blue
	"hsl(142, 65%, 45%)", // green
	"hsl(38, 92%, 50%)", // amber
	"hsl(0, 72%, 55%)", // red
	"hsl(280, 62%, 55%)", // violet
	"hsl(185, 70%, 42%)", // teal
	"hsl(25, 85%, 55%)", // orange
	"hsl(320, 65%, 55%)", // pink
	"hsl(85, 55%, 45%)", // lime
	"hsl(250, 60%, 55%)", // indigo
];

function AnalyticsDashboard() {
	const { period, startDate, endDate } = Route.useSearch();
	const navigate = Route.useNavigate();

	const { data: transactionsData, isLoading } = useGetAllTransactions({
		startDate,
		endDate,
	});

	const handlePeriodChange = useCallback(
		(newPeriod: DatePeriod) => {
			const range = getDateRangeForPeriod(newPeriod);
			navigate({
				search: {
					period: newPeriod,
					startDate: range.startDate,
					endDate: range.endDate,
				},
			});
		},
		[navigate],
	);

	const handleDateRangeChange = useCallback(
		(range: DateRange) => {
			navigate({
				search: (prev) => ({
					...prev,
					startDate: range.startDate,
					endDate: range.endDate,
				}),
			});
		},
		[navigate],
	);

	const transactions = useMemo(
		() => transactionsData?.transactions || [],
		[transactionsData],
	);

	// Calculate summary stats
	const stats = useMemo(() => {
		if (!transactions.length) {
			return {
				totalExpenses: 0,
				totalIncome: 0,
				savings: 0,
				transactionCount: 0,
			};
		}

		let totalExpenses = 0;
		let totalIncome = 0;

		transactions.forEach((t) => {
			const amount = parseFloat(t.amount || "0");
			if (t.type === "credit") {
				totalIncome += amount;
			} else {
				totalExpenses += amount;
			}
		});

		return {
			totalExpenses,
			totalIncome,
			savings: totalIncome - totalExpenses,
			transactionCount: transactions.length,
		};
	}, [transactions]);

	// Monthly spending data for area chart
	const monthlyData = useMemo(() => {
		if (!transactions.length) return [];

		const monthMap = new Map<string, { expenses: number; income: number }>();

		transactions.forEach((t) => {
			const date = t.transactionDate ? new Date(t.transactionDate) : new Date();
			const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

			const existing = monthMap.get(monthKey) || { expenses: 0, income: 0 };
			const amount = parseFloat(t.amount || "0");

			if (t.type === "credit") {
				existing.income += amount;
			} else {
				existing.expenses += amount;
			}

			monthMap.set(monthKey, existing);
		});

		return Array.from(monthMap.entries())
			.sort((a, b) => a[0].localeCompare(b[0]))
			.slice(-6)
			.map(([month, data]) => ({
				month: new Date(month + "-01").toLocaleDateString("en-US", {
					month: "short",
				}),
				expenses: data.expenses,
				income: data.income,
			}));
	}, [transactions]);

	const categoryData = useMemo(() => {
		if (!transactions.length) return [];

		const categoryMap = new Map<
			string,
			{ amount: number; icon?: string | null }
		>();

		transactions.forEach((t) => {
			if (t.type === "credit") return;
			const categoryName = t.category?.name || "Uncategorized";
			const categoryIcon = t.category?.icon || null;
			const amount = parseFloat(t.amount || "0");
			const existing = categoryMap.get(categoryName) || {
				amount: 0,
				icon: categoryIcon,
			};
			categoryMap.set(categoryName, {
				amount: existing.amount + amount,
				icon: categoryIcon,
			});
		});

		return Array.from(categoryMap.entries())
			.sort((a, b) => b[1].amount - a[1].amount)
			.slice(0, 6)
			.map(([name, data], index) => ({
				name,
				value: data.amount,
				icon: data.icon,
				fill: CHART_COLORS[index % CHART_COLORS.length],
			}));
	}, [transactions]);

	// Spending data for line chart: buckets based on date filter (period + start/end)
	const spendingData = useMemo(() => {
		const rangeStart =
			startDate && startDate !== "" ? new Date(startDate) : null;
		const rangeEnd = endDate && endDate !== "" ? new Date(endDate) : null;
		const hasRange =
			rangeStart &&
			rangeEnd &&
			period !== "all" &&
			Number.isFinite(rangeStart.getTime()) &&
			Number.isFinite(rangeEnd.getTime());

		let buckets: { key: string; date: Date; label: string }[] = [];

		if (hasRange && rangeStart && rangeEnd) {
			const interval = { start: rangeStart, end: rangeEnd };
			switch (period) {
				case "daily":
					buckets = eachDayOfInterval(interval).map((d) => ({
						key: format(d, "yyyy-MM-dd"),
						date: d,
						label: format(d, "MMM d"),
					}));
					break;
				case "weekly":
					buckets = eachWeekOfInterval(interval, {
						weekStartsOn: 1,
					}).map((d) => ({
						key: format(d, "yyyy-'W'ww"),
						date: d,
						label: format(d, "MMM d"),
					}));
					break;
				case "monthly":
					buckets = eachDayOfInterval(interval).map((d) => ({
						key: format(d, "yyyy-MM-dd"),
						date: d,
						label: format(d, "MMM d"),
					}));
					break;
				case "yearly":
					buckets = eachMonthOfInterval(interval).map((m) => ({
						key: format(m, "yyyy-MM"),
						date: m,
						label: format(m, "MMM"),
					}));
					break;
				default:
					buckets = eachMonthOfInterval(interval).map((m) => ({
						key: format(m, "yyyy-MM"),
						date: m,
						label: format(m, "MMM yyyy"),
					}));
			}
		} else {
			// All time: derive range from transaction dates
			if (!transactions.length) return [];
			const dates = transactions
				.map((t) => (t.transactionDate ? new Date(t.transactionDate) : null))
				.filter((d): d is Date => d !== null);
			if (!dates.length) return [];
			const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
			const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
			const months = eachMonthOfInterval({ start: minDate, end: maxDate });
			buckets = months.map((m) => ({
				key: format(m, "yyyy-MM"),
				date: m,
				label: format(m, "MMM yyyy"),
			}));
		}

		const keyToSpending = new Map<string, number>();
		for (const b of buckets) {
			keyToSpending.set(b.key, 0);
		}
		transactions.forEach((t) => {
			if (t.type === "credit") return;
			const date = t.transactionDate ? new Date(t.transactionDate) : new Date();
			let key: string;
			if (period === "daily" || period === "monthly")
				key = format(date, "yyyy-MM-dd");
			else if (period === "weekly")
				key = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-'W'ww");
			else key = format(date, "yyyy-MM");
			if (!keyToSpending.has(key)) return;
			const amount = parseFloat(t.amount || "0");
			keyToSpending.set(key, (keyToSpending.get(key) ?? 0) + amount);
		});
		return buckets.map((b, index) => ({
			day: index + 1,
			label: b.label,
			spending: keyToSpending.get(b.key) ?? 0,
		}));
	}, [transactions, period, startDate, endDate]);

	// Chart subtitle and granularity from date filter
	const { chartPeriodLabel, chartGranularity } = useMemo(() => {
		if (period === "all" || !startDate || !endDate) {
			return {
				chartPeriodLabel: "All time",
				chartGranularity: "month" as const,
			};
		}
		const start = new Date(startDate);
		const end = new Date(endDate);
		const formatRange = () => {
			if (period === "daily") return format(start, "MMM d, yyyy");
			if (period === "monthly") return format(start, "MMMM yyyy");
			if (period === "yearly") return format(start, "yyyy");
			return format(start, "MMM d") + " - " + format(end, "MMM d, yyyy");
		};
		const label = formatRange();
		const granularity =
			period === "daily" || period === "monthly"
				? ("day" as const)
				: ("month" as const);
		return { chartPeriodLabel: label, chartGranularity: granularity };
	}, [period, startDate, endDate]);

	// Bank breakdown for bar chart
	const bankData = useMemo(() => {
		if (!transactions.length) return [];

		const bankMap = new Map<string, number>();

		transactions.forEach((t) => {
			if (t.type === "credit") return;
			const bankName = t.bankName || "Unknown Bank";
			const amount = parseFloat(t.amount || "0");
			const existing = bankMap.get(bankName) || 0;
			bankMap.set(bankName, existing + amount);
		});

		return Array.from(bankMap.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([name, amount]) => ({
				name: name.length > 12 ? name.slice(0, 12) + "..." : name,
				amount,
			}));
	}, [transactions]);

	return (
		<div className="flex-1 p-4 md:p-8 space-y-8 min-w-0 overflow-hidden">
			<div className="space-y-8 min-w-0">
				{/* Header - always visible */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
						<p className="text-muted-foreground mt-1">
							Overview of your spending patterns and transactions.
						</p>
					</div>
					<DateFilter
						period={period}
						startDate={startDate}
						endDate={endDate}
						onPeriodChange={handlePeriodChange}
						onDateRangeChange={handleDateRangeChange}
					/>
				</div>

				{isLoading ? (
					<>
						{/* Summary cards skeleton */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<Card key={i} className="hover:shadow-md transition-shadow">
									<CardHeader className="flex flex-row items-center justify-between pb-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-4 w-4 rounded" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-8 w-28 mb-2" />
										<Skeleton className="h-3 w-20" />
									</CardContent>
								</Card>
							))}
						</div>

						{/* Daily spending chart skeleton */}
						<Card>
							<CardHeader>
								<Skeleton className="h-6 w-56" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-[300px] w-full" />
							</CardContent>
						</Card>

						{/* Charts row skeleton */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<Skeleton className="h-6 w-40" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-[300px] w-full" />
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<Skeleton className="h-6 w-44" />
								</CardHeader>
								<CardContent>
									<div className="flex flex-col md:flex-row items-center gap-4">
										<Skeleton className="h-[250px] w-[250px] rounded-full shrink-0" />
										<div className="flex flex-wrap gap-2">
											{Array.from({ length: 4 }).map((_, i) => (
												<Skeleton key={i} className="h-6 w-16" />
											))}
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Bottom charts row skeleton */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<Skeleton className="h-6 w-52" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-[300px] w-full" />
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<Skeleton className="h-6 w-36" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-[300px] w-full" />
								</CardContent>
							</Card>
						</div>
					</>
				) : (
					<>
						{/* Summary Cards */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							<Card className="hover:shadow-md transition-shadow">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium text-muted-foreground">
										Total Expenses
									</CardTitle>
									<ArrowDownRight className="h-4 w-4 text-red-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{formatCurrency(stats.totalExpenses)}
									</div>
									<p className="text-xs text-muted-foreground">
										All time expenses
									</p>
								</CardContent>
							</Card>

							<Card className="hover:shadow-md transition-shadow">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium text-muted-foreground">
										Total Income
									</CardTitle>
									<ArrowUpRight className="h-4 w-4 text-green-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{formatCurrency(stats.totalIncome)}
									</div>
									<p className="text-xs text-muted-foreground">
										All time income
									</p>
								</CardContent>
							</Card>

							<Card className="hover:shadow-md transition-shadow">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium text-muted-foreground">
										Savings
									</CardTitle>
									<PiggyBank
										className={`h-4 w-4 ${stats.savings >= 0 ? "text-emerald-500" : "text-red-500"}`}
									/>
								</CardHeader>
								<CardContent>
									<div
										className={`text-2xl font-bold ${stats.savings >= 0 ? "text-emerald-600" : "text-red-600"}`}
									>
										{formatCurrency(stats.savings)}
									</div>
									<p className="text-xs text-muted-foreground">
										{stats.savings >= 0 ? "Net positive" : "Net negative"}
									</p>
								</CardContent>
							</Card>

							<Card className="hover:shadow-md transition-shadow">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium text-muted-foreground">
										Transactions
									</CardTitle>
									<CreditCard className="h-4 w-4 text-blue-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{stats.transactionCount}
									</div>
									<p className="text-xs text-muted-foreground">Total tracked</p>
								</CardContent>
							</Card>
						</div>

						{/* Daily spending line chart - full width */}
						<SpendingLineChart
							data={spendingData}
							periodLabel={chartPeriodLabel}
							granularity={chartGranularity}
						/>

						{/* Charts Row */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<CategoryBarChart data={categoryData} />
							<CategoryPieChart data={categoryData} />
						</div>

						{/* Bottom Charts Row */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<MonthlyTrendsChart data={monthlyData} />
							<BankBarChart data={bankData} />
						</div>
					</>
				)}
			</div>
		</div>
	);
}
