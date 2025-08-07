import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"
import { forwardRef } from "react"

interface GradientButtonProps extends ButtonProps {
  gradient?: 'primary' | 'success' | 'danger' | 'secondary'
  glowing?: boolean
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, gradient = 'primary', glowing = false, ...props }, ref) => {
    const gradientClasses = {
      primary: 'bg-gradient-primary',
      success: 'bg-gradient-success',
      danger: 'bg-gradient-danger',
      secondary: 'bg-gradient-secondary'
    }

    return (
      <Button
        className={cn(
          gradientClasses[gradient],
          "text-white border-0 shadow-crypto transition-all duration-300 hover:scale-105",
          glowing && "shadow-glow",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

GradientButton.displayName = "GradientButton"