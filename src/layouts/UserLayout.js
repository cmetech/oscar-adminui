import { useState } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import Link from 'next/link'
import Stack from '@mui/material/Stack'
import { useSession } from 'next-auth/react'
import { useAtom } from 'jotai'
import { showOscarChatAtom } from 'src/lib/atoms'

// ** Layout Imports
// !Do not remove this Layout import
import Layout from 'src/@core/layouts/Layout'

// ** MUI Imports
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Icon from 'src/@core/components/icon'
import { styled, useTheme } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'

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

import UserFallbackSpinner from 'src/layouts/UserSpinner'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'
import themeConfig from 'src/configs/themeConfig'
import oscarConfig from 'src/configs/oscarConfig'

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
  color: mode === 'light' ? '#0c0c0c' : '#fff',
  cursor: 'pointer'
}))

// Custom styled component to replace `StyledLink`
const OscarChatToggle = styled('div')(({ mode }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: mode === 'light' ? '#0c0c0c' : '#fff',
  cursor: 'pointer',

  '& .main-image': {
    position: 'relative',
    zIndex: 1,
    transition: 'opacity 0.2s ease'
  },

  '& .hover-image': {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
    opacity: 0,
    transition: 'opacity 0.2s ease'
  },

  '&:hover .hover-image': {
    opacity: 1
  },

  '&:hover .main-image': {
    opacity: 0
  }
}))

const MenuFooter = () => {
  const { settings } = useSettings()
  const { navCollapsed } = settings
  const [showOscarChat, setShowOscarChat] = useAtom(showOscarChatAtom)
  const theme = useTheme()

  const handleToggleOscarChat = () => {
    setShowOscarChat(!showOscarChat)
  }

  return (
    <Box
      sx={{
        pt: 10,
        display: 'flex',
        justifyContent: 'center',
        borderTop: theme => `1px solid ${theme.palette.divider}`
      }}
    >
      <OscarChatToggle onClick={handleToggleOscarChat}>
        {navCollapsed ? (
          <>
            <img className='main-image' src='/images/oscar.png' width='40' height='40' alt='menu-footer' />
            <img
              className='hover-image'
              src={theme.palette.mode == 'dark' ? '/images/oscar-hover-red.png' : '/images/oscar-hover-red.png'}
              width='40'
              height='40'
              alt='hover-image'
            />
          </>
        ) : (
          <>
            <img className='main-image' src='/images/oscar.png' width='150' height='150' alt='menu-footer' />
            <img
              className='hover-image'
              src={theme.palette.mode == 'dark' ? '/images/oscar-hover-red.png' : '/images/oscar-hover-red.png'}
              width='150'
              height='150'
              alt='hover-image'
            />
          </>
        )}
      </OscarChatToggle>
    </Box>
  )
}

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
      <Stack>
        {navCollapsed ? (
          <Box
            bgcolor={theme.palette.mode === 'dark' ? 'customColors.dark' : '#F4F5FA'}
            component='img'
            sx={{ display: 'flex', alignItems: 'center', marginLeft: 3, marginTop: 2 }}
            src={theme.palette.mode == 'dark' ? '/images/ECON_RGB_WHITE_48px.png' : '/images/ECON_RGB_BLACK_48px.png'}
            alt='logo'
            width='48px'
            height='48px'
          />
        ) : (
          <Box
            bgcolor={theme.palette.mode === 'dark' ? 'customColors.dark' : '#F4F5FA'}
            component='img'
            sx={{ display: 'flex', alignItems: 'center', paddingLeft: 3, paddingTop: 1, paddingBottom: 1 }}
            src={theme.palette.mode == 'dark' ? '/images/logo.png' : '/images/ERI_horizontal_black_RGB.png'}
            alt='logo'
            width='170px'
            height='40px'
          />
        )}
        {/* <Typography
          noWrap
          variant='caption'
          color={textColor}
          sx={{ ...menuCollapsedStyles, ...(navCollapsed ? {} : { paddingLeft: 3, marginBottom: 2 }) }}
        >
          {oscarConfig.BRANDING_TAGLINE}
        </Typography> */}
      </Stack>
    </StyledLink>
  )
}

const User = () => {
  const BadgeContentSpan = styled('span')(({ theme }) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.success.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
  }))

  const userSession = useSession()

  console.log("User session is: ", userSession)

  // Added loading state handling
  if (userSession.status === 'loading') {
    return
  }

  // Added error handling if no user session found
  if (!userSession?.user && !userSession?.data?.user) {
    return
  }

  

  const user = userSession.user || userSession.data.user
  const userFullName = user.name || 'John Doe'
  const imageFileName = userFullName.toLowerCase().replace(/\s+/g, '') || '1'

  return (
    <Box sx={{ py: 2, px: 4, mb: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Badge
          overlap='circular'
          badgeContent={<BadgeContentSpan />}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
        >
          <Avatar
            src={`/images/avatars/${imageFileName}.png`}
            alt={userFullName}
            sx={{ width: '2.5rem', height: '2.5rem' }}
          />
        </Badge>
        <Box sx={{ ml: 3, display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
          <Typography sx={{ fontWeight: 600 }}>{userFullName}</Typography>
          <Stack direction='row' alignItems='center' spacing={0.5}>
            <Typography variant='body2' sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
              {user.role}
            </Typography>
            {user.role === 'admin' ? (
              <Icon icon='mdi:shield-crown-outline' color='success' sx={{ width: 10, height: 10, ml: 0.5 }} />
            ) : null}
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}

const UserLayout = ({ children, contentHeightFixed }) => {
  // ** Hooks
  const { settings, saveSettings } = useSettings()
  const theme = useTheme()

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
        content: () => <UserFooterContent theme={theme} />
      }}
      verticalLayoutProps={{
        navMenu: {
          componentProps: {
            sx: {
              '& .MuiList-root .nav-link:hover': {
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? theme.palette.customColors.brandYellow4
                    : theme.palette.customColors.brandGray3,
                borderRadius: '0 22px 22px 0'
              },
              '& .MuiList-root .nav-link:hover .MuiTypography-root': {
                color: '#fff'
              },
              '& .MuiList-root .nav-link:hover .MuiListItemIcon-root': {
                color: '#fff'
              },
              '& .MuiDivider-root .MuiTypography-root': {
                color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.customColors.brandYellow
                    : theme.palette.customColors.brandBlack
              }
            }
          },
          beforeContent: () => <User />,
          afterContent: () => <MenuFooter />,
          navItems: VerticalNavItems(),
          branding: () => <AppBrand />,
          lockedIcon: <Icon icon='mdi:arrow-left-bold-circle-outline' />,
          unlockedIcon: <Icon icon='mdi:arrow-right-bold-circle-outline' />

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
