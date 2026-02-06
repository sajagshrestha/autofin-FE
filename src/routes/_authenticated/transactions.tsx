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
	Eye,
	MessageSquarePlus,
	MoreVertical,
	Pencil,
	Trash2,
} from "lucide-react";
import { useCallback, useState } from "react";
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

export const Route = createFileRoute("/_authenticated/transactions")({
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

	const columns: ColumnDef<Transaction>[] = [
		{
			accessorKey: "transactionDate",
			header: "Date",
			cell: ({ row }) => {
				const date = row.getValue("transactionDate");
				return date ? format(new Date(date as string), "PPP") : "N/A";
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
			accessorKey: "category",
			header: () => <span className="hidden md:table-cell">Category</span>,
			cell: ({ row }) => {
				const category = row.original.category;
				return (
					<div className="hidden md:flex">
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
			header: () => <span className="hidden lg:table-cell">Bank</span>,
			cell: ({ row }) => (
				<div className="hidden lg:block text-sm">
					{row.getValue("bankName") || (
						<span className="text-muted-foreground">-</span>
					)}
				</div>
			),
		},
		{
			accessorKey: "remarks",
			header: () => <span className="hidden xl:table-cell">Remarks</span>,
			cell: ({ row }) => {
				const remarks = row.getValue("remarks") as string | null;
				return (
					<div
						className="hidden xl:block text-sm max-w-[200px] truncate"
						title={remarks || undefined}
					>
						{remarks || <span className="text-muted-foreground">-</span>}
					</div>
				);
			},
		},
		{
			accessorKey: "amount",
			header: () => <div className="text-right">Amount</div>,
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
			<div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto space-y-8 min-w-0 overflow-hidden">
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
					data={transactions}
					isLoading={isLoading}
					sorting={{
						state: sorting,
						onSortingChange: setSorting,
					}}
					pagination={{
						state: pagination,
						options: {
							onPaginationChange: setPagination,
							rowCount: transactions.length,
						},
					}}
					search={{
						value: globalFilter,
						onChange: setGlobalFilter,
					}}
					headerButtons={
						<Button
							variant="outline"
							size="sm"
							onClick={() => setSmsDialogOpen(true)}
						>
							<MessageSquarePlus className="mr-2 h-4 w-4" />
							Create from SMS
						</Button>
					}
					noData={{
						title: isLoading
							? "Loading transactions..."
							: "No transactions found",
						description: "Get started by creating a transaction from SMS.",
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
