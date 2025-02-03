'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute top-0 left-0 right-0 z-40 w-full"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/Asset2.png"
                alt="iSkala Logo"
                width={150}
                height={50}
                className="w-auto h-8"
                priority
              />
            </Link>
          </div>
          <nav className="hidden md:flex space-x-10">
            <div className="flex items-center space-x-2">
              <Link href="/ai-email-strategy" className="text-gray-300 hover:text-white transition-colors">
                AI Email Strategy
              </Link>
              <Badge variant="secondary" className="bg-blue-600 text-white">
                BETA
              </Badge>
            </div>
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
            <Link href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</Link>
            <Link href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-300 hover:text-white" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-gray-900 bg-opacity-95"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="flex items-center px-3 py-2">
              <Link href="/ai-email-strategy" className="text-base font-medium text-gray-300 hover:text-white">
                AI Email Strategy
              </Link>
              <Badge variant="secondary" className="ml-2 bg-blue-600 text-white">
                BETA
              </Badge>
            </div>
            <Link href="#features" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white">Features</Link>
            <Link href="#pricing" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white">Pricing</Link>
            <Link href="#testimonials" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white">Testimonials</Link>
            <Link href="#contact" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white">Contact</Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              <Button variant="ghost" asChild className="w-full text-gray-300 hover:text-white">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Button asChild className="w-full">
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}