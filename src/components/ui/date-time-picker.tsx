import { format } from "date-fns";
import { CalendarIcon, Clock3 } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DateTimePickerProps {
	value?: Date;
	onChange: (date: Date | undefined) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
}

function isValidDate(value: Date | undefined): value is Date {
	return !!value && Number.isFinite(value.getTime());
}

function toTimeString(date: Date): string {
	return format(date, "HH:mm");
}

function mergeDateAndTime(date: Date, timeValue: string): Date {
	const [hoursRaw, minutesRaw] = timeValue.split(":");
	const hours = Number.parseInt(hoursRaw ?? "0", 10);
	const minutes = Number.parseInt(minutesRaw ?? "0", 10);
	const next = new Date(date);
	next.setHours(
		Number.isFinite(hours) ? hours : 0,
		Number.isFinite(minutes) ? minutes : 0,
		0,
		0,
	);
	return next;
}

export function DateTimePicker({
	value,
	onChange,
	placeholder = "Pick a date and time",
	disabled,
	className,
}: DateTimePickerProps) {
	const safeValue = isValidDate(value) ? value : undefined;
	const safeValueMs = safeValue?.getTime();
	const timeInputId = useId();
	const [timeValue, setTimeValue] = useState(() =>
		safeValue ? toTimeString(safeValue) : toTimeString(new Date()),
	);

	useEffect(() => {
		if (safeValueMs != null) {
			setTimeValue(toTimeString(new Date(safeValueMs)));
		}
	}, [safeValueMs]);

	const label = useMemo(
		() => (safeValue ? format(safeValue, "PPP p") : placeholder),
		[safeValue, placeholder],
	);

	const handleDateSelect = (selectedDate?: Date) => {
		if (!isValidDate(selectedDate)) {
			onChange(undefined);
			return;
		}
		onChange(mergeDateAndTime(selectedDate, timeValue));
	};

	const handleTimeChange = (nextTimeValue: string) => {
		setTimeValue(nextTimeValue);
		if (!safeValue) return;
		onChange(mergeDateAndTime(safeValue, nextTimeValue));
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					disabled={disabled}
					className={cn(
						"w-full justify-start text-left font-normal",
						!safeValue && "text-muted-foreground",
						className,
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
					<span className="truncate">{label}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<div className="p-3">
					<Calendar
						mode="single"
						selected={safeValue}
						onSelect={handleDateSelect}
						initialFocus
					/>
					<div className="mt-2 border-t pt-2">
						<label
							htmlFor={timeInputId}
							className="mb-1 flex items-center gap-2 text-sm text-muted-foreground"
						>
							<Clock3 className="h-4 w-4" />
							Time
						</label>
						<Input
							id={timeInputId}
							type="time"
							value={timeValue}
							onChange={(event) => handleTimeChange(event.target.value)}
							className="h-8 w-full"
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
