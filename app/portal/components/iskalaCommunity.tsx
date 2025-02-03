'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Slack } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface CommunityPlatform {
  name: string
  description: string
  icon: JSX.Element
  link: string
  memberCount: number
  backgroundColor: string
}

export default function IskalaCommunity() {
  const communities: CommunityPlatform[] = [
    {
      name: 'WhatsApp Community',
      description: 'Join our WhatsApp group for daily tips, updates, and networking with other Iskala users',
      icon: <MessageCircle className="w-12 h-12 text-green-500" />,
      link: 'https://whatsapp.com/channel/your-community-link',
      memberCount: 1500,
      backgroundColor: 'bg-green-500/10'
    },
    {
      name: 'Slack Community',
      description: 'Connect with the Iskala community on Slack for in-depth discussions and collaboration',
      icon: <Slack className="w-12 h-12 text-blue-500" />,
      link: 'https://join.slack.com/t/your-slack-workspace',
      memberCount: 2300,
      backgroundColor: 'bg-blue-500/10'
    }
  ]

  const handleJoinCommunity = (link: string) => {
    window.open(link, '_blank')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Iskala Community</h1>
        <p className="text-gray-400">Join our vibrant communities and connect with other Iskala users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {communities.map((platform, index) => (
          <motion.div
            key={platform.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`${platform.backgroundColor} backdrop-blur-sm rounded-lg border border-gray-800 overflow-hidden`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-lg bg-gray-800/50">
                  {platform.icon}
                </div>
                <div className="bg-gray-800/50 px-3 py-1 rounded-full">
                  <span className="text-sm text-gray-400">
                    {platform.memberCount.toLocaleString()} members
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">
                {platform.name}
              </h3>
              
              <p className="text-gray-400 mb-6">
                {platform.description}
              </p>

              <Button 
                className="w-full bg-gray-800 hover:bg-gray-700"
                onClick={() => handleJoinCommunity(platform.link)}
              >
                Join Community
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Why Join Our Community?</h2>
        <ul className="space-y-3 text-gray-400">
          <li>• Connect with experienced Iskala users and experts</li>
          <li>• Get instant help and support</li>
          <li>• Share your experiences and learn from others</li>
          <li>• Stay updated with the latest features and best practices</li>
          <li>• Participate in exclusive community events and discussions</li>
        </ul>
      </div>
    </div>
  )
}
