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
import { DateTimePicker } from "@/components/ui/date-time-picker";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/hooks";
import {
	type CreateTransactionBody,
	mapCreateFormToCreateBody,
} from "@/hooks/transactions/types";
import { createTransactionSchema } from "@/schemas/transaction";

type CategoryOption = {
	id: string;
	label: string;
	searchLabel: string;
};

export function CreateTransactionForm({
	open,
	onOpenChange,
	onSubmit,
	isPending,
	onCancel,
	categories,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (body: CreateTransactionBody) => void;
	isPending: boolean;
	onCancel: () => void;
	categories: Category[];
}) {
	const form = useForm({
		defaultValues: {
			amount: "",
			type: "debit" as "debit" | "credit",
			categoryId: "",
			merchant: "",
			remarks: "",
			transactionDate: new Date().toISOString(),
		},
		onSubmit: async ({ value }) => {
			onSubmit(mapCreateFormToCreateBody(value));
		},
		validators: {
			onChange: createTransactionSchema,
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
					<DialogTitle>Add Transaction</DialogTitle>
					<DialogDescription>
						Add a transaction manually when you do not want to use SMS parsing.
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
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field name="amount">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Amount</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												type="number"
												inputMode="decimal"
												step="0.01"
												placeholder="0.00"
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

							<form.Field name="type">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Type</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(value) =>
													field.handleChange(value as "debit" | "credit")
												}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="debit">Debit</SelectItem>
													<SelectItem value="credit">Credit</SelectItem>
												</SelectContent>
											</Select>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
						</div>

						<form.Field name="categoryId">
							{(field) => (
								<Field>
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
								</Field>
							)}
						</form.Field>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field name="merchant">
								{(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>
											Merchant (optional)
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											placeholder="e.g. BhatBhateni"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</Field>
								)}
							</form.Field>

							<form.Field name="transactionDate">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												Transaction Date
											</FieldLabel>
											<DateTimePicker
												value={
													field.state.value
														? new Date(field.state.value)
														: undefined
												}
												onChange={(date) =>
													field.handleChange(date ? date.toISOString() : "")
												}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
						</div>

						<form.Field name="remarks">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>
										Remarks (optional)
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										placeholder="Add notes"
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
							{isPending ? "Creating..." : "Create Transaction"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
