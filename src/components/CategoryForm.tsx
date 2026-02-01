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
import type { Category } from "@/hooks";

export type CategoryFormBody = { name: string; icon?: string };

export function CategoryForm({
	category,
	open,
	onOpenChange,
	onSubmit,
	isPending,
	onCancel,
	mode,
}: {
	category?: Category | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (body: CategoryFormBody) => void;
	isPending: boolean;
	onCancel: () => void;
	mode: "create" | "edit";
}) {
	const form = useForm({
		defaultValues: {
			name: category?.name ?? "",
			icon: category?.icon ?? "",
		},
		onSubmit: async ({ value }) => {
			onSubmit({
				name: value.name.trim(),
				icon: value.icon?.trim() || undefined,
			});
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "Add Category" : "Edit Category"}
					</DialogTitle>
					<DialogDescription>
						{mode === "create"
							? "Create a new custom category. Name is required."
							: "Update the category name and optional icon."}
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
						name="name"
						validators={{
							onChange: z.string().min(1, "Name is required"),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Name</Label>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="e.g. Groceries"
								/>
								{field.state.meta.errors?.length ? (
									<em role="alert" className="text-destructive text-xs">
										{field.state.meta.errors.join(", ")}
									</em>
								) : null}
							</div>
						)}
					</form.Field>

					<form.Field name="icon">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Icon (optional)</Label>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="e.g. 🛒"
								/>
							</div>
						)}
					</form.Field>

					<DialogFooter className="pt-4">
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Saving..." : mode === "create" ? "Create" : "Save"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
