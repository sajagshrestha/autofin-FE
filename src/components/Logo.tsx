import { useTheme } from "@/contexts/ThemeContext";

export function Logo({ className }: { className?: string }) {
	const { resolvedTheme } = useTheme();
	const src = resolvedTheme === "dark" ? "/logo-dark.svg" : "/logo-light.svg";
	return <img src={src} alt="AutoFin" className={className} />;
}
