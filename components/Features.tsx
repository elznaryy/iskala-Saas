'use client'

import { motion } from 'framer-motion'
import { Mail, Target, BarChart2, Users } from 'lucide-react'

const features = [
  {
    icon: <Mail className="h-12 w-12 text-blue-600" />,
    title: "Automated Outreach",
    description: "Set up personalized email sequences that automatically engage your prospects at scale."
  },
  {
    icon: <Target className="h-12 w-12 text-blue-600" />,
    title: "Smart Lead Targeting",
    description: "Use AI-powered algorithms to identify and prioritize your most promising leads."
  },
  {
    icon: <BarChart2 className="h-12 w-12 text-blue-600" />,
    title: "Performance Analytics",
    description: "Track your campaign performance with detailed analytics and actionable insights."
  },
  {
    icon: <Users className="h-12 w-12 text-blue-600" />,
    title: "Team Collaboration",
    description: "Seamlessly collaborate with your team members on lead generation campaigns."
  }
]

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
          >
            Powerful Features to Supercharge Your{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              Lead Generation
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto"
          >
            Everything you need to streamline your outreach and convert more leads.
          </motion.p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}