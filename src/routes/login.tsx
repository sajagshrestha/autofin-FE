import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { type LoginFormData, loginSchema } from "@/schemas/auth";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const [serverError, setServerError] = useState<string | null>(null);
	const { signIn } = useAuth();
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		} as LoginFormData,
		onSubmit: async ({ value }) => {
			setServerError(null);
			const { error } = await signIn(value.email, value.password);

			if (error) {
				setServerError(error.message);
			} else {
				navigate({ to: "/" });
			}
		},
		validators: {
			onSubmit: loginSchema,
		},
	});

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Login</CardTitle>
					<CardDescription>
						Enter your email and password to sign in
					</CardDescription>
				</CardHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<CardContent className="space-y-4">
						{serverError && (
							<div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
								{serverError}
							</div>
						)}
						<form.Field
							name="email"
							validators={{
								onBlur: z
									.string()
									.min(1, "Email is required")
									.email("Please enter a valid email address"),
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Email</Label>
									<Input
										id={field.name}
										type="email"
										placeholder="you@example.com"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										disabled={form.state.isSubmitting}
										aria-invalid={
											field.state.meta.errors.length > 0 ? "true" : undefined
										}
									/>
									{field.state.meta.isTouched &&
										field.state.meta.errors.length > 0 && (
											<p className="text-sm text-destructive">
												{field.state.meta.errors.join(", ")}
											</p>
										)}
								</div>
							)}
						</form.Field>
						<form.Field
							name="password"
							validators={{
								onBlur: z.string().min(1, "Password is required"),
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Password</Label>
									<Input
										id={field.name}
										type="password"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										disabled={form.state.isSubmitting}
										aria-invalid={
											field.state.meta.errors.length > 0 ? "true" : undefined
										}
									/>
									{field.state.meta.isTouched &&
										field.state.meta.errors.length > 0 && (
											<p className="text-sm text-destructive">
												{field.state.meta.errors.join(", ")}
											</p>
										)}
								</div>
							)}
						</form.Field>
					</CardContent>
					<CardFooter className="flex flex-col space-y-4">
						<Button
							type="submit"
							className="w-full"
							disabled={form.state.isSubmitting}
						>
							{form.state.isSubmitting ? "Signing in..." : "Sign In"}
						</Button>
						<p className="text-center text-sm text-muted-foreground">
							Don't have an account?{" "}
							<Link
								to="/signup"
								className="text-primary hover:underline font-medium"
							>
								Sign up
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
