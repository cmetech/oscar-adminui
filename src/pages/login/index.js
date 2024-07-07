"use client"

import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { signIn } from 'next-auth/react'
import UserFallbackSpinner from 'src/layouts/UserSpinner'

const LoginPage = () => {
  const router = useRouter()
  const { returnUrl } = router.query

  console.log('LoginPage component rendered')

  // Directly call signIn when the component renders
  useEffect(() => {
    console.log('Redirecting to Keycloak')
    signIn('keycloak', { callbackUrl: returnUrl || '/' })
  }, [returnUrl])

  //return <p>Login Page Rendered</p>
  return <UserFallbackSpinner />
}

export default LoginPage


/*"use client"

import { useEffect } from 'react'
import { signIn } from 'next-auth/react'

const LoginPage = () => {
  useEffect(() => {
    console.log('Redirecting to Keycloak')
    signIn('keycloak') // Use the Keycloak provider
  }, [])

  return <p>Redirecting...</p>
}

export default LoginPage
*/
