'use client'

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Get in Touch</h2>
            <p className="text-gray-800 mb-8">
              Have questions about iLead? Want to see how we can supercharge your lead generation? 
              We Are here to help you grow your business.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="text-blue-600" />
                <span className="text-gray-800">contact@ilead.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-blue-600" />
                <span className="text-gray-800">+20 (10) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="text-blue-600" />
                <span className="text-gray-800">Alexandria, Egypt</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            <form className="space-y-6">
              <Input 
                placeholder="Your Name" 
                className="bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
              />
              <Input 
                type="email" 
                placeholder="Your Email" 
                className="bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
              />
              <Input 
                placeholder="Subject" 
                className="bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
              />
              <Textarea 
                placeholder="Your Message" 
                rows={4} 
                className="bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
              />
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
              >
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 