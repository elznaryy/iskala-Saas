'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { auth } from '@/lib/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import localFont from "next/font/local"
import "./globals.css"
import ZohoChat from '@/components/ui/ZohoChat'
import { metadata } from './metadata'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If user is authenticated and trying to access public routes
      if (user && (pathname === '/login' || pathname === '/signup')) {
        router.replace('/portal')
      }
    })

    return () => unsubscribe()
  }, [pathname, router])

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <ZohoChat />
      </body>
    </html>
  )
}
