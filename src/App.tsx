import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Suspense, useEffect } from 'react'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Spinner from '@/components/ui/Spinner'
import FormPage from '@/pages/FormPage'
import SelectionPage from '@/pages/SelectionPage'
import PlanPage from '@/pages/PlanPage'
import SavedPlansPage from '@/pages/SavedPlansPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { useAuth } from '@/hooks/useAuth'
import { useOfflineStore, useUIStore } from '@/store'

function AppRoutes() {
  // Auth listener başlat
  const { loading } = useAuth()
  const { setOnline } = useOfflineStore()
  const { theme } = useUIStore()

  // Online/offline takibi
  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [setOnline])

  // Tema uygula
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface)]">
      <Header />
      <div className="flex-1 pb-24">
        <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="lg" /></div>}>
          <Routes>
            <Route path="/" element={<FormPage />} />
            <Route path="/select" element={<SelectionPage />} />
            <Route path="/plan/:planId" element={<PlanPage />} />
            <Route path="/plan/share/:shareCode" element={<PlanPage />} />
            <Route path="/saved" element={<SavedPlansPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '1rem',
            background: 'var(--color-card)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            fontSize: '0.875rem',
          },
        }}
      />
    </BrowserRouter>
  )
}
