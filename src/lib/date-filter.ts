import {
	addDays,
	addMonths,
	addWeeks,
	addYears,
	endOfDay,
	endOfMonth,
	endOfWeek,
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
import { z } from "zod";

export const DATE_VIEWS = [
	"daily",
	"weekly",
	"monthly",
	"bi_yearly",
	"yearly",
	"all_time",
] as const;
export type DateView = (typeof DATE_VIEWS)[number];

export const DATE_VIEW_LABELS: Record<DateView, string> = {
	daily: "Daily",
	weekly: "Weekly",
	monthly: "Monthly",
	bi_yearly: "Bi-yearly",
	yearly: "Yearly",
	all_time: "All time",
};

export const dateFilterSearchSchema = z.object({
	view: z
		.enum(["daily", "weekly", "monthly", "bi_yearly", "yearly", "all_time"])
		.default("monthly"),
	periodStart: z.string().optional(), // ISO string (or yyyy-MM-dd for backward compat)
});

export type DateFilterSearchParams = z.infer<typeof dateFilterSearchSchema>;

const toIso = (d: Date) => d.toISOString();

/** Parse periodStart from URL (ISO string or yyyy-MM-dd for backward compat). */
function parsePeriodStart(periodStartStr: string): Date {
	// yyyy-MM-dd only → treat as local noon to avoid UTC date-shift
	if (periodStartStr.length === 10 && !periodStartStr.includes("T")) {
		return new Date(periodStartStr + "T12:00:00");
	}
	return new Date(periodStartStr);
}

/** Start and end of period for a given view and periodStart (ISO or yyyy-MM-dd). */
function getPeriodBounds(
	view: DateView,
	periodStartStr: string,
): { start: Date; end: Date } {
	const start = startOfDay(parsePeriodStart(periodStartStr));

	switch (view) {
		case "daily": {
			const end = endOfDay(start);
			return { start, end };
		}
		case "weekly": {
			const weekStart = startOfWeek(start, { weekStartsOn: 1 }); // Monday
			const end = endOfWeek(weekStart, { weekStartsOn: 1 });
			return { start: weekStart, end };
		}
		case "monthly": {
			const monthStart = startOfMonth(start);
			const end = endOfMonth(monthStart);
			return { start: monthStart, end };
		}
		case "bi_yearly": {
			const monthStart = startOfMonth(start);
			const periodStart =
				monthStart.getMonth() < 6
					? new Date(monthStart.getFullYear(), 0, 1) // Jan 1
					: new Date(monthStart.getFullYear(), 6, 1); // Jul 1
			const end = subDays(addMonths(periodStart, 6), 1);
			return { start: periodStart, end: endOfDay(end) };
		}
		case "yearly": {
			const yearStart = startOfYear(start);
			const end = endOfDay(new Date(yearStart.getFullYear(), 11, 31));
			return { start: yearStart, end };
		}
		case "all_time": {
			const now = new Date();
			const startAll = startOfYear(subYears(now, 10)); // last 10 years for chart range
			return { start: startAll, end: endOfDay(now) };
		}
		default:
			return getPeriodBounds("monthly", periodStartStr);
	}
}

/**
 * Returns period start and end dates from filter params (for building chart data).
 */
export function getPeriodBoundsFromParams(params: DateFilterSearchParams): {
	start: Date;
	end: Date;
} {
	const view = params.view ?? "monthly";
	if (view === "all_time") {
		const now = new Date();
		return {
			start: startOfYear(subYears(now, 10)),
			end: endOfDay(now),
		};
	}
	const periodStart = params.periodStart ?? getDefaultPeriodStart(view);
	return getPeriodBounds(view, periodStart);
}

/** Default period start for a view (current period), as ISO string. */
export function getDefaultPeriodStart(view: DateView): string {
	const now = new Date();
	switch (view) {
		case "daily":
			return toIso(startOfDay(now));
		case "weekly": {
			const weekStart = startOfWeek(now, { weekStartsOn: 1 });
			return toIso(weekStart);
		}
		case "monthly": {
			const monthStart = startOfMonth(now);
			return toIso(monthStart);
		}
		case "bi_yearly": {
			const month = now.getMonth();
			const year = now.getFullYear();
			const periodStart =
				month < 6 ? new Date(year, 0, 1) : new Date(year, 6, 1);
			return toIso(periodStart);
		}
		case "yearly": {
			const yearStart = startOfYear(now);
			return toIso(yearStart);
		}
		case "all_time":
			return toIso(now);
		default:
			return toIso(startOfMonth(now));
	}
}

/**
 * Returns startDate/endDate for API based on URL search params (view + periodStart).
 */
export function getDateRangeForApi(params: DateFilterSearchParams): {
	startDate?: string;
	endDate?: string;
} {
	const view = params.view ?? "monthly";
	if (view === "all_time") return {};
	const periodStart = params.periodStart ?? getDefaultPeriodStart(view);
	const { start, end } = getPeriodBounds(view, periodStart);
	return {
		startDate: toIso(start),
		endDate: toIso(end),
	};
}

/**
 * Human-readable label for the current period (e.g. "Jan 2025", "Dec 30 – Jan 5, 2025").
 */
export function getPeriodLabel(view: DateView, periodStartStr: string): string {
	if (view === "all_time") return "All time";
	const { start, end } = getPeriodBounds(view, periodStartStr);
	switch (view) {
		case "daily":
			return format(start, "EEE, MMM d, yyyy");
		case "weekly":
			return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
		case "monthly":
			return format(start, "MMMM yyyy");
		case "bi_yearly":
			return `${format(start, "MMM yyyy")} – ${format(end, "MMM yyyy")}`;
		case "yearly":
			return format(start, "yyyy");
		default:
			return format(start, "MMMM yyyy");
	}
}

/**
 * Previous period's periodStart (for left arrow), as ISO string.
 */
export function getPreviousPeriodStart(
	view: DateView,
	periodStartStr: string,
): string {
	if (view === "all_time") return periodStartStr;
	const start = parsePeriodStart(periodStartStr);
	switch (view) {
		case "daily":
			return toIso(subDays(start, 1));
		case "weekly":
			return toIso(subWeeks(start, 1));
		case "monthly":
			return toIso(subMonths(start, 1));
		case "bi_yearly":
			return toIso(subMonths(start, 6));
		case "yearly":
			return toIso(subYears(start, 1));
		default:
			return toIso(subMonths(start, 1));
	}
}

/**
 * Next period's periodStart (for right arrow).
 */
export function getNextPeriodStart(
	view: DateView,
	periodStartStr: string,
): string {
	if (view === "all_time") return periodStartStr;
	const start = parsePeriodStart(periodStartStr);
	switch (view) {
		case "daily":
			return toIso(addDays(start, 1));
		case "weekly":
			return toIso(addWeeks(start, 1));
		case "monthly":
			return toIso(addMonths(start, 1));
		case "bi_yearly":
			return toIso(addMonths(start, 6));
		case "yearly":
			return toIso(addYears(start, 1));
		default:
			return toIso(addMonths(start, 1));
	}
}
