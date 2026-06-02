import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-default)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)] shadow-sm",
        secondary:
          "bg-[var(--color-secondary)] text-[var(--color-on-secondary)] hover:opacity-90 shadow-sm",
        outline:
          "border border-[var(--color-outline-variant)] bg-transparent hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)]",
        ghost:
          "hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)]",
        danger:
          "bg-[var(--color-error)] text-[var(--color-on-error)] hover:opacity-90 shadow-sm",
        link:
          "text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] underline-offset-4",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-[var(--radius-sm)] px-3 text-xs",
        lg: "h-12 rounded-[var(--radius-md)] px-8 text-base",
        xl: "h-14 rounded-xl px-8 text-lg font-bold",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

type ButtonBaseProps = VariantProps<typeof buttonVariants> & {
  className?: string
  children?: React.ReactNode
}

// Polymorphic: renders <button> by default, or any element via `as` prop
type ButtonProps<C extends React.ElementType = "button"> = ButtonBaseProps & {
  as?: C
} & Omit<React.ComponentPropsWithRef<C>, keyof ButtonBaseProps | "as">

function ButtonInner<C extends React.ElementType = "button">(
  { as, className, variant, size, fullWidth, ...props }: ButtonProps<C>,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const Component = as || "button"
  return (
    <Component
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      ref={ref}
      {...props}
    />
  )
}

const Button = React.forwardRef(ButtonInner) as <
  C extends React.ElementType = "button"
>(
  props: ButtonProps<C> & { ref?: React.ForwardedRef<HTMLButtonElement> }
) => React.ReactElement | null

export { Button, buttonVariants }
export type { ButtonProps }
