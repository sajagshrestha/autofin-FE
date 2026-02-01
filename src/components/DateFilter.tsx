import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	DATE_VIEW_LABELS,
	type DateFilterSearchParams,
	type DateView,
	getDefaultPeriodStart,
	getNextPeriodStart,
	getPeriodLabel,
	getPreviousPeriodStart,
} from "@/lib/date-filter";
import { cn } from "@/lib/utils";

interface DateFilterProps {
	value: DateFilterSearchParams;
	onChange: (value: DateFilterSearchParams) => void;
	className?: string;
}

export function DateFilter({ value, onChange, className }: DateFilterProps) {
	const view = value.view ?? "monthly";
	const periodStart = value.periodStart ?? getDefaultPeriodStart(view);
	const label = getPeriodLabel(view, periodStart);

	const handleViewChange = (newView: string) => {
		onChange({
			view: newView as DateView,
			periodStart: getDefaultPeriodStart(newView as DateView),
		});
	};

	const goPrevious = () => {
		onChange({
			view,
			periodStart: getPreviousPeriodStart(view, periodStart),
		});
	};

	const goNext = () => {
		onChange({
			view,
			periodStart: getNextPeriodStart(view, periodStart),
		});
	};

	const isAllTime = view === "all_time";

	return (
		<div
			className={cn(
				"flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4",
				className,
			)}
		>
			<Tabs
				value={view}
				onValueChange={handleViewChange}
				className="w-full sm:w-auto"
			>
				<TabsList className="grid w-full grid-cols-6 sm:inline-flex sm:w-auto">
					{(Object.keys(DATE_VIEW_LABELS) as DateView[]).map((v) => (
						<TabsTrigger key={v} value={v} className="text-xs sm:text-sm">
							{DATE_VIEW_LABELS[v]}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="icon"
					className={cn(
						"h-9 w-9 shrink-0",
						isAllTime && "invisible pointer-events-none",
					)}
					onClick={goPrevious}
					aria-label="Previous period"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<span
					className="w-[200px] shrink-0 truncate px-2 text-center text-sm font-medium tabular-nums"
					title={label}
				>
					{label}
				</span>
				<Button
					variant="outline"
					size="icon"
					className={cn(
						"h-9 w-9 shrink-0",
						isAllTime && "invisible pointer-events-none",
					)}
					onClick={goNext}
					aria-label="Next period"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
