import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'loading' | 'success' | 'error' | 'warning'
  children: React.ReactNode
  className?: string
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const statusStyles = {
    online: 'bg-gradient-success text-white',
    offline: 'bg-gradient-danger text-white',
    loading: 'bg-accent/20 text-accent animate-pulse',
    success: 'bg-gradient-success text-white',
    error: 'bg-gradient-danger text-white',
    warning: 'bg-accent/20 text-accent'
  }

  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-300",
      statusStyles[status],
      className
    )}>
      {children}
    </span>
  )
}