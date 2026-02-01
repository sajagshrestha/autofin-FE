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
import { Textarea } from "@/components/ui/textarea";

const smsBodySchema = z
	.string()
	.min(1, "SMS message is required")
	.refine((s) => s.trim().length > 0, "SMS message cannot be only whitespace");

export type CreateFromSmsBody = {
	smsBody: string;
	sender?: string;
};

export function CreateTransactionFromSmsForm({
	open,
	onOpenChange,
	onSubmit,
	isPending,
	onCancel,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (body: CreateFromSmsBody) => void;
	isPending: boolean;
	onCancel: () => void;
}) {
	const form = useForm({
		defaultValues: {
			smsBody: "",
			sender: "",
		},
		onSubmit: async ({ value }) => {
			onSubmit({
				smsBody: value.smsBody.trim(),
				...(value.sender?.trim() && { sender: value.sender.trim() }),
			});
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create transaction from SMS</DialogTitle>
					<DialogDescription>
						Paste an SMS message (e.g. from your bank) and we'll extract the
						transaction details using AI.
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
						name="smsBody"
						validators={{
							onChange: smsBodySchema,
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>SMS message</Label>
								<Textarea
									id={field.name}
									name={field.name}
									placeholder="e.g. Your debit card xxx1234 was used for Rs 500 at MERCHANT on 01 Jan 2025"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									rows={4}
									className="resize-none"
								/>
								{field.state.meta.errors ? (
									<em role="alert" className="text-destructive text-xs">
										{field.state.meta.errors.join(", ")}
									</em>
								) : null}
							</div>
						)}
					</form.Field>

					<form.Field name="sender">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Sender (optional)</Label>
								<Input
									id={field.name}
									name={field.name}
									placeholder="e.g. AD-BANK"
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
							{isPending ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
