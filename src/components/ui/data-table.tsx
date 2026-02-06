import {
	type ColumnDef,
	type ColumnPinningState,
	type ExpandedState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type OnChangeFn,
	type PaginationOptions,
	type PaginationState,
	type Row,
	type SortingState,
	type TableOptions,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronUp } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Card } from "./card";
import { NoData } from "./no-data";
import { Search } from "./search";
import { Skeleton } from "./skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./table";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	title?: string;
	tabNavs?: React.ReactNode;
	isLoading?: boolean;
	enableSelect?: boolean;
	pagination?: {
		state: PaginationState;
		options: {
			onPaginationChange: PaginationOptions["onPaginationChange"];
			rowCount: PaginationOptions["rowCount"];
		};
	};
	sorting?: {
		state: SortingState;
		onSortingChange: OnChangeFn<SortingState>;
	};
	columnPinning?: {
		state: ColumnPinningState;
	};
	expanding?: {
		state: ExpandedState;
		onExpandedChange: OnChangeFn<ExpandedState>;
		getSubRows?: (originalRow: TData, index: number) => TData[] | undefined;
		getRowCanExpand?: (row: Row<TData>) => boolean;
		renderExpandedContent?: (row: Row<TData>) => React.ReactNode;
		enableExpandAll?: boolean;
		manualExpanding?: boolean;
		paginateExpandedRows?: boolean;
		filterFromLeafRows?: boolean;
		maxLeafRowFilterDepth?: number;
	};
	search?: {
		value: string;
		onChange: (value: string) => void;
	};
	noData?: {
		title: string;
		description: string;
		actionButtons?: React.ReactNode;
	};
	headerButtons?: React.ReactNode;
	headerClassName?: string;
	onRowClick?: (row: Row<TData>) => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	title,
	tabNavs,
	isLoading,
	pagination,
	search,
	noData,
	sorting,
	columnPinning,
	expanding,
	enableSelect,
	headerButtons,
	headerClassName,
	onRowClick,
}: DataTableProps<TData, TValue>) {
	const tableConfig: TableOptions<TData> = {
		data,
		columns,
		state: {
			...(pagination && { pagination: pagination.state }),
			...(sorting && { sorting: sorting.state }),
			...(columnPinning && { columnPinning: columnPinning.state }),
			...(expanding && { expanded: expanding.state }),
			...(search && { globalFilter: search.value }),
		},
		manualPagination: !!pagination,
		manualSorting: !!sorting,
		manualExpanding: expanding?.manualExpanding || false,
		enableColumnPinning: !!columnPinning,
		// Pagination options
		...(pagination && {
			...pagination.options,
		}),
		// Sorting options
		...(sorting && {
			onSortingChange: sorting.onSortingChange,
		}),
		// Filtering options
		...(search && {
			onGlobalFilterChange: search.onChange,
		}),
		enableMultiRowSelection: enableSelect,
		enableSortingRemoval: true,
		defaultColumn: {
			sortDescFirst: false,
		},
		// Expanding options
		onExpandedChange: expanding?.onExpandedChange || undefined,
		// Explicitly add expanding functions
		getSubRows: expanding?.getSubRows || undefined,
		getRowCanExpand: expanding?.getRowCanExpand || undefined,
		// Other expanding options
		paginateExpandedRows:
			expanding?.paginateExpandedRows !== undefined
				? expanding.paginateExpandedRows
				: true,
		filterFromLeafRows: expanding?.filterFromLeafRows || false,
		maxLeafRowFilterDepth: expanding?.maxLeafRowFilterDepth || 0,
		// Models
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	};

	const table = useReactTable(tableConfig);

	const renderLoading = () => {
		return new Array(pagination?.state.pageSize || 10)
			.fill(null)
			.map((_, index) => (
				<TableRow key={index}>
					{columns.map((_, colIndex) => (
						<TableCell className="h-10 text-center" key={colIndex}>
							<Skeleton className="h-8 w-full rounded-lg" />
						</TableCell>
					))}
				</TableRow>
			));
	};

	const renderNoResults = () => {
		return (
			<TableRow>
				<TableCell colSpan={columns.length} className="text-center">
					<NoData
						title={noData?.title || "No data found"}
						description={noData?.description || ""}
						isSearchResults={!!search?.value}
						className="min-h-[50vh]"
					>
						{noData?.actionButtons && noData.actionButtons}
					</NoData>
				</TableCell>
			</TableRow>
		);
	};

	const renderRows = () => {
		const rows = table.getRowModel().rows;

		return rows.map((row) => {
			const isChildRow = row.depth > 0;
			const isExpanded = row.getIsExpanded();

			return (
				<React.Fragment key={row.id}>
					<TableRow
						data-state={row.getIsSelected() && "selected"}
						className={cn(
							isChildRow && "bg-muted/30",
							isExpanded && "bg-muted/50",
							onRowClick && "cursor-pointer hover:bg-muted/50",
						)}
						onClick={() => onRowClick?.(row)}
						onKeyDown={(e) => {
							if ((e.key === "Enter" || e.key === " ") && onRowClick) {
								e.preventDefault();
								onRowClick(row);
							}
						}}
						role={onRowClick ? "button" : undefined}
						tabIndex={onRowClick ? 0 : undefined}
					>
						{row.getVisibleCells().map((cell) => {
							const isPinned = cell.column.getIsPinned();

							return (
								<TableCell
									key={cell.id}
									className={cn(
										isPinned &&
											"backdrop-blur-xs sticky z-10 bg-background/90 shadow-lg",
										isPinned === "left" && "left-0",
										isPinned === "right" && "right-0",
										isChildRow && isPinned && "bg-muted/80",
										isExpanded &&
											cell.column.getIndex() === 0 &&
											"shadow-[inset_4px_0_0_0_hsl(var(--primary))]",
										isChildRow &&
											cell.column.getIndex() === 0 &&
											"shadow-[inset_4px_0_0_0_hsl(var(--primary))]",
									)}
									style={{
										width: `${cell.column.getSize()}px`,
										...(isPinned === "left" && {
											left: cell.column.getStart("left"),
										}),
										...(isPinned === "right" && {
											right: cell.column.getAfter("right"),
										}),
									}}
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							);
						})}
					</TableRow>
					{/* Render expanded content if the row is expanded and renderExpandedContent is provided */}
					{expanding?.renderExpandedContent && row.getIsExpanded() && (
						<TableRow>
							<TableCell colSpan={row.getAllCells().length} className="p-0">
								{expanding.renderExpandedContent(row)}
							</TableCell>
						</TableRow>
					)}
				</React.Fragment>
			);
		});
	};

	const renderTableBody = () => {
		if (isLoading) {
			return renderLoading();
		}

		if (table.getRowModel().rows?.length) {
			return renderRows();
		}

		return renderNoResults();
	};

	const renderPagination = () => {
		if (!pagination) {
			return null;
		}

		return (
			<div className="flex items-center justify-evenly border-t px-4 py-4 sm:px-6">
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Previous
				</Button>
				<span className="flex-1 text-center text-sm font-semibold text-muted-foreground">
					Page {table.getState().pagination.pageIndex + 1} of{" "}
					{table.getPageCount().toLocaleString()}
				</span>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Next
				</Button>
			</div>
		);
	};

	return (
		<Card className="w-full overflow-hidden rounded-xl border p-0 shadow min-w-0">
			{(title || search || headerButtons || tabNavs) && (
				<div className="flex flex-col px-4 py-4 sm:px-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						{title && <h1 className="text-xl font-semibold">{title}</h1>}
						{tabNavs && <div className="mt-4">{tabNavs}</div>}
						<div
							className={cn(
								"flex items-center gap-2 sm:gap-4 w-full sm:w-auto",
								headerClassName,
							)}
						>
							{search && (
								<Search
									value={search.value}
									onChange={(e) => search.onChange(e.target.value)}
									className="flex-1 sm:flex-none sm:w-[20rem]"
									placeholder="Search..."
								/>
							)}
							{headerButtons && headerButtons}
						</div>
					</div>
				</div>
			)}
			<div className="relative">
				<div className="max-h-[calc(100vh-264px)] min-h-[calc(100vh-264px)] overflow-auto">
					<Table>
						<TableHeader className="sticky top-0 z-20 bg-muted/50">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id} className="bg-muted/50">
									{headerGroup.headers.map((header) => {
										const isPinned = header.column.getIsPinned();

										return (
											<TableHead
												key={header.id}
												className={cn(
													"space-x-2",
													isPinned && "sticky z-6 bg-muted/80 shadow-sm",
													isPinned === "left" && "left-0",
													isPinned === "right" && "right-0",
												)}
												style={{
													width: `${header.getSize()}px`,
													...(isPinned === "left" && {
														left: header.column.getStart("left"),
													}),
													...(isPinned === "right" && {
														right: header.column.getAfter("right"),
													}),
												}}
											>
												{header.isPlaceholder ? null : (
													<div className="flex items-center justify-between">
														<div
															onClick={header.column.getToggleSortingHandler()}
															className={cn(
																"inline-flex items-center gap-2",
																header.column.getCanSort() && "cursor-pointer",
																header.column.getIsSorted() === "desc" &&
																	"[&>svg]:rotate-180",
															)}
														>
															{flexRender(
																header.column.columnDef.header,
																header.getContext(),
															)}
															<ChevronUp
																className={cn(
																	"pointer-events-none size-4 min-w-4 transition-all duration-200 text-muted-foreground",
																	header.column.getIsSorted() === "asc" ||
																		header.column.getIsSorted() === "desc"
																		? "opacity-100"
																		: "opacity-0",
																)}
															/>
														</div>
													</div>
												)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>{renderTableBody()}</TableBody>
					</Table>
				</div>
			</div>
			{renderPagination()}
		</Card>
	);
}
