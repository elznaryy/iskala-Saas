'use client'

import Script from 'next/script'
import { useEffect } from 'react'

interface ZohoValues {
  [key: string]: string | number | boolean
}

interface ZohoSalesIQ {
  widgetcode: string
  values: ZohoValues
  ready: () => void
}

interface ZohoWindow {
  $zoho?: {
    salesiq?: ZohoSalesIQ
  }
}

declare global {
  interface Window extends ZohoWindow {}
}

const ZOHO_CONFIG: ZohoSalesIQ = {
  widgetcode: "siq8efa4969620a557cd94790b240610f6dc3608ed8c4526e8d31e52f9821fe07a9a932299f2002cb669ff614968e7ec023",
  values: {},
  ready: () => {
    console.log('Zoho SalesIQ is ready')
  }
}

export default function ZohoChat(): JSX.Element {
  useEffect(() => {
    window.$zoho = window.$zoho || {}
    window.$zoho.salesiq = window.$zoho.salesiq || ZOHO_CONFIG
  }, [])

  const handleLoad = (): void => {
    console.log('Zoho SalesIQ widget loaded successfully')
  }

  const handleError = (error: ErrorEvent): void => {
    console.error('Error loading Zoho SalesIQ widget:', error.message)
  }

  return (
    <Script
      id="zsiqscript"
      strategy="afterInteractive"
      src="https://salesiq.zohopublic.com/widget"
      onLoad={handleLoad}
      onError={handleError}
    />
  )
}