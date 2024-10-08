// ** React Imports
import { useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** Config Import
import { buildAbilityFor } from 'src/configs/acl'

// ** Component Import
import NotAuthorized from 'src/pages/401'

// import Spinner from 'src/@core/components/spinner'
import UserFallbackSpinner from 'src/layouts/UserSpinner'
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
// import { useAuth } from 'src/hooks/useAuth'
import { useSession } from 'next-auth/react'

// ** Util Import
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'

const AclGuard = props => {
  // ** Props
  const { aclAbilities, children, guestGuard = false, authGuard = true } = props

  // ** Hooks
  // const auth = useAuth()
  const { data: session } = useSession()
  const router = useRouter()

  // ** Vars
  let ability

  useEffect(() => {
    if (session?.user && session?.user.roles && !guestGuard && router.route === '/') {
      const homeRoute = getHomeRoute(session?.user.roles)
      router.replace(homeRoute)
    }
  }, [session?.user, guestGuard, router])

  // User is logged in, build ability for the user based on his role
  if (session?.user && !ability) {
    ability = buildAbilityFor(session?.user.roles, aclAbilities.subject)
    if (router.route === '/') {
      return <UserFallbackSpinner />
    }
  }

  // If guest guard or no guard is true or any error page
  if (guestGuard || router.route === '/404' || router.route === '/500' || !authGuard) {
    // If user is logged in and his ability is built
    if (session?.user && ability) {
      return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
    } else {
      // If user is not logged in (render pages like login, register etc..)
      return <>{children}</>
    }
  }

  // Check the access of current user and render pages
  if (ability && session?.user && ability.can(aclAbilities.action, aclAbilities.subject)) {
    if (router.route === '/') {
      return <UserFallbackSpinner />
    }

    return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
  }

  // Render Not Authorized component if the current user has limited access
  return (
    <BlankLayout>
      <NotAuthorized />
    </BlankLayout>
  )
}

export default AclGuard
