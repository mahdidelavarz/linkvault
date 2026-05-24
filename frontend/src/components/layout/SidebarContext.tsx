'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface SidebarContextValue {
  collapsed:    boolean
  mobileOpen:   boolean
  setCollapsed: (v: boolean) => void
  setMobileOpen:(v: boolean) => void
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed:    false,
  mobileOpen:   false,
  setCollapsed: () => {},
  setMobileOpen:() => {},
})

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <SidebarContext.Provider value={{ collapsed, mobileOpen, setCollapsed, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)