import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-white transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2170e4] focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 select-none",
  {
    variants: {
      variant: {
        default: "bg-[#0058be] text-white hover:bg-[#004bb0] active:bg-[#003e91] shadow-xs hover:shadow-sm",
        destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs",
        outline: "border border-[#e2e8f0] bg-white text-[#0b1c30] hover:bg-[#eff4ff] hover:border-[#cbd5e1]",
        secondary: "bg-[#eff4ff] text-[#0058be] hover:bg-[#dce9ff] active:bg-[#c9ddff]",
        ghost: "hover:bg-[#eff4ff] hover:text-[#0b1c30] text-[#45464d]",
        link: "text-[#0058be] underline-offset-4 hover:underline",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs",
        warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-xs",
      },
      size: {
        default: "h-10 px-4 py-2 text-xs",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-sm",
        xl: "h-14 rounded-2xl px-10 text-base",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-3.5 w-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

