import { Link, useNavigate } from "@tanstack/react-router";
import { Home, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Button } from "./ui/button";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);
	const { user, signOut } = useAuth();
	const navigate = useNavigate();

	const handleSignOut = async () => {
		await signOut();
		navigate({ to: "/login" });
	};

	return (
		<>
			<header className="p-4 flex items-center justify-between bg-background border-b border-border shadow-lg">
				<div className="flex items-center">
					<button
						onClick={() => setIsOpen(true)}
						className="p-2 hover:bg-accent rounded-lg transition-colors"
						aria-label="Open menu"
						type="button"
					>
						<Menu size={24} />
					</button>
					<h1 className="ml-4 text-xl font-semibold">
						<Link to="/">
							<img
								src="/tanstack-word-logo-white.svg"
								alt="TanStack Logo"
								className="h-10 dark:invert"
							/>
						</Link>
					</h1>
				</div>
				<div className="flex items-center gap-2">
					<ThemeSwitcher />
					{user ? (
						<>
							<span className="text-sm text-muted-foreground hidden sm:inline">
								{user.email}
							</span>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleSignOut}
								aria-label="Sign out"
							>
								<LogOut size={20} />
							</Button>
						</>
					) : (
						<Link to="/login">
							<Button variant="outline" size="sm">
								Sign In
							</Button>
						</Link>
					)}
				</div>
			</header>

			<aside
				className={`fixed top-0 left-0 h-full w-80 bg-background border-r border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between p-4 border-b border-border">
					<h2 className="text-xl font-bold">Navigation</h2>
					<button
						onClick={() => setIsOpen(false)}
						className="p-2 hover:bg-accent rounded-lg transition-colors"
						aria-label="Close menu"
						type="button"
					>
						<X size={24} />
					</button>
				</div>

				<nav className="flex-1 p-4 overflow-y-auto">
					<Link
						to="/"
						onClick={() => setIsOpen(false)}
						className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
						activeProps={{
							className:
								"flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-2",
						}}
					>
						<Home size={20} />
						<span className="font-medium">Home</span>
					</Link>

					{!user && (
						<>
							<Link
								to="/login"
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
								activeProps={{
									className:
										"flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-2",
								}}
							>
								<span className="font-medium">Sign In</span>
							</Link>
							<Link
								to="/signup"
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
								activeProps={{
									className:
										"flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-2",
								}}
							>
								<span className="font-medium">Sign Up</span>
							</Link>
						</>
					)}

					{/* Demo Links Start */}

					{/* Demo Links End */}
				</nav>
			</aside>
		</>
	);
}
