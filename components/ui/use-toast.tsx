"use client"

import * as React from "react"
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner"

type ToasterProps = React.ComponentPropsWithoutRef<typeof SonnerToaster>

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-gray-800 group-[.toaster]:text-white group-[.toaster]:border-gray-700 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-400",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-600 group-[.toast]:text-gray-200",
        },
      }}
      {...props}
    />
  )
}

export function toast({
  title,
  description,
  variant = "default",
}: {
  title: string
  description?: string
  variant?: "default" | "destructive"
}) {
  return sonnerToast(title, {
    description,
    style: {
      background: "#1f2937",
      border: "1px solid #374151",
      color: variant === "destructive" ? "#ef4444" : "#ffffff",
    },
  })
} 