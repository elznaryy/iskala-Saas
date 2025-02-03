'use client'

import { motion } from 'framer-motion'
import { Mail, Sparkles, ListChecks, Calendar, Megaphone } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.05 }}
      className="bg-[#1B2131] p-4 rounded-lg"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-blue-400">{icon}</div>
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      <p className="text-gray-400 text-sm">{description}</p>
    </motion.div>
  )
}

export default function AIEmailFeatures() {
  return (
    <motion.section 
      className="py-20 bg-[#0D1117]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              Generate your first email copy in seconds
            </h2>
            <p className="text-gray-300 mb-8">
              Our AI-powered assistant helps you create compelling B2B email campaigns with customized content including intro lines, value propositions, credibility statements, and clear CTAs.
            </p>

            <motion.div 
              className="grid sm:grid-cols-2 gap-4 mb-8"
              variants={containerVariants}
            >
              <FeatureCard
                icon={<ListChecks className="w-5 h-5" />}
                title="Follow-up Sequences"
                description="Create engaging follow-up email sequences"
              />
              <FeatureCard
                icon={<Megaphone className="w-5 h-5" />}
                title="Sales Pitch Emails"
                description="Generate persuasive sales pitch emails"
              />
              <FeatureCard
                icon={<Calendar className="w-5 h-5" />}
                title="Meeting Requests"
                description="Write effective meeting request emails"
              />
              <FeatureCard
                icon={<Mail className="w-5 h-5" />}
                title="Nurture Campaigns"
                description="Design complete email nurture campaigns"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link href="/ai-email-strategy">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-300">
                  Try AI Assistant Now
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <div className="bg-[#1B2131] rounded-lg p-6 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-blue-400 text-xl font-semibold">AI Strategy Assistant</h3>
                <Link href="/ai-copy-generator">
                  
                </Link>
              </div>

              <motion.div 
                className="bg-[#151B28] rounded-lg p-8 mb-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="flex justify-center mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-12 h-12 text-blue-400" />
                </motion.div>
                <h4 className="text-white text-xl font-semibold text-center mb-3">
                  Welcome to Your AI Strategy Assistant!
                </h4>
                <p className="text-gray-300 text-center">
                  I'm here to help you create powerful B2B email campaigns using our advanced AI technology. Click the button above to start generating your email copy or explore our email marketing strategies.
                </p>
              </motion.div>

              <motion.div 
                className="flex justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/ai-email-strategy">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-300">
                    Start Generating Email Copy
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
