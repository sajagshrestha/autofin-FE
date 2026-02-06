import { Search as SearchIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface SearchProps extends React.ComponentProps<typeof Input> {
	className?: string;
}

export function Search({ className, ...props }: SearchProps) {
	return (
		<div className="relative">
			<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
			<Input className={cn("pl-8", className)} {...props} />
		</div>
	);
}
