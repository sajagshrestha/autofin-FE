import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { CreditCard, Home, LogOut, Menu, Settings, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Button } from "./ui/button";

const NAV_ITEMS = [
	{ to: "/", icon: Home, label: "Home", exact: true },
	{
		to: "/transactions",
		icon: CreditCard,
		label: "Transactions",
		exact: false,
	},
	{ to: "/settings", icon: Settings, label: "Settings", exact: false },
];

export default function Header() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { user, signOut } = useAuth();
	const navigate = useNavigate();
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	const handleSignOut = async () => {
		await signOut();
		navigate({ to: "/login" });
	};

	const isActive = (to: string, exact: boolean) => {
		if (exact) {
			return currentPath === to;
		}
		return currentPath.startsWith(to);
	};

	return (
		<>
			{/* Desktop Sidebar */}
			<aside className="hidden md:flex fixed left-0 top-0 h-full w-64 lg:w-72 flex-col bg-background border-r border-border z-40">
				{/* Logo */}
				<div className="p-4 border-b border-border">
					<Link to="/" className="gap-3">
						<h1 className="text-3xl font-bold px-4">AutoFin</h1>
					</Link>
				</div>

				{/* Navigation Links */}
				<nav className="flex-1 p-4 space-y-4">
					{NAV_ITEMS.map((item) => {
						const active = isActive(item.to, item.exact);
						return (
							<Link
								key={item.to}
								to={item.to}
								className={`flex items-center gap-3 px-4 py-3 rounded-full font-medium text-lg transition-colors ${
									active
										? "bg-primary text-primary-foreground"
										: "hover:bg-accent text-foreground"
								}`}
							>
								<item.icon className="h-6 w-6" />
								<span>{item.label}</span>
							</Link>
						);
					})}
				</nav>

				{/* User Section */}
				<div className="p-4 border-t border-border">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
							<span className="text-sm font-semibold text-primary">
								{user?.email?.charAt(0).toUpperCase() || "U"}
							</span>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium truncate">{user?.email}</p>
						</div>
						<div className="flex items-center gap-1">
							<ThemeSwitcher />
							<Button
								variant="ghost"
								size="icon"
								onClick={handleSignOut}
								aria-label="Sign out"
							>
								<LogOut className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</aside>

			{/* Mobile Header */}
			<header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-50 flex items-center justify-between px-4">
				<Link to="/">
					<h1 className="px-4 text-3xl font-bold">AutoFin</h1>
				</Link>
				<div className="flex items-center gap-2">
					<ThemeSwitcher />
					<button
						onClick={() => setIsMobileMenuOpen(true)}
						className="p-2 hover:bg-accent rounded-lg transition-colors"
						aria-label="Open menu"
						type="button"
					>
						<Menu size={24} />
					</button>
				</div>
			</header>

			{/* Mobile Slide-in Menu */}
			{isMobileMenuOpen && (
				<div
					className="md:hidden fixed inset-0 bg-black/50 z-50"
					onClick={() => setIsMobileMenuOpen(false)}
				>
					<aside
						className="fixed top-0 right-0 h-full w-72 bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between p-4 border-b border-border">
							<h2 className="text-lg font-bold">Menu</h2>
							<button
								onClick={() => setIsMobileMenuOpen(false)}
								className="p-2 hover:bg-accent rounded-lg transition-colors"
								aria-label="Close menu"
								type="button"
							>
								<X size={24} />
							</button>
						</div>

						<nav className="flex-1 p-4 space-y-1">
							{NAV_ITEMS.map((item) => {
								const active = isActive(item.to, item.exact);
								return (
									<Link
										key={item.to}
										to={item.to}
										onClick={() => setIsMobileMenuOpen(false)}
										className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
											active
												? "bg-primary text-primary-foreground"
												: "hover:bg-accent text-foreground"
										}`}
									>
										<item.icon className="h-5 w-5" />
										<span>{item.label}</span>
									</Link>
								);
							})}
						</nav>

						{user && (
							<div className="p-4 border-t border-border">
								<div className="flex items-center gap-3 mb-3">
									<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
										<span className="text-sm font-semibold text-primary">
											{user?.email?.charAt(0).toUpperCase() || "U"}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium truncate">
											{user?.email}
										</p>
									</div>
								</div>
								<Button
									variant="outline"
									className="w-full"
									onClick={handleSignOut}
								>
									<LogOut className="mr-2 h-4 w-4" />
									Sign Out
								</Button>
							</div>
						)}
					</aside>
				</div>
			)}

			{/* Mobile Bottom Navigation */}
			<nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border z-40 flex items-center justify-around px-2 safe-area-inset-bottom">
				{NAV_ITEMS.slice(0, 4).map((item) => {
					const active = isActive(item.to, item.exact);
					return (
						<Link
							key={item.to}
							to={item.to}
							className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
								active
									? "text-primary"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<item.icon
								className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`}
							/>
							<span className="text-xs mt-1">{item.label}</span>
						</Link>
					);
				})}
			</nav>

			{/* Spacer for fixed header on mobile */}
			<div className="md:hidden h-14" />
		</>
	);
}
