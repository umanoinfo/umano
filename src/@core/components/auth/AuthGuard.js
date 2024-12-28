// ** React Imports
import { useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useAuth } from 'src/hooks/useAuth'

const AuthGuard = props => {
  const { children, fallback } = props
  const auth = useAuth()
  const router = useRouter()
  
  useEffect(
    () => {
      if (!router.isReady) {
        // return
      }
    },

    [router.route , router.isReady]
  )


  return <>{children}</>
}

export default AuthGuard
