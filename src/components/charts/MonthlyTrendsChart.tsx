import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

export type MonthlyTrendsDataPoint = {
	month: string;
	expenses: number;
	income: number;
};

const areaChartConfig: ChartConfig = {
	expenses: {
		label: "Expenses",
		color: "hsl(0, 84%, 60%)",
	},
	income: {
		label: "Income",
		color: "hsl(142, 71%, 45%)",
	},
};

type MonthlyTrendsChartProps = {
	data: MonthlyTrendsDataPoint[];
};

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="h-5 w-5" />
					Monthly Trends
				</CardTitle>
			</CardHeader>
			<CardContent>
				{data.length > 0 ? (
					<ChartContainer config={areaChartConfig} className="h-[300px] w-full">
						<AreaChart data={data} accessibilityLayer>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="month"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								tickFormatter={(value) => `Rs. ${value / 1000}k`}
							/>
							<ChartTooltip content={<ChartTooltipContent />} />
							<Area
								type="monotone"
								dataKey="income"
								stroke="hsl(142, 71%, 45%)"
								fill="hsl(142, 71%, 45%)"
								fillOpacity={0.3}
								stackId="1"
							/>
							<Area
								type="monotone"
								dataKey="expenses"
								stroke="hsl(0, 84%, 60%)"
								fill="hsl(0, 84%, 60%)"
								fillOpacity={0.3}
								stackId="2"
							/>
						</AreaChart>
					</ChartContainer>
				) : (
					<div className="h-[300px] flex items-center justify-center text-muted-foreground">
						No transaction data available
					</div>
				)}
			</CardContent>
		</Card>
	);
}
