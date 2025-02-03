'use client'

import { motion, useAnimationFrame } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'


const companies = [
  { name: 'Company 1', logo: '/images/coach.svg' },
  { name: 'Company 2', logo: '/images/DIY.png' },
  { name: 'Company 3', logo: '/images/HEroleads.png' },
  { name: 'Company 4', logo: '/images/Squadio.svg' },
  { name: 'Company 5', logo: '/images/Zen.svg' },
  { name: 'Company 6', logo: '/images/saee.svg' },

  { name: 'Company 9', logo: '/images/Perfect-Webinar-Presentation (9).png' },
  
  // Duplicate for seamless loop
  { name: 'Company 1', logo: '/images/coach.svg' },
  { name: 'Company 2', logo: '/images/DIY.png' },
  { name: 'Company 3', logo: '/images/HEroleads.png' },
  { name: 'Company 4', logo: '/images/Squadio.svg' },
  { name: 'Company 5', logo: '/images/Zen.svg' },
  { name: 'Company 6', logo: '/images/saee.svg' },
  { name: 'Company 9', logo: '/images/Perfect-Webinar-Presentation (9).png' },

]

export default function TrustedBy() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef(0)

  useAnimationFrame(() => {
    if (!containerRef.current) return
    scrollRef.current += 0.5
    if (scrollRef.current >= containerRef.current.scrollWidth / 2) {
      scrollRef.current = 0
    }
    containerRef.current.scrollLeft = scrollRef.current
  })

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Over 100 Businesses Trust{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              iSkala
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            in their lead generation process, delivering exceptional results through automated outreach and intelligent prospect targeting
          </p>
        </motion.div>

        <div className="relative w-full">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
          <div 
            ref={containerRef}
            className="flex gap-8 overflow-x-hidden whitespace-nowrap py-4"
          >
            {companies.map((company, index) => (
              <motion.div
                key={`${company.name}-${index}`}
                className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300"
                style={{ minWidth: '120px' }}
              >
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={120}
                  height={60}
                  className="h-12 w-auto object-contain"
                  priority={index < 6}
                  unoptimized={company.logo.endsWith('.svg')}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}