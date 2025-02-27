'use client'

import { Linkedin, Youtube } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  // Add this function to handle opening Zoho chat
  const openZohoChat = () => {
    if (typeof window !== 'undefined' && window.$zoho && window.$zoho.salesiq) {
      window.$zoho.salesiq.floatwindow.visible('show')
    }
  }

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
              <Link href="https://www.linkedin.com/company/iskalallc/" aria-label="LinkedIn">
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
                <li>
                  <Link 
                    href="/#pricing" 
                    className="hover:text-blue-200 transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-200 transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-blue-100">Support</h3>
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={openZohoChat}
                    className="hover:text-blue-200 transition-colors"
                  >
                    Help Desk
                  </button>
                </li>
                <li>
                  <Link 
                    href="https://join.slack.com/t/iskalaacademy/shared_invite/zt-2ztzewq8k-AZbZ47Ls3LDvSeFCAPnIXg" 
                    target="_blank"
                    className="hover:text-blue-200 transition-colors"
                  >
                    Slack Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-blue-100">Company</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="#" className="hover:text-blue-200 transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-200 transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-200 transition-colors">
                    Don't Sell My Info
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-200 transition-colors">
                    Privacy Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-200 transition-colors">
                    Cookie Declaration
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}