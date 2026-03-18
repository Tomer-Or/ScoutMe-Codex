import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    className={cn(
      "flex h-11 w-full rounded-2xl border border-brand-border bg-white px-4 py-2 text-sm text-brand-text outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-emerald-100",
      className
    )}
    ref={ref}
    {...props}
  />
));

Input.displayName = "Input";

export { Input };
