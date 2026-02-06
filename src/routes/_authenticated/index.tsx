import { createFileRoute } from "@tanstack/react-router";
import { eachMonthOfInterval, format } from "date-fns";
import { ArrowDownRight, ArrowUpRight, CreditCard } from "lucide-react";
import { useMemo } from "react";
import {
	BankBarChart,
	CategoryBarChart,
	CategoryPieChart,
	MonthlyTrendsChart,
	SpendingLineChart,
} from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllTransactions } from "@/hooks/transactions/queries";
export const Route = createFileRoute("/_authenticated/")({
	component: AnalyticsDashboard,
});

// Chart colors
const CHART_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
	"hsl(221, 83%, 53%)",
	"hsl(142, 71%, 45%)",
	"hsl(38, 92%, 50%)",
	"hsl(0, 84%, 60%)",
	"hsl(280, 65%, 60%)",
];

function AnalyticsDashboard() {
	const { data: transactionsData, isLoading } = useGetAllTransactions({});

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

	// Spending data grouped by month
	const spendingData = useMemo(() => {
		if (!transactions.length) return [];

		const dates = transactions
			.map((t) => (t.transactionDate ? new Date(t.transactionDate) : null))
			.filter((d): d is Date => d !== null);

		if (!dates.length) return [];

		const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
		const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

		const months = eachMonthOfInterval({ start: minDate, end: maxDate });
		const monthKeyToSpending = new Map<string, number>();
		for (const m of months) {
			monthKeyToSpending.set(format(m, "yyyy-MM"), 0);
		}
		transactions.forEach((t) => {
			if (t.type === "credit") return;
			const date = t.transactionDate ? new Date(t.transactionDate) : new Date();
			const key = format(date, "yyyy-MM");
			if (!monthKeyToSpending.has(key)) return;
			const amount = parseFloat(t.amount || "0");
			monthKeyToSpending.set(key, (monthKeyToSpending.get(key) ?? 0) + amount);
		});
		return months.map((m, index) => ({
			day: index + 1,
			label: format(m, "MMM yyyy"),
			spending: monthKeyToSpending.get(format(m, "yyyy-MM")) ?? 0,
		}));
	}, [transactions]);

	// Bank breakdown for bar chart
	const bankData = useMemo(() => {
		if (!transactions.length) return [];

		const bankMap = new Map<string, number>();

		transactions.forEach((t) => {
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

	const formatCurrency = (value: number) => {
		return `Rs. ${value}`;
	};

	return (
		<div className="flex-1 p-4 md:p-8 space-y-8">
			<div className="space-y-8">
				{/* Header - always visible */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
						<p className="text-muted-foreground mt-1">
							Overview of your spending patterns and transactions.
						</p>
					</div>
				</div>

				{isLoading ? (
					<>
						{/* Summary cards skeleton */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{Array.from({ length: 3 }).map((_, i) => (
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
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
							periodLabel="All Transactions"
							granularity="month"
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
