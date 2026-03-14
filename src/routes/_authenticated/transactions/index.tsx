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
	Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { CreateTransactionFromSmsForm } from "@/components/CreateTransactionFromSmsForm";
import { EditTransactionForm } from "@/components/EditTransactionForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { Transaction } from "@/hooks";
import { useGetAllCategories } from "@/hooks/categories/queries";
import {
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

	const handleCategoryFilterChange = useCallback((value: string | null) => {
		if (!value) return;
		setCategoryFilter(value);
		setCategoryQuery("");
		setPagination((prev) => ({
			...prev,
			pageIndex: 0,
		}));
	}, []);

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
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-8 w-8 p-0">
									<span className="sr-only">Open menu</span>
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem asChild>
									<Link
										to="/transactions/$transactionId"
										params={{ transactionId: transaction.id }}
									>
										<Eye className="mr-2 h-4 w-4" />
										View details
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setEditingTransaction(transaction)}
								>
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
				<DataTable
					columns={columns}
					data={filteredTransactions}
					isLoading={isLoading}
					sorting={{
						state: sorting,
						onSortingChange: setSorting,
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
						onChange: setGlobalFilter,
					}}
					headerButtons={
						<div className="flex items-center gap-2">
							<Combobox
								value={categoryFilter}
								onChange={handleCategoryFilterChange}
								immediate
							>
								<div className="relative w-[220px]">
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
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSmsDialogOpen(true)}
							>
								<MessageSquarePlus className="mr-2 h-4 w-4" />
								Create from SMS
							</Button>
						</div>
					}
					noData={{
						title: isLoading
							? "Loading transactions..."
							: "No transactions found",
						description:
							categoryFilter === ALL_CATEGORIES_FILTER
								? "Get started by creating a transaction from SMS."
								: "Try a different category filter or create a transaction from SMS.",
					}}
					onRowClick={(row) =>
						navigate({
							to: "/transactions/$transactionId",
							params: { transactionId: row.original.id },
						})
					}
				/>

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
