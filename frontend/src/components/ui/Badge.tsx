import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
        present: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        absent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        late: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        excused: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        unknown: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
        critical: "bg-red-500 text-white",
        warning: "bg-amber-500 text-white",
        good: "bg-emerald-500 text-white",
        secondary: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        outline: "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300",
        active: "bg-emerald-100 text-emerald-800",
        inactive: "bg-slate-100 text-slate-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
