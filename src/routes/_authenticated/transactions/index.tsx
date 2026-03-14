import {
	Combobox,
	ComboboxButton,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
} from "@headlessui/react";
import {
	createFileRoute,
	Link,
	Outlet,
	useNavigate,
} from "@tanstack/react-router";
import type {
	ColumnDef,
	OnChangeFn,
	PaginationState,
	SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
	Check,
	ChevronsUpDown,
	Eye,
	MessageSquarePlus,
	MoreVertical,
	Pencil,
	Plus,
	SlidersHorizontal,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { CreateTransactionForm } from "@/components/CreateTransactionForm";
import { CreateTransactionFromSmsForm } from "@/components/CreateTransactionFromSmsForm";
import { EditTransactionForm } from "@/components/EditTransactionForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
	DateFilter,
	type DatePeriod,
	type DateRange,
	getDateRangeForPeriod,
} from "@/components/ui/date-filter";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NoData } from "@/components/ui/no-data";
import { Search } from "@/components/ui/search";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@/hooks";
import { useGetAllCategories } from "@/hooks/categories/queries";
import {
	useCreateTransaction,
	useCreateTransactionFromSms,
	useDeleteTransaction,
	useUpdateTransaction,
} from "@/hooks/transactions/mutations";
import { useGetAllTransactions } from "@/hooks/transactions/queries";
import { formatCurrency } from "@/lib/formatCurrency";

const defaultRange = getDateRangeForPeriod("daily");
const ALL_CATEGORIES_FILTER = "all";
const UNCATEGORIZED_FILTER = "uncategorized";
type CategoryFilterOption = {
	id: string;
	label: string;
	searchLabel: string;
};
const sortOptions = [
	{ value: "none", label: "No sorting" },
	{ value: "transactionDate", label: "Date & time" },
	{ value: "amount", label: "Amount" },
	{ value: "merchant", label: "Merchant" },
	{ value: "category", label: "Category" },
	{ value: "bankName", label: "Bank" },
	{ value: "remarks", label: "Remarks" },
] as const;

const searchParamsSchema = z.object({
	period: z
		.enum(["daily", "weekly", "monthly", "yearly", "all"])
		.optional()
		.default("daily"),
	startDate: z
		.string()
		.optional()
		.default(defaultRange.startDate ?? ""),
	endDate: z
		.string()
		.optional()
		.default(defaultRange.endDate ?? ""),
});

export const Route = createFileRoute("/_authenticated/transactions/")({
	validateSearch: searchParamsSchema,
	component: TransactionsPage,
});

function TransactionsPage() {
	const { period, startDate, endDate } = Route.useSearch();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [categoryFilter, setCategoryFilter] = useState<string>(
		ALL_CATEGORIES_FILTER,
	);
	const [categoryQuery, setCategoryQuery] = useState("");
	const [editingTransaction, setEditingTransaction] =
		useState<Transaction | null>(null);
	const [deletingTransaction, setDeletingTransaction] =
		useState<Transaction | null>(null);
	const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
	const [createOptionsOpen, setCreateOptionsOpen] = useState(false);
	const [manualDialogOpen, setManualDialogOpen] = useState(false);
	const [smsDialogOpen, setSmsDialogOpen] = useState(false);

	const navigate = useNavigate();
	const searchNavigate = Route.useNavigate();
	const { data: transactionsData, isLoading } = useGetAllTransactions({
		startDate,
		endDate,
	});
	const { data: categoriesData } = useGetAllCategories();

	const handlePeriodChange = useCallback(
		(newPeriod: DatePeriod) => {
			const range = getDateRangeForPeriod(newPeriod);
			searchNavigate({
				search: {
					period: newPeriod,
					startDate: range.startDate,
					endDate: range.endDate,
				},
			});
		},
		[searchNavigate],
	);

	const handleDateRangeChange = useCallback(
		(range: DateRange) => {
			searchNavigate({
				search: (prev) => ({
					...prev,
					startDate: range.startDate,
					endDate: range.endDate,
				}),
			});
		},
		[searchNavigate],
	);

	const updateMutation = useUpdateTransaction();
	const deleteMutation = useDeleteTransaction();
	const createMutation = useCreateTransaction();
	const createFromSmsMutation = useCreateTransactionFromSms();

	const transactions = (transactionsData?.transactions as Transaction[]) || [];
	const categories = categoriesData?.categories || [];
	const sortedCategories = useMemo(
		() => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
		[categories],
	);
	const categoryFilterOptions = useMemo<CategoryFilterOption[]>(
		() => [
			{
				id: ALL_CATEGORIES_FILTER,
				label: "All categories",
				searchLabel: "all categories",
			},
			{
				id: UNCATEGORIZED_FILTER,
				label: "Uncategorized",
				searchLabel: "uncategorized",
			},
			...sortedCategories.map((category) => ({
				id: category.id,
				label: `${category.icon ? `${category.icon} ` : ""}${category.name}`,
				searchLabel: `${category.name} ${category.icon ?? ""}`.toLowerCase(),
			})),
		],
		[sortedCategories],
	);
	const visibleCategoryOptions = useMemo(() => {
		const normalizedQuery = categoryQuery.trim().toLowerCase();
		if (!normalizedQuery) return categoryFilterOptions;

		return categoryFilterOptions.filter((option) =>
			option.searchLabel.includes(normalizedQuery),
		);
	}, [categoryFilterOptions, categoryQuery]);
	const selectedCategoryOption = useMemo(
		() =>
			categoryFilterOptions.find((option) => option.id === categoryFilter) ??
			categoryFilterOptions[0],
		[categoryFilter, categoryFilterOptions],
	);
	const filteredTransactions = useMemo(() => {
		if (categoryFilter === ALL_CATEGORIES_FILTER) {
			return transactions;
		}
		if (categoryFilter === UNCATEGORIZED_FILTER) {
			return transactions.filter(
				(transaction) => !transaction.category?.id && !transaction.categoryId,
			);
		}

		return transactions.filter(
			(transaction) =>
				transaction.category?.id === categoryFilter ||
				transaction.categoryId === categoryFilter,
		);
	}, [transactions, categoryFilter]);
	const noDataDescription =
		categoryFilter === ALL_CATEGORIES_FILTER
			? "Get started by adding a transaction or creating one from SMS."
			: "Try a different category filter, or add/create a transaction.";

	const handleCategoryFilterChange = useCallback((value: string | null) => {
		if (!value) return;
		setCategoryFilter(value);
		setCategoryQuery("");
		setPagination((prev) => ({
			...prev,
			pageIndex: 0,
		}));
	}, []);
	const handleSearchChange = useCallback((value: string) => {
		setGlobalFilter(value);
		setPagination((prev) => ({
			...prev,
			pageIndex: 0,
		}));
	}, []);
	const handleSortingChange = useCallback<OnChangeFn<SortingState>>(
		(updater) => {
			setSorting((prev) =>
				typeof updater === "function" ? updater(prev) : updater,
			);
			setPagination((prev) => ({
				...prev,
				pageIndex: 0,
			}));
		},
		[],
	);
	const handleFiltersSheetOpenChange = useCallback((open: boolean) => {
		setFiltersSheetOpen(open);
		if (!open) {
			setCategoryQuery("");
		}
	}, []);
	const clearFilters = useCallback(() => {
		handleCategoryFilterChange(ALL_CATEGORIES_FILTER);
		handleSortingChange([]);
	}, [handleCategoryFilterChange, handleSortingChange]);
	const openCreateManual = useCallback(() => {
		setCreateOptionsOpen(false);
		setManualDialogOpen(true);
	}, []);
	const openCreateFromSms = useCallback(() => {
		setCreateOptionsOpen(false);
		setSmsDialogOpen(true);
	}, []);
	const handleSortOptionChange = useCallback(
		(value: string) => {
			if (value === "none") {
				handleSortingChange([]);
				return;
			}
			handleSortingChange((prev) => {
				const existing = prev[0];
				const defaultDesc = value === "transactionDate" || value === "amount";
				return [
					{
						id: value,
						desc: existing?.id === value ? existing.desc : defaultDesc,
					},
				];
			});
		},
		[handleSortingChange],
	);
	const toggleSortDirection = useCallback(() => {
		handleSortingChange((prev) => {
			if (!prev[0]) {
				return [{ id: "transactionDate", desc: true }];
			}
			return [{ ...prev[0], desc: !prev[0].desc }];
		});
	}, [handleSortingChange]);
	const mobileSearchFilteredTransactions = useMemo(() => {
		const normalizedSearch = globalFilter.trim().toLowerCase();
		if (!normalizedSearch) return filteredTransactions;

		return filteredTransactions.filter((transaction) => {
			const searchText = [
				transaction.merchant ?? "",
				transaction.category?.name ?? "Uncategorized",
				transaction.bankName ?? "",
				transaction.remarks ?? "",
				transaction.amount ?? "",
				transaction.currency ?? "",
				transaction.type ?? "",
				transaction.transactionDate
					? format(new Date(transaction.transactionDate), "PPp")
					: "",
			]
				.join(" ")
				.toLowerCase();

			return searchText.includes(normalizedSearch);
		});
	}, [filteredTransactions, globalFilter]);
	const mobileSortedTransactions = useMemo(() => {
		const sorted = [...mobileSearchFilteredTransactions];
		const sortState = sorting[0];
		if (!sortState) return sorted;

		const getSortableValue = (transaction: Transaction) => {
			switch (sortState.id) {
				case "transactionDate":
					return transaction.transactionDate
						? new Date(transaction.transactionDate).getTime()
						: 0;
				case "amount":
					return Number(transaction.amount ?? "0");
				case "merchant":
					return (transaction.merchant ?? "").toLowerCase();
				case "category":
					return (transaction.category?.name ?? "Uncategorized").toLowerCase();
				case "bankName":
					return (transaction.bankName ?? "").toLowerCase();
				case "remarks":
					return (transaction.remarks ?? "").toLowerCase();
				default:
					return "";
			}
		};

		sorted.sort((a, b) => {
			const left = getSortableValue(a);
			const right = getSortableValue(b);
			if (typeof left === "number" && typeof right === "number") {
				return left - right;
			}
			return String(left).localeCompare(String(right));
		});

		if (sortState.desc) {
			sorted.reverse();
		}

		return sorted;
	}, [mobileSearchFilteredTransactions, sorting]);
	const mobilePageCount = Math.max(
		1,
		Math.ceil(mobileSortedTransactions.length / pagination.pageSize),
	);
	const mobilePageIndex = Math.min(pagination.pageIndex, mobilePageCount - 1);
	useEffect(() => {
		if (pagination.pageIndex !== mobilePageIndex) {
			setPagination((prev) => ({ ...prev, pageIndex: mobilePageIndex }));
		}
	}, [pagination.pageIndex, mobilePageIndex]);
	const mobilePageTransactions = useMemo(() => {
		const start = mobilePageIndex * pagination.pageSize;
		return mobileSortedTransactions.slice(start, start + pagination.pageSize);
	}, [mobilePageIndex, mobileSortedTransactions, pagination.pageSize]);

	const renderCategoryFilterCombobox = (widthClassName: string) => (
		<Combobox
			value={categoryFilter}
			onChange={handleCategoryFilterChange}
			immediate
		>
			<div className={`relative ${widthClassName}`}>
				<ComboboxInput
					className="h-8 w-full rounded-md border border-input bg-background px-3 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					placeholder="Filter by category"
					displayValue={() => selectedCategoryOption?.label ?? ""}
					onChange={(event) => setCategoryQuery(event.target.value)}
				/>
				<ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2 text-muted-foreground">
					<ChevronsUpDown className="h-4 w-4" />
				</ComboboxButton>
				<ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md empty:invisible">
					{visibleCategoryOptions.length === 0 ? (
						<div className="px-2 py-1.5 text-sm text-muted-foreground">
							No categories found
						</div>
					) : (
						visibleCategoryOptions.map((option) => (
							<ComboboxOption
								key={option.id}
								value={option.id}
								className="group flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm data-[focus]:bg-accent data-[focus]:text-accent-foreground"
							>
								<span className="truncate">{option.label}</span>
								<Check className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100" />
							</ComboboxOption>
						))
					)}
				</ComboboxOptions>
			</div>
		</Combobox>
	);
	const renderTransactionActions = (
		transaction: Transaction,
		align: "end" | "start" = "end",
	) => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Open menu</span>
					<MoreVertical className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align={align}>
				<DropdownMenuItem asChild>
					<Link
						to="/transactions/$transactionId"
						params={{ transactionId: transaction.id }}
					>
						<Eye className="mr-2 h-4 w-4" />
						View details
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setEditingTransaction(transaction)}>
					<Pencil className="mr-2 h-4 w-4" />
					Edit
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => setDeletingTransaction(transaction)}
					className="text-red-600 focus:text-red-600"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	const columns: ColumnDef<Transaction>[] = [
		{
			id: "transactionDate",
			accessorFn: (row) =>
				row.transactionDate ? new Date(row.transactionDate).getTime() : 0,
			header: "Date & time",
			cell: ({ row }) => {
				const date = row.original.transactionDate;
				return date ? format(new Date(date), "PPp") : "N/A";
			},
		},
		{
			accessorKey: "merchant",
			header: "Merchant",
			cell: ({ row }) => (
				<div className="font-medium">
					{row.getValue("merchant") || "Unknown"}
				</div>
			),
		},
		{
			id: "category",
			accessorFn: (row) => row.category?.name || "Uncategorized",
			header: "Category",
			cell: ({ row }) => {
				const category = row.original.category;
				return (
					<div>
						{category ? (
							<Badge variant="secondary" className="font-normal">
								{category.icon && <span className="mr-1">{category.icon}</span>}
								{category.name}
							</Badge>
						) : (
							<span className="text-muted-foreground italic">
								Uncategorized
							</span>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "bankName",
			header: "Bank",
			cell: ({ row }) => (
				<div>
					{row.getValue("bankName") || (
						<span className="text-muted-foreground">-</span>
					)}
				</div>
			),
		},
		{
			accessorKey: "remarks",
			header: "Remarks",
			cell: ({ row }) => {
				const remarks = row.getValue("remarks") as string | null;
				return (
					<div className="max-w-[200px] truncate" title={remarks || undefined}>
						{remarks || <span className="text-muted-foreground">-</span>}
					</div>
				);
			},
		},
		{
			accessorKey: "amount",
			header: () => <div className="text-right">Amount</div>,
			sortingFn: (rowA, rowB, columnId) =>
				Number(rowA.getValue(columnId)) - Number(rowB.getValue(columnId)),
			cell: ({ row }) => {
				const amount = parseFloat(row.getValue("amount") || "0");
				const formatted = formatCurrency(
					amount,
					row.original.currency || "NPR",
				);
				return <div className="text-right font-medium">{formatted}</div>;
			},
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const transaction = row.original;

				return (
					<div
						className="flex justify-end"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
						role="presentation"
					>
						{renderTransactionActions(transaction)}
					</div>
				);
			},
		},
	];

	const handleDelete = () => {
		if (!deletingTransaction) return;

		deleteMutation.mutate(
			{
				params: {
					path: {
						id: deletingTransaction.id,
					},
				},
			},
			{
				onSuccess: () => {
					toast.success("Transaction deleted");
					setDeletingTransaction(null);
				},
				onError: (error) => {
					toast.error("Failed to delete transaction", {
						description: error.message,
					});
				},
			},
		);
	};

	return (
		<>
			<div className="max-w-6xl mx-auto space-y-8 min-w-0 overflow-hidden">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">
								Transactions
							</h1>
							<p className="text-muted-foreground mt-1">
								View and manage your tracked expenses.
							</p>
						</div>
						<DateFilter
							period={period}
							startDate={startDate}
							endDate={endDate}
							onPeriodChange={handlePeriodChange}
							onDateRangeChange={handleDateRangeChange}
						/>
					</div>
				</div>
				<div className="hidden md:block">
					<DataTable
						columns={columns}
						data={filteredTransactions}
						isLoading={isLoading}
						sorting={{
							state: sorting,
							onSortingChange: handleSortingChange,
						}}
						pagination={{
							state: pagination,
							options: {
								onPaginationChange: setPagination,
								rowCount: filteredTransactions.length,
							},
						}}
						search={{
							value: globalFilter,
							onChange: handleSearchChange,
						}}
						headerClassName="w-full sm:w-full justify-between"
						headerButtons={
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setFiltersSheetOpen(true)}
								>
									<SlidersHorizontal className="mr-2 h-4 w-4" />
									Filters
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCreateOptionsOpen(true)}
								>
									<Plus className="mr-2 h-4 w-4" />
									Create transaction
								</Button>
							</div>
						}
						noData={{
							title: isLoading
								? "Loading transactions..."
								: "No transactions found",
							description: noDataDescription,
						}}
						onRowClick={(row) =>
							navigate({
								to: "/transactions/$transactionId",
								params: { transactionId: row.original.id },
							})
						}
					/>
				</div>

				<div className="space-y-4 md:hidden">
					<Card>
						<CardContent className="space-y-3 p-4">
							<Search
								value={globalFilter}
								onChange={(event) => handleSearchChange(event.target.value)}
								placeholder="Search..."
								className="h-9 w-full"
							/>
							<div className="grid grid-cols-2 gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setFiltersSheetOpen(true)}
								>
									<SlidersHorizontal className="mr-2 h-4 w-4" />
									Filters
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCreateOptionsOpen(true)}
								>
									<Plus className="mr-2 h-4 w-4" />
									Create transaction
								</Button>
							</div>
						</CardContent>
					</Card>

					{isLoading ? (
						new Array(pagination.pageSize).fill(null).map((_, index) => (
							<Card key={index}>
								<CardContent className="space-y-3 p-4">
									<Skeleton className="h-5 w-1/2" />
									<Skeleton className="h-4 w-2/3" />
									<Skeleton className="h-4 w-full" />
								</CardContent>
							</Card>
						))
					) : mobilePageTransactions.length ? (
						mobilePageTransactions.map((transaction) => {
							const amount = Number(transaction.amount ?? "0");
							const formattedAmount = formatCurrency(
								amount,
								transaction.currency || "NPR",
							);
							return (
								<Card
									key={transaction.id}
									className="cursor-pointer"
									onClick={() =>
										navigate({
											to: "/transactions/$transactionId",
											params: { transactionId: transaction.id },
										})
									}
								>
									<CardContent className="space-y-3 p-4">
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0">
												<p className="truncate font-medium">
													{transaction.merchant || "Unknown"}
												</p>
												<p className="text-xs text-muted-foreground">
													{transaction.transactionDate
														? format(
																new Date(transaction.transactionDate),
																"PPp",
															)
														: "N/A"}
												</p>
											</div>
											<div className="flex items-start gap-1">
												<p className="text-sm font-semibold">
													{formattedAmount}
												</p>
												<div
													onClick={(event) => event.stopPropagation()}
													onKeyDown={(event) => event.stopPropagation()}
													role="presentation"
												>
													{renderTransactionActions(transaction, "end")}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{transaction.category ? (
												<Badge variant="secondary" className="font-normal">
													{transaction.category.icon && (
														<span className="mr-1">
															{transaction.category.icon}
														</span>
													)}
													{transaction.category.name}
												</Badge>
											) : (
												<span className="text-muted-foreground text-sm italic">
													Uncategorized
												</span>
											)}
											<Badge variant="outline" className="uppercase">
												{transaction.type}
											</Badge>
										</div>
										{transaction.bankName ? (
											<p className="text-sm text-muted-foreground">
												Bank: {transaction.bankName}
											</p>
										) : null}
										{transaction.remarks ? (
											<p className="text-sm text-muted-foreground line-clamp-2">
												{transaction.remarks}
											</p>
										) : null}
									</CardContent>
								</Card>
							);
						})
					) : (
						<Card>
							<NoData
								title="No transactions found"
								description={noDataDescription}
								isSearchResults={!!globalFilter}
							/>
						</Card>
					)}

					<div className="flex items-center justify-evenly border rounded-xl px-4 py-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setPagination((prev) => ({
									...prev,
									pageIndex: Math.max(0, mobilePageIndex - 1),
								}))
							}
							disabled={mobilePageIndex === 0}
						>
							Previous
						</Button>
						<span className="flex-1 text-center text-sm font-semibold text-muted-foreground">
							Page {mobilePageIndex + 1} of {mobilePageCount.toLocaleString()}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setPagination((prev) => ({
									...prev,
									pageIndex: Math.min(mobilePageCount - 1, mobilePageIndex + 1),
								}))
							}
							disabled={mobilePageIndex >= mobilePageCount - 1}
						>
							Next
						</Button>
					</div>
				</div>

				<Sheet
					open={filtersSheetOpen}
					onOpenChange={handleFiltersSheetOpenChange}
				>
					<SheetContent side="right" className="sm:max-w-md">
						<SheetHeader>
							<SheetTitle>Filters</SheetTitle>
							<SheetDescription>
								Filter by category and control sorting for transactions.
							</SheetDescription>
						</SheetHeader>
						<div className="space-y-4 p-4">
							<div className="space-y-2">
								<p className="text-sm font-medium">Category</p>
								{renderCategoryFilterCombobox("w-full")}
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium">Sort by</p>
								<Select
									value={sorting[0]?.id ?? "none"}
									onValueChange={handleSortOptionChange}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
										{sortOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium">Direction</p>
								<Button
									type="button"
									variant="outline"
									onClick={toggleSortDirection}
									disabled={!sorting[0]}
									className="w-full justify-between"
								>
									<span>{sorting[0]?.desc ? "Descending" : "Ascending"}</span>
									<span className="text-xs text-muted-foreground">
										{sorting[0] ? "Tap to toggle" : "Select sort first"}
									</span>
								</Button>
							</div>
						</div>
						<SheetFooter className="border-t">
							<Button variant="outline" onClick={clearFilters}>
								Clear filters
							</Button>
							<Button onClick={() => handleFiltersSheetOpenChange(false)}>
								Apply
							</Button>
						</SheetFooter>
					</SheetContent>
				</Sheet>

				<Dialog open={createOptionsOpen} onOpenChange={setCreateOptionsOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create transaction</DialogTitle>
							<DialogDescription>
								Choose how you want to add a transaction.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-2">
							<Button className="justify-start" onClick={openCreateManual}>
								<Plus className="mr-2 h-4 w-4" />
								Add manually
							</Button>
							<Button
								variant="outline"
								className="justify-start"
								onClick={openCreateFromSms}
							>
								<MessageSquarePlus className="mr-2 h-4 w-4" />
								Create from SMS
							</Button>
						</div>
					</DialogContent>
				</Dialog>

				{/* Edit Dialog */}
				{editingTransaction && (
					<EditTransactionForm
						transaction={editingTransaction}
						categories={categories}
						open={!!editingTransaction}
						onOpenChange={(open) => !open && setEditingTransaction(null)}
						onSubmit={(body) => {
							updateMutation.mutate(
								{
									params: {
										path: { id: editingTransaction.id },
									},
									body,
								},
								{
									onSuccess: () => {
										toast.success("Transaction updated");
										setEditingTransaction(null);
									},
									onError: (error) => {
										toast.error("Failed to update transaction", {
											description: error.message,
										});
									},
								},
							);
						}}
						isPending={updateMutation.isPending}
						onCancel={() => setEditingTransaction(null)}
					/>
				)}

				{/* Create from SMS Dialog */}
				<CreateTransactionFromSmsForm
					key={String(smsDialogOpen)}
					open={smsDialogOpen}
					onOpenChange={setSmsDialogOpen}
					onSubmit={(body) => {
						createFromSmsMutation.mutate(
							{ body },
							{
								onSuccess: () => {
									toast.success("Transaction created from SMS");
									setSmsDialogOpen(false);
								},
								onError: (error) => {
									toast.error("Failed to create transaction", {
										description: error.message,
									});
								},
							},
						);
					}}
					isPending={createFromSmsMutation.isPending}
					onCancel={() => setSmsDialogOpen(false)}
				/>

				{/* Create Transaction Dialog */}
				<CreateTransactionForm
					key={String(manualDialogOpen)}
					open={manualDialogOpen}
					onOpenChange={setManualDialogOpen}
					categories={categories}
					onSubmit={(body) => {
						createMutation.mutate(
							{ body },
							{
								onSuccess: () => {
									toast.success("Transaction created");
									setManualDialogOpen(false);
								},
								onError: (error) => {
									toast.error("Failed to create transaction", {
										description: error.message,
									});
								},
							},
						);
					}}
					isPending={createMutation.isPending}
					onCancel={() => setManualDialogOpen(false)}
				/>

				{/* Delete Confirmation */}
				<Dialog
					open={!!deletingTransaction}
					onOpenChange={(open) => !open && setDeletingTransaction(null)}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Are you sure?</DialogTitle>
							<DialogDescription>
								This action cannot be undone. This will permanently delete the
								transaction for{" "}
								<span className="font-medium">
									{deletingTransaction?.merchant}
								</span>
								.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setDeletingTransaction(null)}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleDelete}
								disabled={deleteMutation.isPending}
							>
								{deleteMutation.isPending ? "Deleting..." : "Delete"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
			<Outlet />
		</>
	);
}
