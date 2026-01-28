"use client"

import { useEffect, memo } from 'react'

function DeviceOptimizerComponent() {
  useEffect(() => {
    // Set viewport height CSS variable for better mobile support
    const setVH = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
      
      // Force reflow to apply changes immediately
      document.body.style.display = 'none'
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      document.body.offsetHeight
      document.body.style.display = ''
    }
    
    setVH()
    window.addEventListener('resize', setVH)
    window.addEventListener('orientationchange', setVH)
    
    // Prevent zoom on input focus (iOS Safari)
    const preventZoom = () => {
      const inputs = document.querySelectorAll('input, select, textarea')
      inputs.forEach((input) => {
        if (input instanceof HTMLElement) {
          const currentFontSize = window.getComputedStyle(input).fontSize
          if (parseFloat(currentFontSize) < 16) {
            input.style.fontSize = '16px'
          }
        }
      })
    }
    
    preventZoom()
    window.addEventListener('resize', preventZoom)
    
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

export const DeviceOptimizer = memo(DeviceOptimizerComponent)
