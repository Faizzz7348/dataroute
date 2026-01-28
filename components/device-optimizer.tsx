"use client"

import { useEffect } from 'react'

export function DeviceOptimizer() {
  useEffect(() => {
    // Set viewport height CSS variable for better mobile support
    const setVH = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
    
    setVH()
    window.addEventListener('resize', setVH)
    window.addEventListener('orientationchange', setVH)
    
    // Add device class to body for CSS targeting
    const updateDeviceClass = () => {
      const width = window.innerWidth
      document.body.classList.remove('is-mobile', 'is-tablet', 'is-desktop')
      
      if (width < 768) {
        document.body.classList.add('is-mobile')
      } else if (width < 1024) {
        document.body.classList.add('is-tablet')
      } else {
        document.body.classList.add('is-desktop')
      }
      
      // Add iOS class
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS) {
        document.body.classList.add('is-ios')
      }
      
      // Add Android class
      if (/Android/.test(navigator.userAgent)) {
        document.body.classList.add('is-android')
      }
      
      // Add standalone mode class
      if (window.matchMedia('(display-mode: standalone)').matches) {
        document.body.classList.add('is-standalone')
      }
    }
    
    updateDeviceClass()
    window.addEventListener('resize', updateDeviceClass)
    
    return () => {
      window.removeEventListener('resize', setVH)
      window.removeEventListener('orientationchange', setVH)
      window.removeEventListener('resize', updateDeviceClass)
    }
  }, [])

  return null
}
