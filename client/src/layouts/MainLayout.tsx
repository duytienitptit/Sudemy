import type { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GlobalChatWidget } from '@/components/layout/GlobalChatWidget'

interface MainLayoutProps {
  children: ReactNode
  /** Pass true to hide the footer (e.g. checkout flow) */
  hideFooter?: boolean
}

/**
 * Default page layout: sticky Header + scrollable content + Footer.
 * All public pages should use this layout.
 */
export function MainLayout({ children, hideFooter = false }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-background)]">
      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      {!hideFooter && <Footer />}
      <GlobalChatWidget />
    </div>
  )
}

