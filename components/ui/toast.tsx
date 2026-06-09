import * as React from "react"
import { cn } from "@/lib/utils"

export const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white border rounded-md shadow p-4",
      className
    )}
    {...props}
  />
))
Toast.displayName = "Toast"

export const ToastTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h4 className={cn("font-semibold text-sm", className)} {...props} />
)

export const ToastDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
)