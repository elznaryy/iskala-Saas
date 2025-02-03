'use client'

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../app/portal/components/ui/textarea"
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    planType: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // Update with the correct Make.com webhook URL
  const WEBHOOK_URL = "https://hook.eu2.make.com/qj1x79yj98drv2imvrp9u6rsu7sxwb5k"

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const plan = params.get('plan')
    if (plan) {
      setFormData(prev => ({
        ...prev,
        subject: `Inquiry about ${plan} Plan`,
        planType: plan
      }))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          source: 'iskala.net contact form'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      // Show success dialog
      setShowSuccessDialog(true)
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        planType: ''
      })
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
              {formData.planType 
                ? `Thank you for your interest in our ${formData.planType} Plan. Please fill out the form and we'll get back to you shortly.`
                : "Have questions about Iskala? Want to see how we can supercharge your lead generation? We're here to help you grow your business."}
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="text-blue-600" />
                <span className="text-gray-800">contact@iskala.net</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-blue-600" />
                <span className="text-gray-800">+201003138188</span>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input 
                placeholder="Your Name" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
                required
              />
              <Input 
                type="email" 
                placeholder="Your Email" 
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
                required
              />
              <Input 
                placeholder="Subject" 
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
                required
              />
              <Textarea 
                placeholder="Your Message" 
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4} 
                className="bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
                required
              />
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Message Sent Successfully
            </DialogTitle>
            <DialogDescription>
              Thank you for contacting us! We'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowSuccessDialog(false)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
} 