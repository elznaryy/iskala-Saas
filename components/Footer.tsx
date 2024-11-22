'use client'

import { Facebook, Linkedin, Youtube } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center space-x-2">
              <div className="bg-white p-2 rounded-full">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 text-2xl font-bold">iSkala</span>
              </div>
            </div>
            <div className="flex space-x-4 mt-4">
              <Link href="#" aria-label="Facebook">
                <Facebook className="w-6 h-6 hover:text-blue-200 transition-colors" />
              </Link>
              <Link href="#" aria-label="LinkedIn">
                <Linkedin className="w-6 h-6 hover:text-blue-200 transition-colors" />
              </Link>
              <Link href="#" aria-label="YouTube">
                <Youtube className="w-6 h-6 hover:text-blue-200 transition-colors" />
              </Link>
            </div>
            <p className="mt-4 text-sm">
              &copy; {new Date().getFullYear()} iSkala - Sales Engagement & Lead Intelligence
            </p>
          </div>
          <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-12">
            <div>
              <h3 className="font-semibold mb-2 text-blue-100">Quick links</h3>
              <ul className="space-y-1">
                <li><Link href="#" className="hover:text-blue-200 transition-colors">Warmup</Link></li>
                <li><Link href="#" className="hover:text-blue-200 transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-blue-200 transition-colors">CRM</Link></li>
                <li><Link href="#" className="hover:text-blue-200 transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-blue-200 transition-colors">Wall Of Love</Link></li>
                <li><Link href="#" className="hover:text-blue-200 transition-colors">Experts</Link></li>
                <li><Link href="#" className="hover:text-blue-200 transition-colors">Affiliate</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-blue-100">Support</h3>
              <ul className="space-y-1">
                <li><Link href="#" className="hover:text-blue-200 transition-colors">Help Desk</Link></li>
                <li><Link href="#" className="hover:text-blue-200 transition-colors">Roadmap</Link></li>
                <li><Link href="#" className="hover:text-blue-200 transition-colors">Facebook Group</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-blue-100">Company</h3>
              <ul className="space-y-1">
                <li><Link href="#" className="hover:text-blue-200 transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-blue-200 transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-blue-200 transition-colors">Don't Sell My Info</Link></li>
                <li><Link href="#" className="hover:text-blue-200 transition-colors">Privacy Center</Link></li>
                <li><Link href="#" className="hover:text-blue-200 transition-colors">Cookie Declaration</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}