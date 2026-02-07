import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/BackButton";
import { CategoryForm, type CategoryFormBody } from "@/components/CategoryForm";
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
import type { Category } from "@/hooks";
import {
	useDeleteCategory,
	useUpdateCategory,
} from "@/hooks/categories/mutations";
import { useGetCategoryById } from "@/hooks/categories/queries";

export const Route = createFileRoute("/_authenticated/categories/$categoryId")({
	component: CategoryDetailPage,
});

function CategoryDetailPage() {
	const { categoryId } = Route.useParams();
	const navigate = useNavigate();
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const { data, isLoading, error, refetch } = useGetCategoryById(categoryId);
	const updateMutation = useUpdateCategory();
	const deleteMutation = useDeleteCategory();

	const category = data?.category as Category | undefined;
	// Editable = user-created (has userId) or not default; support snake_case from API
	const userId =
		category?.userId ?? (category as Category & { user_id?: string })?.user_id;
	const isDefault =
		category?.isDefault ??
		(category as Category & { is_default?: boolean })?.is_default ??
		false;
	const canEdit = category && (userId != null || !isDefault);

	const handleUpdate = (body: CategoryFormBody) => {
		if (!category) return;
		updateMutation.mutate(
			{
				params: { path: { id: category.id } },
				body,
			},
			{
				onSuccess: () => {
					toast.success("Category updated");
					setEditOpen(false);
					refetch();
				},
				onError: (err) => {
					toast.error("Failed to update category", {
						description: err.message,
					});
				},
			},
		);
	};

	const handleDelete = () => {
		if (!category) return;
		deleteMutation.mutate(
			{
				params: { path: { id: category.id } },
			},
			{
				onSuccess: () => {
					toast.success("Category deleted");
					navigate({ to: "/categories" });
				},
				onError: (err) => {
					toast.error("Failed to delete category", {
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

	if (error || !category) {
		return (
			<div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto">
				<Card>
					<CardHeader>
						<CardTitle>Category not found</CardTitle>
						<CardDescription>
							{error?.message ?? "This category may have been removed."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<BackButton fallback="/categories" variant="outline">
							Back to Categories
						</BackButton>
					</CardContent>
				</Card>
			</div>
		);
	}

	const typeBadge = category.isDefault ? (
		<Badge variant="secondary">Default</Badge>
	) : category.isAiCreated ? (
		<Badge variant="outline">AI</Badge>
	) : (
		<Badge>Custom</Badge>
	);

	return (
		<div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<BackButton
					fallback="/categories"
					variant="ghost"
					size="sm"
					className="gap-2"
				>
					Back to Categories
				</BackButton>
				{canEdit && (
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
						<Button
							variant="outline"
							size="sm"
							className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
							onClick={() => setDeleteOpen(true)}
						>
							<Trash2 className="h-4 w-4" />
							Delete
						</Button>
					</div>
				)}
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-3">
						{category.icon && <span className="text-3xl">{category.icon}</span>}
						<div>
							<CardTitle className="text-2xl">{category.name}</CardTitle>
							<div className="flex items-center gap-2 mt-1">{typeBadge}</div>
						</div>
					</div>
					<CardDescription>
						Category details. Default and AI categories cannot be edited.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<Separator />
					<dl className="grid gap-4 sm:grid-cols-2">
						<div>
							<dt className="text-sm font-medium text-muted-foreground">ID</dt>
							<dd className="mt-1 text-sm font-mono">{category.id}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-muted-foreground">
								Created
							</dt>
							<dd className="mt-1 text-sm">
								{format(new Date(category.createdAt), "PPP")}
							</dd>
						</div>
						{category.icon && (
							<div>
								<dt className="text-sm font-medium text-muted-foreground">
									Icon
								</dt>
								<dd className="mt-1 text-lg">{category.icon}</dd>
							</div>
						)}
					</dl>
				</CardContent>
			</Card>

			{/* Edit Dialog */}
			<CategoryForm
				mode="edit"
				category={category}
				open={editOpen}
				onOpenChange={setEditOpen}
				onSubmit={handleUpdate}
				isPending={updateMutation.isPending}
				onCancel={() => setEditOpen(false)}
			/>

			{/* Delete Confirmation */}
			<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete category?</DialogTitle>
						<DialogDescription>
							This will permanently delete the category{" "}
							<span className="font-medium">
								{category.icon}
								{category.name}
							</span>
							. Transactions using this category may become uncategorized.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteOpen(false)}>
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
