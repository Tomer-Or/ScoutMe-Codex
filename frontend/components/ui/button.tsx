import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-brand-primary px-5 py-3 text-white shadow-[0_10px_30px_rgba(16,185,129,0.22)] hover:-translate-y-0.5 hover:bg-[#0da271]",
        secondary: "bg-white px-5 py-3 text-brand-text ring-1 ring-brand-border hover:-translate-y-0.5 hover:bg-[#f4f8f4]",
        ghost: "px-3 py-2 text-slate-700 hover:bg-white/70"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, ...props }, ref) => (
  <button className={cn(buttonVariants({ variant }), className)} ref={ref} {...props} />
));

Button.displayName = "Button";

export { Button, buttonVariants };
