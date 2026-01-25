import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/signup')({
	component: SignupPage,
})

function SignupPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const [loading, setLoading] = useState(false)
	const { signUp } = useAuth()
	const navigate = useNavigate()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		if (password !== confirmPassword) {
			setError('Passwords do not match')
			return
		}

		if (password.length < 6) {
			setError('Password must be at least 6 characters')
			return
		}

		setLoading(true)

		const { error } = await signUp(email, password)

		if (error) {
			setError(error.message)
			setLoading(false)
		} else {
			setSuccess(true)
			setLoading(false)
			// Redirect to login after a short delay
			setTimeout(() => {
				navigate({ to: '/login' })
			}, 2000)
		}
	}

	if (success) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Check your email</CardTitle>
						<CardDescription>
							We've sent you a confirmation email. Please verify your email
							address to complete signup.
						</CardDescription>
					</CardHeader>
					<CardFooter>
						<Button
							className="w-full"
							onClick={() => navigate({ to: '/login' })}
						>
							Go to Login
						</Button>
					</CardFooter>
				</Card>
			</div>
		)
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Sign Up</CardTitle>
					<CardDescription>
						Create an account to get started
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						{error && (
							<div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
								{error}
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={loading}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={loading}
								minLength={6}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								disabled={loading}
								minLength={6}
							/>
						</div>
					</CardContent>
					<CardFooter className="flex flex-col space-y-4">
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? 'Creating account...' : 'Sign Up'}
						</Button>
						<p className="text-center text-sm text-muted-foreground">
							Already have an account?{' '}
							<Link
								to="/login"
								className="text-primary hover:underline font-medium"
							>
								Sign in
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	)
}
