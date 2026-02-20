import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/terms")({
	component: TermsPage,
});

function TermsPage() {
	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground">
			{/* Navbar */}
			<nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<Link to="/" className="flex items-center gap-2">
						<Logo className="h-7" />
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
					Terms & Conditions
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
						<h2 className="text-2xl font-semibold mb-3">
							1. Acceptance of Terms
						</h2>
						<p>
							By accessing or using AutoFin, you agree to be bound by these
							Terms and Conditions. If you do not agree to all the terms and
							conditions, you may not access or use the application. These terms
							apply to all visitors, users, and others who access or use the
							service.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">
							2. Description of Service
						</h2>
						<p>
							AutoFin is a personal finance management application that allows
							users to track transactions, manage spending categories, and view
							analytics and insights about their financial habits. AutoFin
							offers an optional Gmail integration that automatically reads bank
							transaction alert emails from your connected Google account to
							import and track your transactions. The service is provided "as
							is" and is intended for personal, non-commercial use.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
						<p className="mb-3">
							When you create an account with us, you must provide accurate,
							complete, and current information. You are responsible for:
						</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>
								Maintaining the confidentiality of your account credentials.
							</li>
							<li>All activities that occur under your account.</li>
							<li>
								Notifying us immediately of any unauthorized use of your
								account.
							</li>
						</ul>
						<p className="mt-3">
							We reserve the right to suspend or terminate accounts that violate
							these terms or are inactive for an extended period.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">
							4. User Data and Content
						</h2>
						<p>
							You retain ownership of all financial data and content you enter
							into AutoFin, including data imported via the Gmail integration.
							By using the service, you grant us a limited license to process,
							store, and display your data solely for the purpose of providing
							the service to you. When you connect your Gmail account, you
							authorize AutoFin to access your emails in read-only mode to
							identify and extract bank transaction alerts. We will not use your
							financial data or email content for any other purpose without your
							explicit consent.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">5. Acceptable Use</h2>
						<p className="mb-3">You agree not to:</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>
								Use the service for any unlawful purpose or in violation of any
								applicable laws or regulations.
							</li>
							<li>
								Attempt to gain unauthorized access to the service, other user
								accounts, or any computer systems or networks.
							</li>
							<li>
								Interfere with or disrupt the service or servers or networks
								connected to the service.
							</li>
							<li>
								Use automated means (bots, scrapers, etc.) to access the service
								without our prior written consent.
							</li>
							<li>
								Upload or transmit viruses, malware, or any other malicious
								code.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">
							6. Gmail Integration &amp; Automated Tracking
						</h2>
						<p className="mb-3">
							AutoFin provides an optional feature that connects to your Gmail
							account to automate transaction tracking. By enabling this
							feature, you acknowledge and agree to the following:
						</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>
								You grant AutoFin read-only access to your Gmail inbox for the
								sole purpose of scanning and extracting bank transaction alert
								emails (e.g., debit/credit notifications, payment
								confirmations).
							</li>
							<li>
								AutoFin does not read, store, or process any emails beyond those
								matching financial transaction patterns. Non-matching emails are
								never accessed or retained.
							</li>
							<li>
								Transaction data extracted from emails (amount, merchant, date,
								bank name) is stored in your AutoFin account and treated with
								the same security protections as all other user data.
							</li>
							<li>
								You may disconnect your Gmail account at any time through your
								AutoFin settings or by revoking access from your Google Account
								permissions page. Upon disconnection, AutoFin will stop
								accessing your Gmail.
							</li>
							<li>
								AutoFin's use of Google API data complies with the Google API
								Services User Data Policy, including the Limited Use
								requirements. Data obtained through Google APIs is not shared
								with or sold to third parties.
							</li>
							<li>
								AutoFin is not responsible for delays, inaccuracies, or missed
								transactions resulting from changes in email formats, Gmail API
								availability, or bank notification practices.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">
							7. Financial Disclaimer
						</h2>
						<p>
							AutoFin is a tool for tracking and visualizing your personal
							finances. It does not provide financial advice, investment
							recommendations, or tax guidance. The analytics and insights
							generated by the application are for informational purposes only.
							You should consult a qualified financial professional before
							making any financial decisions. We are not responsible for any
							financial losses or decisions made based on information displayed
							in the application.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">
							8. Limitation of Liability
						</h2>
						<p>
							To the maximum extent permitted by applicable law, AutoFin and its
							creators shall not be liable for any indirect, incidental,
							special, consequential, or punitive damages, including but not
							limited to loss of profits, data, or goodwill, resulting from your
							access to or use of the service, even if we have been advised of
							the possibility of such damages.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">
							9. Service Availability
						</h2>
						<p>
							We strive to maintain high availability of the service but do not
							guarantee uninterrupted access. The service may be temporarily
							unavailable due to maintenance, updates, or circumstances beyond
							our control. We reserve the right to modify, suspend, or
							discontinue the service at any time without prior notice.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">
							10. Intellectual Property
						</h2>
						<p>
							The AutoFin application, including its design, code, features,
							logos, and documentation, is the intellectual property of AutoFin
							and is protected by copyright and other intellectual property
							laws. You may not copy, modify, distribute, or create derivative
							works based on the application without our prior written consent.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">11. Termination</h2>
						<p>
							We may terminate or suspend your access to the service
							immediately, without prior notice or liability, for any reason,
							including if you breach these Terms and Conditions. Upon
							termination, your right to use the service will immediately cease.
							You may also delete your account at any time. All provisions of
							these terms which by their nature should survive termination shall
							survive.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">
							12. Changes to Terms
						</h2>
						<p>
							We reserve the right to modify or replace these terms at any time.
							Material changes will be communicated by posting the updated terms
							on this page. Your continued use of the service after any changes
							constitutes acceptance of the new terms.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">13. Governing Law</h2>
						<p>
							These terms shall be governed by and construed in accordance with
							applicable laws, without regard to conflict of law provisions. Any
							disputes arising under these terms shall be resolved through good
							faith negotiation, and if necessary, through binding arbitration.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">14. Contact Us</h2>
						<p>
							If you have any questions about these Terms and Conditions, please
							contact us at{" "}
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
						<Logo className="h-4" />
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
