'use client'

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PLAN_LIMITS } from '@/types/subscription'

const plans = [
  {
    name: "Free Plan",
    price: "$0",
    features: [
      `${PLAN_LIMITS.free.aiEmailLimit} AI emails per month`,
      'Basic email templates',
      'Middle East 100K Free Leads',
      'Community support',
      
      'Iskala university access'
    ]
  },
  {
    name: "Pro Plan",
    price: "$100",
    features: [
      `${PLAN_LIMITS.pro.aiEmailLimit} AI emails per month`,
      'Advanced email templates',
      'Priority support',
      'Recorded Masterclass on end-to-end frameworks',
      'Free SmartLead demo account',
      'Middle East database (100K e-commerce stores)',
      'Middle East database (All funded businesses directory)',
      'Exclusive community access',
      'AI-powered cold email copy generator',
      'All campaign templates',
      'Weekly expert sessions',
      '2,000 customized prospects list tailored to your ICP'
    ]
  },
  {
    name: "Enterprise Plan",
    price: "Custom",
    features: [
      "All Pro plan features",
      "Custom AI email limits",
      "Dedicated account manager",
      "CRM integrations",
      "Priority 24/7 support",
      "Tailored solutions",
      "Custom reporting & analytics",
      "Onboarding assistance",
      "Team training sessions",
      "Custom workflow automation",
      
    ]
  }
];

export default function Pricing() {
  const router = useRouter()

  const handlePlanClick = (planIndex: number) => {
    if (planIndex === 0) {
      // Free plan - Navigate to signup
      router.push('/signup?plan=free')
    } else {
      // Pro and Enterprise plans - Scroll to contact section
      const contactSection = document.getElementById('contact')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
          >
            Simple, Transparent{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              Pricing
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto"
          >
            Choose the plan that best fits your needs. Start with our free plan or upgrade for more features.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white border rounded-lg shadow-sm divide-y divide-gray-200 ${
                index === 1 ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' : 'border-gray-200'
              }`}
            >
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-3xl font-extrabold text-gray-900">{plan.price}</p>
                <p className="mt-1 text-sm text-gray-500">per month</p>
                <Button 
                  onClick={() => handlePlanClick(index)}
                  className={`mt-8 w-full ${
                    index === 1 
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white" 
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                >
                  {index === 0 ? "Start free trial" : "Contact Sales"}
                </Button>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">What's included</h4>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex space-x-3">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}