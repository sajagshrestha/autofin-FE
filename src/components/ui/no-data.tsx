import type * as React from "react";
import { cn } from "@/lib/utils";

interface NoDataProps {
	title: string;
	description?: string;
	isSearchResults?: boolean;
	className?: string;
	children?: React.ReactNode;
}

export function NoData({
	title,
	description,
	isSearchResults,
	className,
	children,
}: NoDataProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center py-12 px-4",
				className,
			)}
		>
			<div className="text-center space-y-2">
				<h3 className="text-lg font-semibold">{title}</h3>
				{description && (
					<p className="text-sm text-muted-foreground">{description}</p>
				)}
				{isSearchResults && (
					<p className="text-sm text-muted-foreground">
						Try adjusting your search terms or filters.
					</p>
				)}
			</div>
			{children && <div className="mt-4">{children}</div>}
		</div>
	);
}
