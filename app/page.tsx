'use client'

import { useScroll, useTransform, motion } from 'framer-motion'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import AutomationFeatures from '@/components/AutomationFeatures'
import Pricing from '@/components/Pricing'
import Testimonials from '@/components/Testimonials'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import AdvancedFeatures from '@/components/AdvancedFeatures'
import AIEmailFeatures from '@/components/AIEmailFeatures'
import IskalaUniversity from '@/components/iskalaUniversty'
import TrustedBy from '@/components/TrustedBy'


export default function Home() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Header />
      
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <AIEmailFeatures />

        <AutomationFeatures />
        <AdvancedFeatures />
        <IskalaUniversity />
        <Pricing />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-50"
        style={{ scaleX }}
      />
    </div>
  )
}