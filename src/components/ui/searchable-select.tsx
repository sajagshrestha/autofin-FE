import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SearchableSelectOption = {
	value: string;
	label: string;
	searchLabel?: string;
};

type SearchableSelectProps = {
	options: SearchableSelectOption[];
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	className?: string;
	align?: "start" | "center" | "end";
};

export function SearchableSelect({
	options,
	value,
	onValueChange,
	placeholder = "Select...",
	searchPlaceholder = "Search...",
	emptyMessage = "No results found",
	className,
	align = "start",
}: SearchableSelectProps) {
	const [open, setOpen] = useState(false);

	const selectedOption = options.find((option) => option.value === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					role="combobox"
					aria-expanded={open}
					className={cn("justify-between font-normal", className)}
				>
					<span className="truncate">
						{selectedOption?.label ?? placeholder}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className={cn("p-0", className)} align={align}>
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList>
						<CommandEmpty>{emptyMessage}</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={option.searchLabel ?? option.label}
									onSelect={() => {
										onValueChange(option.value);
										setOpen(false);
									}}
								>
									<span className="truncate">{option.label}</span>
									<Check
										className={cn(
											"ml-auto h-4 w-4",
											value === option.value ? "opacity-100" : "opacity-0",
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
