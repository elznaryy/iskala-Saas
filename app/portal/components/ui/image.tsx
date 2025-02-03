"use client"

import NextImage, { ImageProps as NextImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface ImageProps extends NextImageProps {
  className?: string
}

export const Image = ({ className, alt, ...props }: ImageProps) => {
  return (
    <NextImage
      className={cn("", className)}
      alt={alt}
      {...props}
    />
  )
} 