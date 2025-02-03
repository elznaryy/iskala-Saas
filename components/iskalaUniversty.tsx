'use client'

import { Book, Clock, Award } from 'lucide-react'
import { motion } from 'framer-motion'

export default function UniversitySection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              Iskala University:
            </span>{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-600 to-cyan-500">
              Master Cold Emailing
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enhance your outreach skills with our comprehensive learning platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
          >
            <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Book className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Expert-Led Courses</h3>
            <p className="text-gray-600 leading-relaxed">
              Learn from industry professionals with years of experience in B2B outreach and lead generation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
          >
            <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">10+ Hours Content</h3>
            <p className="text-gray-600 leading-relaxed">
              Access comprehensive learning materials, practical exercises, and real-world case studies.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
          >
            <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Get Certified</h3>
            <p className="text-gray-600 leading-relaxed">
              Earn your Cold Email Specialist certification and showcase your expertise.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 
