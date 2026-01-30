import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	MoreVertical,
	Pencil,
	Search,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Category, Transaction } from "@/hooks";
import { useGetAllCategories } from "@/hooks/categories/queries";
import {
	useDeleteTransaction,
	useUpdateTransaction,
} from "@/hooks/transactions/mutations";
import { useGetAllTransactions } from "@/hooks/transactions/queries";
import {
	mapEditFormToUpdateBody,
	type UpdateTransactionBody,
} from "@/hooks/transactions/types";

export const Route = createFileRoute("/_authenticated/transactions")({
	component: TransactionsPage,
});

function TransactionsPage() {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [editingTransaction, setEditingTransaction] =
		useState<Transaction | null>(null);
	const [deletingTransaction, setDeletingTransaction] =
		useState<Transaction | null>(null);

	const { data: transactionsData, isLoading } = useGetAllTransactions();
	const { data: categoriesData } = useGetAllCategories();

	const updateMutation = useUpdateTransaction();
	const deleteMutation = useDeleteTransaction();

	const transactions = (transactionsData?.transactions as Transaction[]) || [];
	const categories = categoriesData?.categories || [];

	const columns: ColumnDef<Transaction>[] = [
		{
			accessorKey: "transactionDate",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Date
						{column.getIsSorted() === "asc" ? (
							<ArrowUp className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === "desc" ? (
							<ArrowDown className="ml-2 h-4 w-4" />
						) : (
							<ArrowUpDown className="ml-2 h-4 w-4" />
						)}
					</Button>
				);
			},
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
			header: "Category",
			cell: ({ row }) => {
				const category = row.original.category;
				return category ? (
					<Badge variant="secondary" className="font-normal">
						{category.icon && <span className="mr-1">{category.icon}</span>}
						{category.name}
					</Badge>
				) : (
					<span className="text-muted-foreground italic">Uncategorized</span>
				);
			},
		},
		{
			accessorKey: "bankName",
			header: "Bank",
			cell: ({ row }) => (
				<div className="text-sm">
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
					<div
						className="text-sm max-w-[200px] truncate"
						title={remarks || undefined}
					>
						{remarks || <span className="text-muted-foreground">-</span>}
					</div>
				);
			},
		},
		{
			accessorKey: "amount",
			header: ({ column }) => (
				<div className="text-right">
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Amount
						{column.getIsSorted() === "asc" ? (
							<ArrowUp className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === "desc" ? (
							<ArrowDown className="ml-2 h-4 w-4" />
						) : (
							<ArrowUpDown className="ml-2 h-4 w-4" />
						)}
					</Button>
				</div>
			),
			cell: ({ row }) => {
				const amount = parseFloat(row.getValue("amount") || "0");
				const formatted = new Intl.NumberFormat("ne-NP", {
					style: "currency",
					currency: row.original.currency || "NPR",
				}).format(amount);

				return <div className="text-right font-medium">{formatted}</div>;
			},
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const transaction = row.original;

				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
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
				);
			},
		},
	];

	const table = useReactTable({
		data: transactions,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		state: {
			sorting,
			globalFilter,
		},
	});

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
		<div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto space-y-8">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
					<p className="text-muted-foreground mt-1">
						View and manage your tracked expenses.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search transactions..."
							value={globalFilter ?? ""}
							onChange={(event) => setGlobalFilter(event.target.value)}
							className="pl-8 w-full md:w-[300px]"
						/>
					</div>
				</div>
			</div>

			<div className="rounded-md border bg-card">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									{isLoading ? "Loading transactions..." : "No results."}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-end space-x-2 py-4">
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronLeft className="h-4 w-4" />
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Next
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>

			{/* Edit Dialog */}
			<Dialog
				open={!!editingTransaction}
				onOpenChange={(open) => !open && setEditingTransaction(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Transaction</DialogTitle>
						<DialogDescription>
							Make changes to your transaction here. Click save when you're
							done.
						</DialogDescription>
					</DialogHeader>
					{editingTransaction && (
						<EditTransactionForm
							transaction={editingTransaction}
							categories={categories}
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
				</DialogContent>
			</Dialog>

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
	);
}

// Separate component for form to handle defaults cleanly
function EditTransactionForm({
	transaction,
	categories,
	onSubmit,
	isPending,
	onCancel,
}: {
	transaction: Transaction;
	categories: Category[];
	onSubmit: (body: UpdateTransactionBody) => void;
	isPending: boolean;
	onCancel: () => void;
}) {
	const form = useForm({
		defaultValues: {
			merchant: transaction.merchant || "",
			categoryId: transaction.category?.id ?? transaction.categoryId ?? "",
			remarks: transaction.remarks || "",
			amount: transaction.amount,
		},
		onSubmit: async ({ value }) => {
			onSubmit(mapEditFormToUpdateBody(value));
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field
				name="merchant"
				validators={{
					onChange: z.string().min(1, "Merchant name is required"),
				}}
			>
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Merchant</Label>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors ? (
							<em role="alert" className="text-destructive text-xs">
								{field.state.meta.errors.join(", ")}
							</em>
						) : null}
					</div>
				)}
			</form.Field>

			<form.Field name="categoryId">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Category</Label>
						<Select
							value={field.state.value}
							onValueChange={field.handleChange}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a category" />
							</SelectTrigger>
							<SelectContent>
								{categories.map((category) => (
									<SelectItem key={category.id} value={category.id}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</form.Field>

			<form.Field name="remarks">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Remarks</Label>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					</div>
				)}
			</form.Field>

			<DialogFooter className="pt-4">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Saving..." : "Save Changes"}
				</Button>
			</DialogFooter>
		</form>
	);
}
