'use client'

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Check } from 'lucide-react'

const plans = [
  {
    name: "Starter Plan",
    price: "$100",
    features: [
      "500 leads per month",
      "Ai email Copy & Strategy",
      "Email support",
      "Iskala university",
      "Slack community access"
    
    ]
  },
  {
    name: "Pro Plan",
    price: "$200",
    features: [
      "5K leads per month",
      "Ai email Copy & Strategy",
      "Custom Email Copy & Strategy",
      "Advanced email automation",
      "24/7 chat support",
      "Email infrastructure Audit & Optimization",
      "Iskala university",
      "Slack community access"

    ]
  },
  {
    name: "Enterprise Plan",
    price: "Custom pricing",
    features: [
     "All Pro plan features",
      "Dedicated account manager",
      "Custom integrations"
    ]
  }
];
export default function Pricing() {
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
            Choose the plan that best fits your needs. All plans come with a 14-day free trial.
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
              className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-3xl font-extrabold text-gray-900">{plan.price}</p>
                <p className="mt-1 text-sm text-gray-500">per month</p>
                <Button 
                  className={`mt-8 w-full ${
                    index === 1 
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white" 
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                >
                  {index === 2 ? "Contact Sales" : "Start free trial"}
                </Button>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">Whats included</h4>
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