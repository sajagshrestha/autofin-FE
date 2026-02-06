import {
	createFileRoute,
	Link,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import type {
	ColumnDef,
	PaginationState,
	SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CategoryForm, type CategoryFormBody } from "@/components/CategoryForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
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
import type { Category } from "@/hooks";
import {
	useCreateCategory,
	useDeleteCategory,
	useUpdateCategory,
} from "@/hooks/categories/mutations";
import { useGetAllCategories } from "@/hooks/categories/queries";

export const Route = createFileRoute("/_authenticated/categories")({
	component: CategoriesPage,
});

function CategoriesPage() {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [deletingCategory, setDeletingCategory] = useState<Category | null>(
		null,
	);
	const [createOpen, setCreateOpen] = useState(false);

	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isListPage = pathname === "/categories" || pathname === "/categories/";

	const { data: categoriesData, isLoading } = useGetAllCategories();
	const createMutation = useCreateCategory();
	const updateMutation = useUpdateCategory();
	const deleteMutation = useDeleteCategory();

	const categories = (categoriesData?.categories as Category[]) || [];

	const columns: ColumnDef<Category>[] = [
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => (
				<div className="flex items-center gap-2 font-medium">
					{row.original.icon && (
						<span className="text-lg">{row.original.icon}</span>
					)}
					{row.getValue("name")}
				</div>
			),
		},
		{
			accessorKey: "icon",
			header: "Icon",
			cell: ({ row }) => {
				const icon = row.getValue("icon") as string | null;
				return icon ? (
					<span className="text-lg">{icon}</span>
				) : (
					<span className="text-muted-foreground">—</span>
				);
			},
		},
		{
			id: "type",
			header: "Type",
			cell: ({ row }) => {
				const c = row.original;
				if (c.isDefault) return <Badge variant="secondary">Default</Badge>;
				if (c.isAiCreated) return <Badge variant="outline">AI</Badge>;
				return <Badge>Custom</Badge>;
			},
		},
		{
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) =>
				format(new Date(row.getValue("createdAt") as string), "PPP"),
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const category = row.original;
				// Editable = user-created (has userId); support snake_case from API
				const userId =
					category.userId ??
					(category as Category & { user_id?: string }).user_id;
				const isDefault =
					category.isDefault ??
					(category as Category & { is_default?: boolean }).is_default ??
					false;
				const canEdit = userId != null || !isDefault;

				return (
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
									to="/categories/$categoryId"
									params={{ categoryId: category.id }}
								>
									<Eye className="mr-2 h-4 w-4" />
									View details
								</Link>
							</DropdownMenuItem>
							{canEdit && (
								<>
									<DropdownMenuItem
										onClick={() => setEditingCategory(category)}
									>
										<Pencil className="mr-2 h-4 w-4" />
										Edit
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => setDeletingCategory(category)}
										className="text-red-600 focus:text-red-600"
									>
										<Trash2 className="mr-2 h-4 w-4" />
										Delete
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const handleCreate = (body: CategoryFormBody) => {
		createMutation.mutate(
			{ body },
			{
				onSuccess: () => {
					toast.success("Category created");
					setCreateOpen(false);
				},
				onError: (err) => {
					toast.error("Failed to create category", {
						description: err.message,
					});
				},
			},
		);
	};

	const handleUpdate = (body: CategoryFormBody) => {
		if (!editingCategory) return;
		updateMutation.mutate(
			{
				params: { path: { id: editingCategory.id } },
				body,
			},
			{
				onSuccess: () => {
					toast.success("Category updated");
					setEditingCategory(null);
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
		if (!deletingCategory) return;
		deleteMutation.mutate(
			{
				params: { path: { id: deletingCategory.id } },
			},
			{
				onSuccess: () => {
					toast.success("Category deleted");
					setDeletingCategory(null);
				},
				onError: (err) => {
					toast.error("Failed to delete category", {
						description: err.message,
					});
				},
			},
		);
	};

	return (
		<>
			{isListPage && (
				<div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto space-y-8 min-w-0 overflow-hidden">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
							<div>
								<h1 className="text-3xl font-bold tracking-tight">
									Categories
								</h1>
								<p className="text-muted-foreground mt-1">
									Manage your spending categories. Default and AI categories
									cannot be edited or deleted.
								</p>
							</div>
							<Button onClick={() => setCreateOpen(true)} className="gap-2">
								<Plus className="h-4 w-4" />
								Add category
							</Button>
						</div>
					</div>
					<DataTable
						columns={columns}
						data={categories}
						isLoading={isLoading}
						sorting={{
							state: sorting,
							onSortingChange: setSorting,
						}}
						pagination={{
							state: pagination,
							options: {
								onPaginationChange: setPagination,
								rowCount: categories.length,
							},
						}}
						search={{
							value: globalFilter,
							onChange: setGlobalFilter,
						}}
						noData={{
							title: isLoading
								? "Loading categories..."
								: "No categories found",
							description: "Get started by creating your first category.",
						}}
					/>

					{/* Create Dialog */}
					<CategoryForm
						mode="create"
						open={createOpen}
						onOpenChange={setCreateOpen}
						onSubmit={handleCreate}
						isPending={createMutation.isPending}
						onCancel={() => setCreateOpen(false)}
					/>

					{/* Edit Dialog */}
					{editingCategory && (
						<CategoryForm
							mode="edit"
							category={editingCategory}
							open={!!editingCategory}
							onOpenChange={(open) => !open && setEditingCategory(null)}
							onSubmit={handleUpdate}
							isPending={updateMutation.isPending}
							onCancel={() => setEditingCategory(null)}
						/>
					)}

					{/* Delete Confirmation */}
					<Dialog
						open={!!deletingCategory}
						onOpenChange={(open) => !open && setDeletingCategory(null)}
					>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Delete category?</DialogTitle>
								<DialogDescription>
									This will permanently delete the category{" "}
									<span className="font-medium">
										{deletingCategory?.icon}
										{deletingCategory?.name}
									</span>
									. Transactions using this category may become uncategorized.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setDeletingCategory(null)}
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
			)}
			<Outlet />
		</>
	);
}
