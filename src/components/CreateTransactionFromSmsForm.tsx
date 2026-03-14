import { useForm } from "@tanstack/react-form";
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
import { Textarea } from "@/components/ui/textarea";
import { createFromSmsSchema } from "@/schemas/transaction";

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
		validators: {
			onChange: createFromSmsSchema,
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
				>
					<FieldGroup>
						<form.Field name="smsBody">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>SMS message</FieldLabel>
										<Textarea
											id={field.name}
											name={field.name}
											placeholder="e.g. Your debit card xxx1234 was used for Rs 500 at MERCHANT on 01 Jan 2025"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											rows={4}
											className="resize-none"
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field name="sender">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>
										Sender (optional)
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										placeholder="e.g. AD-BANK"
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
							{isPending ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
