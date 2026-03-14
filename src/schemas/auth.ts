import { z } from "zod";

const emailSchema = z
	.string()
	.min(1, "Email is required")
	.email("Please enter a valid email address");

export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z
	.object({
		email: emailSchema,
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type SignupFormData = z.infer<typeof signupSchema>;
