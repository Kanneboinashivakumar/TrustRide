import * as React from "react"
import { cn } from "@/utils/cn"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

function Skeleton({ className, width, height, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-shimmer bg-muted rounded-md", className)}
      style={{ width, height, ...style }}
      {...props}
    />
  )
}

export { Skeleton }
