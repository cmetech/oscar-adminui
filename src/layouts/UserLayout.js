import useMediaQuery from '@mui/material/useMediaQuery'
import Link from 'next/link'
import Stack from '@mui/material/Stack'

// ** Layout Imports
// !Do not remove this Layout import
import Layout from 'src/@core/layouts/Layout'

// ** MUI Imports
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Icon from 'src/@core/components/icon'
import { styled, useTheme } from '@mui/material/styles'

// ** Navigation Imports
import VerticalNavItems from 'src/navigation/vertical'
import HorizontalNavItems from 'src/navigation/horizontal'
import UserFooterContent from './components/shared-components/footer/UserFooterContent'

// ** Component Import
// Uncomment the below line (according to the layout type) when using server-side menu
// import ServerSideVerticalNavItems from './components/vertical/ServerSideNavItems'
// import ServerSideHorizontalNavItems from './components/horizontal/ServerSideNavItems'

import VerticalAppBarContent from './components/vertical/AppBarContent'
import HorizontalAppBarContent from './components/horizontal/AppBarContent'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'
import themeConfig from 'src/configs/themeConfig'

const HeaderTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  lineHeight: 'normal',
  textTransform: 'none',
  color: theme.palette.text.primary,
  transition: 'opacity .25s ease-in-out, margin .25s ease-in-out'
}))

const StyledLink = styled(Link)(({ mode }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: mode === 'light' ? '#0c0c0c' : '#fff'
}))

const AppBrand = () => {
  const { settings, saveSettings } = useSettings()
  const theme = useTheme()
  const { navCollapsed, mode } = settings
  const menuCollapsedStyles = navCollapsed ? { opacity: 0 } : { opacity: 1 }

  let textColor = 'customColors.brandBlack'
  if (mode === 'dark') {
    textColor = 'customColors.brandWhite'
  }

  return (
    <StyledLink href='/'>
      <i className='icon icon-econ' />
      <Stack>
        <HeaderTitle variant='h6' sx={{ ...menuCollapsedStyles, ...(navCollapsed ? {} : { ml: 3 }) }}>
          COMET
        </HeaderTitle>
        <Typography noWrap variant='caption' color={textColor} sx={{ paddingLeft: 3 }}>
          powered by Ericsson InSite
        </Typography>
      </Stack>
    </StyledLink>
  )
}

const UserLayout = ({ children, contentHeightFixed }) => {
  // ** Hooks
  const { settings, saveSettings } = useSettings()

  // ** Vars for server side navigation
  // const { menuItems: verticalMenuItems } = ServerSideVerticalNavItems()
  // const { menuItems: horizontalMenuItems } = ServerSideHorizontalNavItems()
  /**
   *  The below variable will hide the current layout menu at given screen size.
   *  The menu will be accessible from the Hamburger icon only (Vertical Overlay Menu).
   *  You can change the screen size from which you want to hide the current layout menu.
   *  Please refer useMediaQuery() hook: https://mui.com/material-ui/react-use-media-query/,
   *  to know more about what values can be passed to this hook.
   *  ! Do not change this value unless you know what you are doing. It can break the template.
   */
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  if (hidden && settings.layout === 'horizontal') {
    settings.layout = 'vertical'
  }

  return (
    <Layout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      contentHeightFixed={contentHeightFixed}
      footerProps={{
        content: () => <UserFooterContent />
      }}
      verticalLayoutProps={{
        navMenu: {
          navItems: VerticalNavItems(),
          branding: () => <AppBrand />

          // Uncomment the below line when using server-side menu in vertical layout and comment the above line
          // navItems: verticalMenuItems
        },
        appBar: {
          content: props => (
            <VerticalAppBarContent
              hidden={hidden}
              settings={settings}
              saveSettings={saveSettings}
              toggleNavVisibility={props.toggleNavVisibility}
            />
          )
        }
      }}
      {...(settings.layout === 'horizontal' && {
        horizontalLayoutProps: {
          navMenu: {
            navItems: HorizontalNavItems()

            // Uncomment the below line when using server-side menu in horizontal layout and comment the above line
            // navItems: horizontalMenuItems
          },
          appBar: {
            content: () => <HorizontalAppBarContent settings={settings} saveSettings={saveSettings} />
          }
        }
      })}
    >
      {children}
    </Layout>
  )
}

export default UserLayout
