import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useGetGmailOAuthCallback } from "@/hooks/gmail/queries";

const searchParamsSchema = z.object({
	code: z.string().optional(),
	state: z.string().optional(),
	error: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/google-callback")({
	validateSearch: searchParamsSchema,
	component: GoogleCallbackPage,
});

function GoogleCallbackPage() {
	const navigate = useNavigate();
	const { code, state, error: oauthError } = Route.useSearch();

	const { data, isLoading, isError, error } = useGetGmailOAuthCallback({
		code,
		state,
		error: oauthError,
	});

	useEffect(() => {
		if (data?.success) {
			navigate({ to: "/dashboard" });
		}
	}, [data, navigate]);

	if (oauthError) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Authorization Failed</CardTitle>
						<CardDescription>
							Google authorization was denied or failed
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-destructive">{oauthError}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Connecting Google Account</CardTitle>
						<CardDescription>
							Please wait while we complete the authorization...
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-center py-4">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Connection Failed</CardTitle>
						<CardDescription>
							Failed to connect your Google account
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-destructive">
							{error?.message || "An unexpected error occurred"}
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Success!</CardTitle>
					<CardDescription>
						Your Google account has been connected
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Redirecting to dashboard...
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
