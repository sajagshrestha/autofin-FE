import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency, formatCurrencyShort } from "@/lib/formatCurrency";

export type SpendingDataPoint = {
	day: number;
	label: string;
	spending: number;
};

const lineChartConfig: ChartConfig = {
	spending: {
		label: "Spending",
		color: "hsl(217, 91%, 60%)",
	},
};

type SpendingLineChartProps = {
	data: SpendingDataPoint[];
	/** Optional subtitle, e.g. period label from the date filter */
	periodLabel?: string;
	/** "month" for All time view; default "day" */
	granularity?: "day" | "month";
};

export function SpendingLineChart({
	data,
	periodLabel,
	granularity = "day",
}: SpendingLineChartProps) {
	const perLabel = granularity === "month" ? "per month" : "per day";
	const subtitle = periodLabel
		? `Spending ${perLabel} · ${periodLabel}`
		: `Spending ${perLabel}`;

	return (
		<Card className="hover:shadow-md transition-shadow min-w-0 overflow-hidden">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="h-5 w-5" />
					Spending
				</CardTitle>
				<p className="text-sm text-muted-foreground">{subtitle}</p>
			</CardHeader>
			<CardContent className="px-4">
				{data.length > 0 ? (
					<ChartContainer config={lineChartConfig} className="h-[300px] w-full">
						<LineChart data={data} accessibilityLayer>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="label"
								tickLine={false}
								axisLine={false}
								tickMargin={10}
								fontSize={12}
								angle={granularity === "day" ? 315 : 0}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								tickFormatter={(value) => formatCurrencyShort(value)}
								width={20}
								fontSize={12}
							/>
							<ChartTooltip
								content={
									<ChartTooltipContent
										formatter={(value) => formatCurrency(Number(value))}
									/>
								}
							/>
							<Line
								type="monotone"
								dataKey="spending"
								stroke="hsl(217, 91%, 60%)"
								strokeWidth={2}
								dot={false}
								activeDot={{ r: 4, fill: "hsl(217, 91%, 60%)" }}
							/>
						</LineChart>
					</ChartContainer>
				) : (
					<div className="h-[300px] flex items-center justify-center text-muted-foreground">
						No spending data for this period
					</div>
				)}
			</CardContent>
		</Card>
	);
}
