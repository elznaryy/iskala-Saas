'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { RotateCcw, Zap, LineChart, Workflow } from 'lucide-react'

const features = [
  {
    icon: <Zap className="w-10 h-10 text-blue-600" />,
    title: "Automate Your Entire Lead Generation Process",
    description: "Use the most powerful cold emailing API infrastructure in the market to auto-create and manage cold email campaigns."
  },
  {
    icon: <RotateCcw className="w-10 h-10 text-blue-600" />,
    title: "Save 100s Of Hours With Auto-Mailbox Rotation",
    description: "Stop launching multiple campaigns for each mailbox. iLead will auto-rotate your mailboxes across your leads."
  },
  {
    icon: <Workflow className="w-10 h-10 text-blue-600" />,
    title: "Automate Scenarios Using Your Leads' Behaviour",
    description: "Create sub-sequences based on your leads' intentions. Close deals without any manual work."
  },
  {
    icon: <LineChart className="w-10 h-10 text-blue-600" />,
    title: "Track Relevant Data & Improve Conversions",
    description: "Measure what works and easily double down on the best email sequence with best cold outreach automation."
  }
]

export default function AutomationFeatures() {
  return (
    <section className="w-full py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <motion.div 
            className="flex-1 space-y-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">Supercharge</span> Your Lead Generation Strategy with iLead AI
            </h2>
            <div className="grid gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex gap-4 items-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 p-2 bg-blue-50 rounded-2xl">
                    {feature.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-3xl opacity-20" />
              <Image
                src="/images/smart.svg"
                alt="iLead Platform Interface"
                width={600}
                height={400}
                className="relative rounded-3xl shadow-2xl"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}