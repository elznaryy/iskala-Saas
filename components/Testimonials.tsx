'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const testimonials = [
  {
    quote: "We're impressed with the response rate; unlike typical outbound campaigns, our emails seemed personalized. Additionally, we closed a deal within just two weeks of partnering with Iskala. Kudos to the team!",
    author: "Helen",
    position: "Lead Generation Manager, ZenHr",
    image: "/images/Helen.jpg"
  },
  {
    quote: "Despite real estate being new for Iskala, their efforts resulted in 50+ meetings, high-quality leads, and four major clients closed, exceeding the initial investment.",
    author: "Kyle connor",
    position: "CEO, DIY",
    image: "/images/Kyle.png"
  },
  {
    quote: "Iskala Business Solutions provides high-quality leads and detailed reports for transparency. The team is prompt, responsive, and creatively exceeds expectations to support client goals.",
    author: "Mirna Cindric",
    position: "Project Manager, McKnight Media",
    image: "/images/Mirna.jpg"
  }
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl font-extrabold text-center text-gray-900 sm:text-4xl"
        >
          What Our Customers Are Saying
        </motion.h2>
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-8">
                <div className="text-xl font-medium text-gray-900 mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </div>
                <div className="flex items-center mt-6">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="ml-4">
                    <div className="text-lg font-medium text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.position}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}