export function getFirstFieldError(
	errors: unknown[],
): string | undefined {
	const first = errors[0];
	if (!first) return undefined;
	return typeof first === "string"
		? first
		: (first as { message?: string }).message;
}
