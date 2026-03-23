import { useEffect } from 'react'
import { useAuthStore } from '@/store'
import { onAuthChanged } from '@/services/firebase/auth'

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthChanged((u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [setUser, setLoading])

  return { user, loading }
}
