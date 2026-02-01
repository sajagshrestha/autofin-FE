import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Category, Transaction } from "@/hooks";
import {
	mapEditFormToUpdateBody,
	type UpdateTransactionBody,
} from "@/hooks/transactions/types";

export function EditTransactionForm({
	transaction,
	categories,
	onSubmit,
	isPending,
	onCancel,
	open,
	onOpenChange,
}: {
	transaction: Transaction;
	categories: Category[];
	onSubmit: (body: UpdateTransactionBody) => void;
	isPending: boolean;
	onCancel: () => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Transaction</DialogTitle>
					<DialogDescription>
						Make changes to your transaction here. Click save when you're done.
					</DialogDescription>
				</DialogHeader>
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
			</DialogContent>
		</Dialog>
	);
}
