'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Bot, 
  Users, 
  Mail, 
  GraduationCap, 
  Users2, 
  FileText, 
  CreditCard, 
  Settings,
  X,
  Search,
  ChevronDown,
  Sparkles,
  MessageSquare,
  Settings2,
  Database
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'

declare global {
  interface Window {
    $zoho: {
      salesiq: {
        floatwindow: {
          visible: (action: 'show' | 'hide') => void
        }
      }
    }
  }
}

interface SidebarProps {
  onClose: () => void
}

interface NavItem {
  id: string
  name: string
  icon: React.ReactNode
  href: string
  children?: NavItem[]
}

export default function Sidebar({ onClose }: SidebarProps) {
  const [openGroups, setOpenGroups] = useState<string[]>([])
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      id: 'ai-tools',
      name: 'AI Tools',
      icon: <Bot className="w-5 h-5" />,
      href: '#',
      children: [
        {
          id: 'ai-email',
          name: 'AI Email',
          icon: <Sparkles className="w-4 h-4" />,
          href: '/portal/ai-email'
        },
        {
          id: 'custom-copy',
          name: 'Email Templates',
          icon: <FileText className="w-4 h-4" />,
          href: '/portal/custom-copy'
        }
      ]
    },
    {
      id: 'lead-finder',
      name: 'Lead Finder',
      icon: <Search className="w-5 h-5" />,
      href: '#',
      children: [
        {
          id: 'lead-search',
          name: 'Search',
          icon: <Users className="w-4 h-4" />,
          href: '/portal/lead-finder'
        },
        {
          id: 'customized-prospects',
          name: 'Customized Prospects',
          icon: <Database className="w-4 h-4" />,
          href: '/portal/customized-prospects'
        }
      ]
    },
    {
      id: 'email-accounts',
      name: 'Email Accounts',
      icon: <Mail className="w-5 h-5" />,
      href: '/portal/email-accounts'
    },
    {
      id: 'iskala-university',
      name: 'SmartLead',
      icon: <MessageSquare className="w-5 h-5" />,
      href: '/portal/email-tool'
    },
    {
      id: 'iskala-community',
      name: 'iSkala Community',
      icon: <Users2 className="w-5 h-5" />,
      href: '/portal/community'
    },
    {
      id: 'iskala-email',
      name: 'iSkala University',
      icon: <GraduationCap className="w-5 h-5" />,
      href: '/portal/university'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <Settings2 className="w-5 h-5" />,
      href: '#',
      children: [
        {
          id: 'billing',
          name: 'Billing & Invoicing',
          icon: <CreditCard className="w-4 h-4" />,
          href: '/portal/billing'
        },
        {
          id: 'profile',
          name: 'Profile',
          icon: <Settings className="w-4 h-4" />,
          href: '/portal/profile'
        }
      ]
    }
  ]

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href
    const isGroup = item.children && item.children.length > 0
    const isGroupOpen = openGroups.includes(item.id)

    if (isGroup) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleGroup(item.id)}
            className={`
              w-full flex items-center justify-between px-3 py-2 text-sm
              transition-colors rounded-lg
              ${isGroupOpen ? 'bg-gray-700/50 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/30'}
            `}
          >
            <div className="flex items-center">
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isGroupOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isGroupOpen && item.children && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-4 mt-1 space-y-1"
              >
                {item.children.map(child => renderNavItem(child))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={`
          flex items-center px-3 py-2 text-sm
          transition-colors rounded-lg
          ${isActive ? 'bg-gray-700/50 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/30'}
        `}
        onClick={() => {
          if (window.innerWidth < 1024) {
            onClose()
          }
        }}
      >
        {item.icon}
        <span className="ml-3">{item.name}</span>
      </Link>
    )
  }

  const openZohoChat = () => {
    if (typeof window !== 'undefined' && window.$zoho && window.$zoho.salesiq) {
      window.$zoho.salesiq.floatwindow.visible('show')
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-800/95 backdrop-blur-sm">
      <motion.div 
        className="lg:hidden p-2 flex justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </motion.div>

      <nav className="flex-1 px-2 space-y-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {navItems.map(item => renderNavItem(item))}
      </nav>

      <motion.div 
        className="p-2 border-t border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div 
          onClick={openZohoChat}
          className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/30 cursor-pointer"
        >
          <Users className="w-4 h-4" />
          <span>Need help? Contact support</span>
        </div>
      </motion.div>
    </div>
  )
} 