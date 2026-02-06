import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrencyShort } from "@/lib/formatCurrency";

export type CategoryBarDataPoint = {
	name: string;
	value: number;
	icon?: string | null;
	fill: string;
};

const barChartConfig: ChartConfig = {
	amount: {
		label: "Amount",
		color: "hsl(221, 83%, 53%)",
	},
};

type CategoryBarChartProps = {
	data: CategoryBarDataPoint[];
};

export function CategoryBarChart({ data }: CategoryBarChartProps) {
	return (
		<Card className="hover:shadow-md transition-shadow min-w-0 overflow-hidden">
			<CardHeader>
				<CardTitle>Spending by Category (Bar)</CardTitle>
			</CardHeader>
			<CardContent>
				{data.length > 0 ? (
					<ChartContainer config={barChartConfig} className="h-[300px] w-full">
						<BarChart
							data={data}
							accessibilityLayer
							layout="vertical"
							margin={{ left: 0 }}
						>
							<CartesianGrid strokeDasharray="3 3" horizontal={false} />
							<XAxis
								type="number"
								tickLine={false}
								axisLine={false}
								tickFormatter={(value) => formatCurrencyShort(value)}
							/>
							<YAxis
								type="category"
								dataKey="name"
								tickLine={false}
								axisLine={false}
								width={80}
							/>
							<ChartTooltip content={<ChartTooltipContent />} />
							<Bar
								dataKey="value"
								fill="var(--chart-2)"
								radius={[0, 4, 4, 0]}
							/>
						</BarChart>
					</ChartContainer>
				) : (
					<div className="h-[300px] flex items-center justify-center text-muted-foreground">
						No category data available
					</div>
				)}
			</CardContent>
		</Card>
	);
}
