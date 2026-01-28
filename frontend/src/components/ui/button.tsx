import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
{
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      primary: "text-base-secondary bg-base-primary/90 hover:bg-base-primary",
      accent: " text-base-primary bg-base-secondary/80 hover:bg-base-primary/10  border border-blue-400 ",
      destructive:
        "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
      outline:
        "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost:
        "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
      link: "text-primary underline-offset-4 hover:underline",
      icon: "bg-transparent hover:bg-transparent dark:hover:bg-transparent",
      soft: "bg-[#FFDDA8] hover:bg-[#FFDDA8]/60 dark:hover:bg-[#FFDDA8]/90 text-orange-500 border border-orange-500",
      // Add approve and reject variants
      approve: "bg-green-500 text-white hover:bg-green-600 focus-visible:ring-green-400/20 dark:focus-visible:ring-green-400/40",
      reject: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-400/20 dark:focus-visible:ring-red-400/40",
      view: "bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-400/20 dark:focus-visible:ring-blue-400/40",
    },
    size: {
      default: "h-9 px-4 py-2 has-[>svg]:px-3",
      sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
      lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
      icon: "size-9",
      "icon-sm": "size-8",
      "icon-lg": "size-10",
    },
    color: {
      orange: "text-orange-500",
      // You can also add color variants for text/background
      green: "text-green-600",
      red: "text-red-600",
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
}
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
