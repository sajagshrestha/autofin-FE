import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	CreditCard,
	FolderTree,
	Lightbulb,
	Mail,
	ShieldCheck,
	Sparkles,
	TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

const FEATURES = [
	{
		icon: Mail,
		title: "Gmail Auto-Tracking",
		description:
			"Connect your Gmail account to automatically detect and import transaction alerts from your bank, so you never miss a spend.",
	},
	{
		icon: CreditCard,
		title: "Transaction Tracking",
		description:
			"Automatically track and categorize every transaction across all your bank accounts in one place.",
	},
	{
		icon: FolderTree,
		title: "Smart Categories",
		description:
			"Organize spending with custom categories and intelligent auto-categorization powered by your patterns.",
	},
	{
		icon: Lightbulb,
		title: "Spending Insights",
		description:
			"Discover where your money goes with powerful analytics, trend charts, and actionable insights.",
	},
];

const STEPS = [
	{
		step: 1,
		icon: ShieldCheck,
		title: "Create Your Account",
		description: "Sign up in seconds. Your data is encrypted and secure.",
	},
	{
		step: 2,
		icon: Sparkles,
		title: "Connect Your Gmail",
		description:
			"Link your Gmail account so AutoFin can automatically read bank transaction emails and import them for you.",
	},
	{
		step: 3,
		icon: TrendingUp,
		title: "Get Insights",
		description:
			"Instantly see spending trends, category breakdowns, and monthly reports.",
	},
];

function LandingPage() {
	const { user, loading } = useAuth();

	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground">
			{/* Navbar */}
			<nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<Link to="/" className="flex items-center gap-2">
						<Logo className="h-8" />
					</Link>

					<div className="flex items-center gap-2">
						<ThemeSwitcher />
						{!loading && user ? (
							<Button asChild size="sm">
								<Link to="/dashboard">
									Dashboard
									<ArrowRight className="ml-1 h-4 w-4" />
								</Link>
							</Button>
						) : (
							<>
								<Button variant="ghost" size="sm" asChild>
									<Link to="/login">Log in</Link>
								</Button>
								<Button size="sm" asChild>
									<Link to="/signup">Sign up</Link>
								</Button>
							</>
						)}
					</div>
				</div>
			</nav>

			{/* Hero */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,var(--color-primary)/0.08,transparent)]" />
				<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 text-center">
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
						Take Control of
						<br />
						<span className="text-primary">Your Finances</span>
					</h1>
					<p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
						Connect your Gmail to automatically track transactions, manage
						categories, and understand your spending patterns — all in one
						beautiful, intuitive dashboard.
					</p>
					<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
						{!loading && user ? (
							<Button size="lg" asChild className="text-base px-8">
								<Link to="/dashboard">
									Go to Dashboard
									<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							</Button>
						) : (
							<>
								<Button size="lg" asChild className="text-base px-8">
									<Link to="/signup">
										Get Started Free
										<ArrowRight className="ml-2 h-5 w-5" />
									</Link>
								</Button>
								<Button
									size="lg"
									variant="outline"
									asChild
									className="text-base px-8"
								>
									<Link to="/login">Log in</Link>
								</Button>
							</>
						)}
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="border-t border-border bg-muted/30">
				<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
					<div className="text-center mb-14">
						<h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
							Everything you need to manage your money
						</h2>
						<p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
							Powerful features designed to give you full visibility and control
							over your personal finances.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{FEATURES.map((feature) => (
							<Card
								key={feature.title}
								className="group relative overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
							>
								<CardContent className="p-8">
									<div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
										<feature.icon className="h-6 w-6" />
									</div>
									<h3 className="text-xl font-semibold mb-2">
										{feature.title}
									</h3>
									<p className="text-muted-foreground leading-relaxed">
										{feature.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="border-t border-border">
				<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
					<div className="text-center mb-14">
						<h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
							Up and running in minutes
						</h2>
						<p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
							Three simple steps to gain complete clarity over your spending.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{STEPS.map((item) => (
							<div key={item.step} className="text-center">
								<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
									{item.step}
								</div>
								<div className="mb-3 flex items-center justify-center gap-2">
									<item.icon className="h-5 w-5 text-primary" />
									<h3 className="text-lg font-semibold">{item.title}</h3>
								</div>
								<p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-border bg-muted/30">
				<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
					<h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
						Ready to take control?
					</h2>
					<p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
						Join AutoFin and start understanding your money better today.
					</p>
					<div className="mt-8">
						{!loading && user ? (
							<Button size="lg" asChild className="text-base px-8">
								<Link to="/dashboard">
									Open Dashboard
									<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							</Button>
						) : (
							<Button size="lg" asChild className="text-base px-8">
								<Link to="/signup">
									Get Started Free
									<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							</Button>
						)}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border">
				<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<Logo className="h-4" />
						<span>&copy; {new Date().getFullYear()}</span>
					</div>
					<div className="flex items-center gap-4">
						<Link
							to="/privacy"
							className="hover:text-foreground transition-colors"
						>
							Privacy Policy
						</Link>
						<Link
							to="/terms"
							className="hover:text-foreground transition-colors"
						>
							Terms & Conditions
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
