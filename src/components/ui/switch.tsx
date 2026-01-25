import * as React from "react"

import { cn } from "@/lib/utils"

export interface SwitchProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
	({ className, ...props }, ref) => {
		return (
			<label className="inline-flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					className="peer sr-only"
					ref={ref}
					{...props}
				/>
				<div
					className={cn(
						"relative h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-input transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 peer-checked:bg-primary",
						className
					)}
				>
					<span
						className={cn(
							"pointer-events-none block h-4 w-4 translate-x-0.5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out peer-checked:translate-x-[18px]"
						)}
					/>
				</div>
			</label>
		)
	}
)
Switch.displayName = "Switch"

export { Switch }
