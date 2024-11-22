'use client'

import { Calendar, Mail, Shield, Users, Building, Signal, RefreshCcw, Globe, Link2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

interface DataCardProps {
  icon: React.ReactNode
  number: string
  label: string
  color: string
}

interface NetworkFeatureProps {
  icon: React.ReactNode
  text: string
}

export default function AdvancedFeatures() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Unlock Your Sales Potential with iSkala</h2>
          <p className="text-xl text-blue-100">Elevate your B2B outreach with our cutting-edge features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<Calendar className="w-12 h-12 text-blue-600" />}
            title="Expert 1:1 Consultations"
            description="Schedule personalized meetings with our sales experts to refine your strategy and boost conversions."
          />
          <FeatureCard
            icon={<Mail className="w-12 h-12 text-blue-600" />}
            title="Custom Email Strategies"
            description="Get tailored email copy and campaign strategies designed to engage your target audience effectively."
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12 text-blue-600" />}
            title="Email Infrastructure Audit"
            description="Optimize your email deliverability with our comprehensive infrastructure testing and auditing services."
          />
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 lg:p-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Easily explore the most accurate B2B data</h3>
            <p className="text-lg text-gray-600 mb-8">
              We've revolutionized data delivery, changing the game in B2B prospecting. Our Living Data Network, powered by over 2 million users, ensures unparalleled data freshness and depth.
            </p>
            
            <div className="mb-12">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <DataCard
                  icon={<Users className="w-6 h-6" />}
                  number="275M"
                  label="Total Global Contacts"
                  color="bg-green-400"
                />
                <DataCard
                  icon={<Building className="w-6 h-6" />}
                  number="73M"
                  label="Total Accounts"
                  color="bg-blue-500"
                />
                <DataCard
                  icon={<Mail className="w-6 h-6" />}
                  number="97.5%"
                  label="Email Accuracy"
                  color="bg-yellow-400"
                />
                <DataCard
                  icon={<Signal className="w-6 h-6" />}
                  number="15k"
                  label="Intent Signals"
                  color="bg-purple-400"
                />
                <DataCard
                  icon={<RefreshCcw className="w-6 h-6" />}
                  number="90M"
                  label="Contacts Verified Monthly"
                  color="bg-orange-400"
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-8">LIVING DATA NETWORK</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NetworkFeature icon={<Users />} text="2M contributors" />
                <NetworkFeature icon={<Signal />} text="650M touchpoints" />
                <NetworkFeature icon={<Globe />} text="Public data crawling" />
                <NetworkFeature icon={<Link2 />} text="Third-party providers" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  )
}

function DataCard({ icon, number, label, color }: DataCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="bg-white p-4 rounded-lg shadow-md"
    >
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mb-3 text-white`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-800">{number}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </motion.div>
  )
}

function NetworkFeature({ icon, text }: NetworkFeatureProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="bg-blue-50 p-4 rounded-lg flex items-center space-x-2"
    >
      <div className="text-blue-600">{icon}</div>
      <span className="text-gray-800 font-medium">{text}</span>
    </motion.div>
  )
}