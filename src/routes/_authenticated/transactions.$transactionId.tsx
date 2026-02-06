import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EditTransactionForm } from "@/components/EditTransactionForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Category, Transaction } from "@/hooks";
import { useGetAllCategories } from "@/hooks/categories/queries";
import {
	useDeleteTransaction,
	useUpdateTransaction,
} from "@/hooks/transactions/mutations";
import { useGetTransactionById } from "@/hooks/transactions/queries";
import { formatCurrency } from "@/lib/formatCurrency";

export const Route = createFileRoute(
	"/_authenticated/transactions/$transactionId",
)({
	component: TransactionDetailPage,
});

/** Format AI confidence (e.g. "0.95" → "95%", or pass through if already percentage). */
function formatAiConfidence(value: string): string {
	const n = Number.parseFloat(value);
	if (Number.isNaN(n)) return value;
	if (n <= 1 && n >= 0) return `${Math.round(n * 100)}%`;
	return `${n}%`;
}

function TransactionDetailPage() {
	const { transactionId } = Route.useParams();
	const navigate = useNavigate();
	const [editOpen, setEditOpen] = useState(false);
	const { data, isLoading, error, refetch } =
		useGetTransactionById(transactionId);
	const { data: categoriesData } = useGetAllCategories();
	const deleteMutation = useDeleteTransaction();
	const updateMutation = useUpdateTransaction();

	const transaction = data?.transaction as Transaction | undefined;
	const categories = (categoriesData?.categories as Category[]) ?? [];

	const handleDelete = () => {
		if (!transaction) return;

		deleteMutation.mutate(
			{
				params: {
					path: { id: transaction.id },
				},
			},
			{
				onSuccess: () => {
					toast.success("Transaction deleted");
					navigate({ to: "/transactions" });
				},
				onError: (err) => {
					toast.error("Failed to delete transaction", {
						description: err.message,
					});
				},
			},
		);
	};

	if (isLoading) {
		return (
			<div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto">
				<div className="animate-pulse space-y-6">
					<div className="h-8 w-48 bg-muted rounded" />
					<div className="h-40 bg-muted rounded" />
					<div className="h-64 bg-muted rounded" />
				</div>
			</div>
		);
	}

	if (error || !transaction) {
		return (
			<div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto">
				<Card>
					<CardHeader>
						<CardTitle>Transaction not found</CardTitle>
						<CardDescription>
							{error?.message ?? "This transaction may have been removed."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild variant="outline">
							<Link to="/transactions">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Transactions
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const amountNum = parseFloat(transaction.amount ?? "0");
	const formattedAmount = formatCurrency(
		amountNum,
		transaction.currency ?? "NPR",
	);
	const isDebit = transaction.type === "debit";

	return (
		<div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to="/transactions" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Back to Transactions
					</Link>
				</Button>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						className="gap-2"
						onClick={() => setEditOpen(true)}
					>
						<Pencil className="h-4 w-4" />
						Edit
					</Button>
					{transaction && (
						<EditTransactionForm
							transaction={transaction}
							categories={categories}
							open={editOpen}
							onOpenChange={setEditOpen}
							onSubmit={(body) => {
								updateMutation.mutate(
									{
										params: { path: { id: transaction.id } },
										body,
									},
									{
										onSuccess: () => {
											toast.success("Transaction updated");
											setEditOpen(false);
											refetch();
										},
										onError: (err) => {
											toast.error("Failed to update transaction", {
												description: err.message,
											});
										},
									},
								);
							}}
							isPending={updateMutation.isPending}
							onCancel={() => setEditOpen(false)}
						/>
					)}
					<DeleteConfirmButton
						merchant={transaction.merchant ?? "this transaction"}
						onConfirm={handleDelete}
						isPending={deleteMutation.isPending}
					/>
				</div>
			</div>

			<Card>
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between gap-4">
						<div>
							<CardTitle className="text-2xl">
								{transaction.merchant ?? "Unknown merchant"}
							</CardTitle>
							<CardDescription>
								{transaction.transactionDate
									? format(new Date(transaction.transactionDate), "PPP")
									: "No date"}
							</CardDescription>
						</div>
						<span
							className={`text-xl font-semibold ${
								isDebit
									? "text-destructive"
									: "text-green-600 dark:text-green-400"
							}`}
						>
							{isDebit ? "-" : "+"}
							{formattedAmount}
						</span>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<Separator />

					<div className="grid gap-4 sm:grid-cols-2">
						<DetailRow
							label="Transaction date"
							value={
								transaction.transactionDate
									? format(new Date(transaction.transactionDate), "PPP")
									: "—"
							}
						/>
						<DetailRow
							label="Type"
							value={
								<Badge variant={isDebit ? "destructive" : "default"}>
									{transaction.type}
								</Badge>
							}
						/>
						<DetailRow
							label="Amount"
							value={
								<span
									className={
										isDebit
											? "text-destructive font-medium"
											: "text-green-600 dark:text-green-400 font-medium"
									}
								>
									{isDebit ? "-" : "+"}
									{formattedAmount}
								</span>
							}
						/>
						<DetailRow label="Currency" value={transaction.currency ?? "—"} />
						<DetailRow
							label="Category"
							value={
								transaction.category ? (
									<Badge variant="secondary" className="font-normal">
										{transaction.category.icon && (
											<span className="mr-1">{transaction.category.icon}</span>
										)}
										{transaction.category.name}
									</Badge>
								) : (
									<span className="text-muted-foreground italic">
										Uncategorized
									</span>
								)
							}
						/>
						<DetailRow label="Bank" value={transaction.bankName ?? "—"} />
						{transaction.accountNumber != null &&
							transaction.accountNumber !== "" && (
								<DetailRow
									label="Account number"
									value={transaction.accountNumber}
								/>
							)}
						{transaction.isAiCreated != null && (
							<DetailRow
								label="Created by AI"
								value={
									<Badge
										variant={transaction.isAiCreated ? "secondary" : "outline"}
									>
										{transaction.isAiCreated ? "Yes" : "No"}
									</Badge>
								}
							/>
						)}
						{transaction.aiConfidence != null &&
							transaction.aiConfidence !== "" && (
								<DetailRow
									label="AI confidence"
									value={formatAiConfidence(transaction.aiConfidence)}
								/>
							)}
					</div>

					{transaction.remarks != null && transaction.remarks !== "" && (
						<>
							<Separator />
							<DetailRow label="Remarks" value={transaction.remarks} />
						</>
					)}

					<Separator />

					<div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
						<DetailRow
							label="Created"
							value={
								transaction.createdAt
									? format(new Date(transaction.createdAt), "PPp")
									: "—"
							}
						/>
						<DetailRow
							label="Updated"
							value={
								transaction.updatedAt
									? format(new Date(transaction.updatedAt), "PPp")
									: "—"
							}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function DetailRow({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="space-y-1">
			<p className="text-sm font-medium text-muted-foreground">{label}</p>
			<div className="text-foreground">{value}</div>
		</div>
	);
}

function DeleteConfirmButton({
	merchant,
	onConfirm,
	isPending,
}: {
	merchant: string;
	onConfirm: () => void;
	isPending: boolean;
}) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button
				variant="outline"
				size="sm"
				className="text-destructive hover:text-destructive hover:bg-destructive/10"
				onClick={() => setOpen(true)}
			>
				<Trash2 className="h-4 w-4" />
				Delete
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete transaction?</DialogTitle>
						<DialogDescription>
							This cannot be undone. This will permanently delete the
							transaction for <span className="font-medium">{merchant}</span>.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								onConfirm();
								setOpen(false);
							}}
							disabled={isPending}
						>
							{isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
