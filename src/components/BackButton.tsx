import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

type BackButtonProps = ButtonProps & {
	/** Route to navigate to when there is no history (e.g. direct link / refresh). */
	fallback: string;
	/** Optional label; defaults to "Back". */
	children?: ReactNode;
};

export function BackButton({
	fallback,
	children = "Back",
	onClick,
	...buttonProps
}: BackButtonProps) {
	const navigate = useNavigate();

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		onClick?.(e);
		if (e.defaultPrevented) return;
		if (window.history.length > 1) {
			window.history.back();
		} else {
			navigate({ to: fallback });
		}
	};

	return (
		<Button onClick={handleClick} {...buttonProps}>
			<ArrowLeft className="mr-2 h-4 w-4" />
			{children}
		</Button>
	);
}
