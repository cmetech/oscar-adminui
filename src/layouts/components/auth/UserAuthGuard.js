// ** React Imports
import { useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useSession } from 'next-auth/react'

import UserFallbackSpinner from 'src/layouts/UserSpinner'

const AuthGuard = (props) => {
  const { children, fallback } = props

  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return

    if (status === 'unauthenticated' && router.pathname !== '/login') {
      console.log('Unauthenticated, redirecting to login')
      router.replace({
        pathname: '/login',
        query: { returnUrl: router.asPath }
      })
    }
  }, [router.isReady, status, router])

  if (status === 'loading') {
    return
    //return <UserFallbackSpinner />
    //return fallback || <p>Loading...</p>
  }

  if (status !== 'authenticated' && router.pathname !== '/login') {
    return
    //return <UserFallbackSpinner />
    //return fallback || null
  }

  return <>{children}</>
}

export default AuthGuard
