import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextType {
	theme: Theme
	setTheme: (theme: Theme) => void
	resolvedTheme: 'dark' | 'light'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('theme') as Theme | null
			return stored ?? 'system'
		}
		return 'system'
	})

	const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light')

	useEffect(() => {
		const root = window.document.documentElement

		const getSystemTheme = (): 'dark' | 'light' => {
			return window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light'
		}

		const applyTheme = () => {
			const effectiveTheme = theme === 'system' ? getSystemTheme() : theme
			setResolvedTheme(effectiveTheme)

			if (effectiveTheme === 'dark') {
				root.classList.add('dark')
			} else {
				root.classList.remove('dark')
			}
		}

		applyTheme()

		// Listen for system theme changes
		if (theme === 'system') {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
			const handleChange = () => applyTheme()
			mediaQuery.addEventListener('change', handleChange)
			return () => mediaQuery.removeEventListener('change', handleChange)
		}
	}, [theme])

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme)
		if (typeof window !== 'undefined') {
			localStorage.setItem('theme', newTheme)
		}
	}

	return (
		<ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export function useTheme() {
	const context = useContext(ThemeContext)
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
