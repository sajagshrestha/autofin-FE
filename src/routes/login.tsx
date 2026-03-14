import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { GoogleIcon } from "@/components/GoogleIcon";
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
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { getFirstFieldError } from "@/lib/form-helpers";
import { type LoginFormData, loginSchema } from "@/schemas/auth";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const [serverError, setServerError] = useState<string | null>(null);
	const [googleLoading, setGoogleLoading] = useState(false);
	const { signIn, signInWithGoogle } = useAuth();
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
				navigate({ to: "/dashboard" });
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
												{getFirstFieldError(field.state.meta.errors)}
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
												{getFirstFieldError(field.state.meta.errors)}
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
						<div className="relative w-full">
							<div className="absolute inset-0 flex items-center">
								<Separator className="w-full" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-card px-2 text-muted-foreground">
									Or continue with
								</span>
							</div>
						</div>
						<Button
							type="button"
							variant="outline"
							className="w-full"
							disabled={googleLoading}
							onClick={async () => {
								setGoogleLoading(true);
								setServerError(null);
								const { error } = await signInWithGoogle();
								if (error) {
									setServerError(error.message);
									setGoogleLoading(false);
								}
							}}
						>
							<GoogleIcon className="mr-2 h-4 w-4" />
							{googleLoading ? "Signing in..." : "Continue with Google"}
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
