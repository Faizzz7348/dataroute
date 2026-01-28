"use client"

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isIOS: boolean
  isAndroid: boolean
  isSafari: boolean
  isChrome: boolean
  hasNotch: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
}

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isIOS: false,
      isAndroid: false,
      isSafari: false,
      isChrome: false,
      hasNotch: false,
      screenWidth: 1920,
      screenHeight: 1080,
      orientation: 'landscape'
    }
  }

  const ua = navigator.userAgent
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  
  // Device type detection
  const isMobile = screenWidth < 768
  const isTablet = screenWidth >= 768 && screenWidth < 1024
  const isDesktop = screenWidth >= 1024
  
  // OS detection
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
  const isAndroid = /Android/.test(ua)
  
  // Browser detection
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
  const isChrome = /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor)
  
  // Notch detection (iPhone X and later)
  const hasNotch = isIOS && (
    (screenHeight === 812 && screenWidth === 375) || // iPhone X, XS, 11 Pro
    (screenHeight === 896 && screenWidth === 414) || // iPhone XR, XS Max, 11, 11 Pro Max
    (screenHeight === 844 && screenWidth === 390) || // iPhone 12, 12 Pro, 13, 13 Pro
    (screenHeight === 926 && screenWidth === 428) || // iPhone 12 Pro Max, 13 Pro Max, 14 Plus
    (screenHeight === 852 && screenWidth === 393) || // iPhone 14 Pro
    (screenHeight === 932 && screenWidth === 430)    // iPhone 14 Pro Max
  )
  
  // Orientation
  const orientation = screenHeight > screenWidth ? 'portrait' : 'landscape'
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    hasNotch,
    screenWidth,
    screenHeight,
    orientation
  }
}

export function useDeviceDetection() {
  if (typeof window === 'undefined') return getDeviceInfo()
  
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>(getDeviceInfo())
  
  React.useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo())
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])
  
  return deviceInfo
}

// React import for hook
import React from 'react'
