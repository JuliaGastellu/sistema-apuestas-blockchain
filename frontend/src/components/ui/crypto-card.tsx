import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"

interface CryptoCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  glowing?: boolean
}

export function CryptoCard({ title, description, children, className, glowing = false }: CryptoCardProps) {
  return (
    <Card className={cn(
      "border-border bg-card text-card-foreground transition-all duration-300",
      glowing && "shadow-glow border-primary/20",
      className
    )}>
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}