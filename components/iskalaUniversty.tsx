'use client'

import { motion } from 'framer-motion'
import { Book, Clock, Award } from 'lucide-react'
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

export default function UniversitySection() {
  return (
    <motion.section 
      className="py-20 bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 font-heading"
          variants={itemVariants}
        >
          iSkala University: Master the Art of Cold Emailing
        </motion.h2>
        
        <motion.p 
          className="text-xl mb-12 text-center text-gray-600 max-w-3xl mx-auto font-sans"
          variants={itemVariants}
        >
          Elevate your cold emailing skills with our comprehensive courses designed to turn you into a lead generation expert.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <FeatureCard
            icon={<Book className="w-8 h-8" />}
            title="Expert-Led Courses"
            description="Learn from industry professionals with years of experience in B2B sales and email marketing."
          />
          <FeatureCard
            icon={<Clock className="w-8 h-8" />}
            title="10+ Hours of Content"
            description="Access over 10 hours of in-depth learning materials, including video lectures, case studies, and practical exercises."
          />
          <FeatureCard
            icon={<Award className="w-8 h-8" />}
            title="Certification"
            description="Earn an iSkala Cold Email Specialist certification upon completion of the course."
          />
        </div>

        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <Link href="/iskala-university">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-300 font-heading">
              Access iSkala University
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  )
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.05 }}
      className="bg-white p-6 rounded-lg shadow-lg border border-gray-100"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="text-blue-600 bg-blue-50 p-3 rounded-full">
          {icon}
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 font-heading">{title}</h3>
      </div>
      <p className="text-gray-600 text-lg leading-relaxed font-sans">{description}</p>
    </motion.div>
  )
}