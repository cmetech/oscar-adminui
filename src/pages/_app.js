// ** Next Imports
import Head from 'next/head'
import { Router } from 'next/router'

// ** Loader Import
import NProgress from 'nprogress'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'

// ** Config Imports

import { defaultACLObj } from 'src/configs/acl'
import themeConfig from 'src/configs/themeConfig'
import oscarConfig from 'src/configs/oscarConfig'
import 'src/configs/i18n'

// ** Fake-DB Import
// import 'src/@fake-db'

// ** Third Party Import
import { Toaster } from 'react-hot-toast'

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout'
import AclGuard from 'src/layouts/components/auth/UserAclGuard'
import ThemeComponent from 'src/@core/theme/ThemeComponent'
import AuthGuard from 'src/layouts/components/auth/UserAuthGuard'
import GuestGuard from 'src/layouts/components/auth/UserGuestGuard'

// ** Spinner Import
// import Spinner from 'src/@core/components/spinner'
import UserFallbackSpinner from 'src/layouts/UserSpinner'

// ** Contexts
import { SessionProvider } from 'next-auth/react'
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'

// ** Styled Components
import ReactHotToast from 'src/@core/styles/libs/react-hot-toast'
import { LicenseInfo } from '@mui/x-data-grid-pro'

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

// ** React Query
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ** Date Calender Provider
import { LocalizationProvider } from '@mui/x-date-pickers-pro'
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs'

// ** Prismjs Styles
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'
import 'src/iconify-bundle/icons-bundle-react'

// ** Chat UI Kit Styles
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import '../../styles/oscar-chat.css'

// ** Global css styles
import '../../styles/globals.css'

const clientSideEmotionCache = createEmotionCache()
const queryClient = new QueryClient()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

const Guard = ({ children, authGuard, guestGuard }) => {
  if (guestGuard) {
    return <GuestGuard fallback={<UserFallbackSpinner />}>{children}</GuestGuard>
  } else if (!guestGuard && !authGuard) {
    return <>{children}</>
  } else {
    return <AuthGuard fallback={<UserFallbackSpinner />}>{children}</AuthGuard>
  }
}

// ** Set License
LicenseInfo.setLicenseKey(
  'c7dee20a3641649c8e01b4630f5126c7Tz04NDczMyxFPTE3NDAwOTE1MzIwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI='
)

// ** Configure JSS & ClassName
const App = props => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  // Variables
  const contentHeightFixed = Component.contentHeightFixed ?? false

  const getLayout =
    Component.getLayout ?? (page => <UserLayout contentHeightFixed={contentHeightFixed}>{page}</UserLayout>)
  const setConfig = Component.setConfig ?? undefined
  const authGuard = Component.authGuard ?? true
  const guestGuard = Component.guestGuard ?? false
  const aclAbilities = Component.acl ?? defaultACLObj

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{`${themeConfig.templateName} - ${oscarConfig.BRANDING_TAGLINE}`}</title>
        <meta name='description' content={`${themeConfig.templateName} – ${oscarConfig.BRANDING_TAGLINE}`} />
        <meta name='keywords' content='Ericsson, COMET, powered by Ericsson, Monitoring' />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>

      <SessionProvider session={pageProps.session}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <QueryClientProvider client={queryClient}>
            <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
              <SettingsConsumer>
                {({ settings }) => {
                  return (
                    <ThemeComponent settings={settings}>
                      <Guard authGuard={authGuard} guestGuard={guestGuard}>
                        <AclGuard aclAbilities={aclAbilities} guestGuard={guestGuard} authGuard={authGuard}>
                          {getLayout(<Component {...pageProps} />)}
                        </AclGuard>
                      </Guard>
                      <ReactHotToast>
                        <Toaster
                          position={settings.toastPosition}
                          toastOptions={{ className: 'react-hot-toast', duration: 4000 }}
                        />
                      </ReactHotToast>
                    </ThemeComponent>
                  )
                }}
              </SettingsConsumer>
            </SettingsProvider>
          </QueryClientProvider>
        </LocalizationProvider>
      </SessionProvider>
    </CacheProvider>
  )
}

export default App
