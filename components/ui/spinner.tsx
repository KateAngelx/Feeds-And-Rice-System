import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string
}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin", className)}
      {...props}
    />
  )
}
