import { Cell, Pie, PieChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

export type CategoryPieDataPoint = {
	name: string;
	value: number;
	icon?: string | null;
	fill: string;
};

type CategoryPieChartProps = {
	data: CategoryPieDataPoint[];
};

export function CategoryPieChart({ data }: CategoryPieChartProps) {
	return (
		<Card className="hover:shadow-md transition-shadow min-w-0 overflow-hidden">
			<CardHeader>
				<CardTitle>Spending by Category</CardTitle>
			</CardHeader>
			<CardContent>
				{data.length > 0 ? (
					<div className="flex flex-col md:flex-row items-center gap-4">
						<ChartContainer
							config={{}}
							className="h-[250px] w-full max-w-[250px] aspect-square mx-auto"
						>
							<PieChart>
								<ChartTooltip
									content={<ChartTooltipContent nameKey="name" hideLabel />}
								/>
								<Pie
									data={data}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									innerRadius={50}
									outerRadius={90}
								>
									{data.map((entry, index) => (
										<Cell
											key={`cell-${
												// biome-ignore lint/suspicious/noArrayIndexKey: stable list from data
												index
											}`}
											fill={entry.fill}
										/>
									))}
								</Pie>
							</PieChart>
						</ChartContainer>
						<div className="flex flex-wrap gap-2 justify-center">
							{data.map((item) => (
								<Badge
									key={item.name}
									variant="secondary"
									className="flex items-center gap-1.5"
								>
									<span
										className="w-2 h-2 rounded-full"
										style={{ backgroundColor: item.fill }}
									/>
									{item.name}
								</Badge>
							))}
						</div>
					</div>
				) : (
					<div className="h-[250px] flex items-center justify-center text-muted-foreground">
						No category data available
					</div>
				)}
			</CardContent>
		</Card>
	);
}
