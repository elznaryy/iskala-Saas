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
        <div className="flex h-16 sm:h-20 md:h-24 lg:h-32 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/Asset2.png"
                alt="iSkala Logo"
                width={400}
                height={133}
                className="w-auto h-8 sm:h-12 md:h-16 lg:h-20"
                priority
                unoptimized
              />
            </Link>
          </div>
          <nav className="hidden md:flex space-x-4 lg:space-x-10">
            <div className="flex items-center space-x-2">
              <Link href="/ai-email-strategy" className="text-sm lg:text-base text-gray-300 hover:text-white transition-colors">
                AI Email Strategy
              </Link>
              <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                BETA
              </Badge>
            </div>
            <Link href="#features" className="text-sm lg:text-base text-gray-300 hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm lg:text-base text-gray-300 hover:text-white transition-colors">Pricing</Link>
            <Link href="#testimonials" className="text-sm lg:text-base text-gray-300 hover:text-white transition-colors">Testimonials</Link>
            <Link href="#contact" className="text-sm lg:text-base text-gray-300 hover:text-white transition-colors">Contact</Link>
          </nav>
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <Button variant="ghost" className="text-sm lg:text-base text-gray-300 hover:text-white" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button className="text-sm lg:text-base bg-blue-600 hover:bg-blue-700 text-white" asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
          <div className="px-4 pt-2 pb-3 space-y-1">
            <div className="flex items-center py-2">
              <Link 
                href="/ai-email-strategy" 
                className="text-base text-gray-300 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                AI Email Strategy
              </Link>
              <Badge variant="secondary" className="ml-2 bg-blue-600 text-white">
                BETA
              </Badge>
            </div>
            {['Features', 'Pricing', 'Testimonials', 'Contact'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block py-2 text-base text-gray-300 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex flex-col space-y-3 px-4">
              <Button variant="ghost" asChild className="w-full text-gray-300 hover:text-white">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>Log in</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>Sign up</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}