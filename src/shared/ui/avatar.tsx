import * as React from "react"
import { cn } from "@/shared/lib/utils"

export function Avatar({
  name,
  className,
  size = "md",
}: {
  name: string
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const initials = name
    ? name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("")
    : "?"

  const sizeClasses = {
    sm: "h-8 w-8 text-xs font-medium",
    md: "h-11 w-11 text-sm font-semibold",
    lg: "h-14 w-14 text-base font-bold",
  }

  // Modern vibrant gradients
  const gradients = [
    "from-blue-500 to-indigo-600 ring-blue-500/30",
    "from-violet-500 to-purple-600 ring-violet-500/30",
    "from-emerald-400 to-teal-600 ring-emerald-500/30",
    "from-amber-400 to-orange-500 ring-amber-500/30",
    "from-rose-500 to-pink-600 ring-rose-500/30",
    "from-cyan-400 to-blue-600 ring-cyan-500/30",
  ]
  const charCodeSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const gradientClass = gradients[charCodeSum % gradients.length]

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl text-white shadow-md select-none bg-gradient-to-tr ring-1 ring-inset transition-transform duration-200",
        sizeClasses[size],
        gradientClass,
        className
      )}
    >
      {initials}
    </div>
  )
}
