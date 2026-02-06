import {
	addDays,
	addMonths,
	addWeeks,
	addYears,
	endOfDay,
	endOfMonth,
	endOfWeek,
	endOfYear,
	format,
	startOfDay,
	startOfMonth,
	startOfWeek,
	startOfYear,
	subDays,
	subMonths,
	subWeeks,
	subYears,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export type DatePeriod = "daily" | "weekly" | "monthly" | "yearly" | "all";

export interface DateRange {
	startDate?: string;
	endDate?: string;
}

interface DateFilterProps {
	period: DatePeriod;
	startDate?: string;
	endDate?: string;
	onPeriodChange: (period: DatePeriod) => void;
	onDateRangeChange: (range: DateRange) => void;
}

const PERIOD_OPTIONS: { value: DatePeriod; label: string }[] = [
	{ value: "daily", label: "Daily" },
	{ value: "weekly", label: "Weekly" },
	{ value: "monthly", label: "Monthly" },
	{ value: "yearly", label: "Yearly" },
	{ value: "all", label: "All Time" },
];

function getDateRangeForPeriod(
	period: DatePeriod,
	referenceDate: Date = new Date(),
): DateRange {
	switch (period) {
		case "daily":
			return {
				startDate: startOfDay(referenceDate).toISOString(),
				endDate: endOfDay(referenceDate).toISOString(),
			};
		case "weekly":
			return {
				startDate: startOfWeek(referenceDate, {
					weekStartsOn: 1,
				}).toISOString(),
				endDate: endOfWeek(referenceDate, { weekStartsOn: 1 }).toISOString(),
			};
		case "monthly":
			return {
				startDate: startOfMonth(referenceDate).toISOString(),
				endDate: endOfMonth(referenceDate).toISOString(),
			};
		case "yearly":
			return {
				startDate: startOfYear(referenceDate).toISOString(),
				endDate: endOfYear(referenceDate).toISOString(),
			};
		case "all":
			return { startDate: undefined, endDate: undefined };
	}
}

function navigateDate(
	period: DatePeriod,
	currentStart: string,
	direction: "prev" | "next",
): Date {
	const date = new Date(currentStart);
	const isNext = direction === "next";

	switch (period) {
		case "daily":
			return isNext ? addDays(date, 1) : subDays(date, 1);
		case "weekly":
			return isNext ? addWeeks(date, 1) : subWeeks(date, 1);
		case "monthly":
			return isNext ? addMonths(date, 1) : subMonths(date, 1);
		case "yearly":
			return isNext ? addYears(date, 1) : subYears(date, 1);
		default:
			return date;
	}
}

function formatDateLabel(
	period: DatePeriod,
	startDate?: string,
	endDate?: string,
): string {
	if (period === "all" || !startDate) return "All Time";

	const start = new Date(startDate);

	switch (period) {
		case "daily":
			return format(start, "MMM d, yyyy");
		case "weekly": {
			const end = endDate
				? new Date(endDate)
				: endOfWeek(start, { weekStartsOn: 1 });
			return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
		}
		case "monthly":
			return format(start, "MMMM yyyy");
		case "yearly":
			return format(start, "yyyy");
		default:
			return "All Time";
	}
}

export function DateFilter({
	period,
	startDate,
	endDate,
	onPeriodChange,
	onDateRangeChange,
}: DateFilterProps) {
	const isAllTime = period === "all";

	const label = useMemo(
		() => formatDateLabel(period, startDate, endDate),
		[period, startDate, endDate],
	);

	const handlePeriodChange = useCallback(
		(newPeriod: string) => {
			const p = newPeriod as DatePeriod;
			onPeriodChange(p);
			const range = getDateRangeForPeriod(p);
			onDateRangeChange(range);
		},
		[onPeriodChange, onDateRangeChange],
	);

	const handleNavigate = useCallback(
		(direction: "prev" | "next") => {
			if (isAllTime || !startDate) return;
			const newRef = navigateDate(period, startDate, direction);
			const range = getDateRangeForPeriod(period, newRef);
			onDateRangeChange(range);
		},
		[isAllTime, startDate, period, onDateRangeChange],
	);

	const isNextDisabled = useMemo(() => {
		if (isAllTime || !endDate) return true;
		return new Date(endDate) >= new Date();
	}, [isAllTime, endDate]);

	return (
		<div className="flex flex-wrap items-center gap-2">
			<Select value={period} onValueChange={handlePeriodChange}>
				<SelectTrigger size="sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent position="popper">
					{PERIOD_OPTIONS.map((opt) => (
						<SelectItem key={opt.value} value={opt.value}>
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{!isAllTime && (
				<div className="flex items-center gap-1">
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => handleNavigate("prev")}
						aria-label="Previous period"
					>
						<ChevronLeft className="size-4" />
					</Button>
					<span className="text-sm font-medium min-w-[140px] text-center tabular-nums">
						{label}
					</span>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => handleNavigate("next")}
						disabled={isNextDisabled}
						aria-label="Next period"
					>
						<ChevronRight className="size-4" />
					</Button>
				</div>
			)}
		</div>
	);
}

export { getDateRangeForPeriod };
