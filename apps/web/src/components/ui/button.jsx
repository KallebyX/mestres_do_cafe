import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-brand-brown text-white shadow-md hover:bg-brand-brown/90 hover:shadow-lg hover:shadow-brand-brown/25",
        destructive:
          "bg-error-500 text-white shadow-md hover:bg-error-600 focus-visible:ring-error-500/50",
        outline:
          "border-2 border-brand-brown bg-transparent text-brand-brown hover:bg-brand-brown hover:text-white",
        secondary:
          "bg-secondary text-secondary-foreground border border-border shadow-sm hover:bg-secondary/80 hover:border-brand-brown/30",
        ghost:
          "bg-transparent text-foreground hover:bg-muted hover:text-brand-brown",
        link:
          "text-brand-brown underline-offset-4 hover:underline p-0 h-auto",
        premium:
          "bg-gradient-to-r from-brand-brown via-brand-gold to-brand-brown text-white shadow-lg hover:shadow-xl hover:shadow-brand-brown/30 bg-[length:200%_100%] hover:bg-right transition-all duration-500",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 rounded-lg gap-1.5 px-3 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0 rounded-lg",
        "icon-lg": "h-12 w-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants }
