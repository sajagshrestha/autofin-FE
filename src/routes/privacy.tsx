import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
	component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground">
			{/* Navbar */}
			<nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<Link to="/" className="flex items-center gap-2">
						<BarChart3 className="h-7 w-7 text-primary" />
						<span className="text-2xl font-bold tracking-tight">AutoFin</span>
					</Link>
					<ThemeSwitcher />
				</div>
			</nav>

			<main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
				<Button variant="ghost" size="sm" asChild className="mb-8">
					<Link to="/">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Home
					</Link>
				</Button>

				<h1 className="text-4xl font-bold tracking-tight mb-2">
					Privacy Policy
				</h1>
				<p className="text-muted-foreground mb-10">
					Last updated:{" "}
					{new Date().toLocaleDateString("en-US", {
						month: "long",
						day: "numeric",
						year: "numeric",
					})}
				</p>

				<div className="prose-style space-y-8 text-foreground/90 leading-relaxed">
					<section>
						<h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
						<p>
							Welcome to AutoFin. We respect your privacy and are committed to
							protecting your personal data. This privacy policy explains how we
							collect, use, and safeguard your information when you use our
							personal finance management application.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">
							2. Information We Collect
						</h2>
						<p className="mb-3">
							We collect the following types of information to provide and
							improve our services:
						</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>
								<strong>Account Information:</strong> Email address and password
								when you create an account.
							</li>
							<li>
								<strong>Financial Data:</strong> Transaction details, amounts,
								dates, categories, and bank names that you manually enter or
								import into the application.
							</li>
							<li>
								<strong>Usage Data:</strong> How you interact with the
								application, including pages visited, features used, and
								preferences.
							</li>
							<li>
								<strong>Device Information:</strong> Browser type, operating
								system, and device identifiers for security and compatibility
								purposes.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">
							3. How We Use Your Information
						</h2>
						<ul className="list-disc pl-6 space-y-2">
							<li>
								To provide, maintain, and improve the AutoFin application and
								its features.
							</li>
							<li>
								To generate spending analytics, insights, and category
								breakdowns based on your transaction data.
							</li>
							<li>To authenticate your identity and secure your account.</li>
							<li>
								To send important service-related notifications and updates.
							</li>
							<li>
								To detect, prevent, and address technical issues or security
								threats.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
						<p>
							We implement industry-standard security measures to protect your
							personal and financial data. All data is encrypted in transit
							using TLS and at rest using AES-256 encryption. We use Supabase
							for authentication and data storage, which provides
							enterprise-grade security infrastructure. However, no method of
							electronic transmission or storage is 100% secure, and we cannot
							guarantee absolute security.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">
							5. Data Sharing and Disclosure
						</h2>
						<p className="mb-3">
							We do not sell, trade, or rent your personal information to third
							parties. We may share your data only in the following
							circumstances:
						</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>
								<strong>Service Providers:</strong> With trusted third-party
								services that help us operate the application (e.g., hosting,
								authentication).
							</li>
							<li>
								<strong>Legal Requirements:</strong> When required by law,
								regulation, or legal process.
							</li>
							<li>
								<strong>Safety:</strong> To protect the rights, property, or
								safety of AutoFin, our users, or the public.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>
						<p>
							We retain your personal data for as long as your account is active
							or as needed to provide you services. You can request deletion of
							your account and associated data at any time by contacting us. We
							will delete your data within 30 days of such a request, unless we
							are legally required to retain it.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">7. Your Rights</h2>
						<p className="mb-3">You have the right to:</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>Access and receive a copy of your personal data.</li>
							<li>Correct any inaccurate or incomplete personal data.</li>
							<li>Request deletion of your personal data.</li>
							<li>Export your data in a portable format.</li>
							<li>Withdraw consent for data processing at any time.</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">8. Cookies</h2>
						<p>
							AutoFin uses essential cookies and local storage to maintain your
							authentication session and theme preferences. We do not use
							third-party tracking cookies or advertising cookies.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">
							9. Changes to This Policy
						</h2>
						<p>
							We may update this privacy policy from time to time. We will
							notify you of any material changes by posting the new policy on
							this page and updating the "Last updated" date. Your continued use
							of the application after changes are posted constitutes your
							acceptance of the revised policy.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
						<p>
							If you have any questions about this privacy policy or our data
							practices, please contact us at{" "}
							<a
								href="mailto:support@autofin.app"
								className="text-primary hover:underline font-medium"
							>
								support@autofin.app
							</a>
							.
						</p>
					</section>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t border-border mt-16">
				<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<BarChart3 className="h-4 w-4" />
						<span>&copy; {new Date().getFullYear()} AutoFin</span>
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
