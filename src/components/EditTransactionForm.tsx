import {
	Combobox,
	ComboboxButton,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
} from "@headlessui/react";
import { useForm } from "@tanstack/react-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
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
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Category, Transaction } from "@/hooks";
import {
	mapEditFormToUpdateBody,
	type UpdateTransactionBody,
} from "@/hooks/transactions/types";
import { editTransactionSchema } from "@/schemas/transaction";

type CategoryOption = {
	id: string;
	label: string;
	searchLabel: string;
};

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
		},
		onSubmit: async ({ value }) => {
			onSubmit(mapEditFormToUpdateBody(value));
		},
		validators: {
			onChange: editTransactionSchema,
		},
	});
	const [categoryQuery, setCategoryQuery] = useState("");
	const categoryOptions = useMemo<CategoryOption[]>(
		() => [
			{
				id: "",
				label: "Uncategorized",
				searchLabel: "uncategorized no category",
			},
			...[...categories]
				.sort((a, b) => a.name.localeCompare(b.name))
				.map((category) => ({
					id: category.id,
					label: `${category.icon ? `${category.icon} ` : ""}${category.name}`,
					searchLabel: `${category.name} ${category.icon ?? ""}`.toLowerCase(),
				})),
		],
		[categories],
	);
	const visibleCategoryOptions = useMemo(() => {
		const normalizedQuery = categoryQuery.trim().toLowerCase();
		if (!normalizedQuery) return categoryOptions;

		return categoryOptions.filter((option) =>
			option.searchLabel.includes(normalizedQuery),
		);
	}, [categoryOptions, categoryQuery]);

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
				>
					<FieldGroup>
						<form.Field name="merchant">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Merchant</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field name="categoryId">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Category</FieldLabel>
										<Combobox
											value={field.state.value}
											onChange={(value: string | null) => {
												if (value == null) return;
												field.handleChange(value);
												setCategoryQuery("");
											}}
											immediate
										>
											<div className="relative">
												<ComboboxInput
													id={field.name}
													name={field.name}
													className="h-9 w-full rounded-md border border-input bg-background px-3 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
													placeholder="Select a category"
													displayValue={() =>
														categoryOptions.find(
															(option) => option.id === field.state.value,
														)?.label ?? ""
													}
													onChange={(event) =>
														setCategoryQuery(event.target.value)
													}
													onBlur={field.handleBlur}
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
																key={option.id || "uncategorized"}
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
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field name="remarks">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Remarks</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</Field>
							)}
						</form.Field>
					</FieldGroup>

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
