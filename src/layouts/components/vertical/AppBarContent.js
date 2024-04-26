// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Chip from '@mui/material/Chip'

import { useRouter } from 'next/router'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'

// ** Components
import Autocomplete from 'src/layouts/components/Autocomplete'
import UserModeToggler from 'src/layouts/components/shared-components/UserModeToggler'
import UserDropdown from 'src/layouts/components/UserDropdown'
import UserNotificationDropdown from 'src/layouts/components/UserNotificationDropdown'
import UserLanguageDropdown from 'src/layouts/components/UserLanguageDropdown'
import OscarChatToggler from 'src/layouts/components/shared-components/OscarChatToggler'

const notifications = [
  {
    meta: 'Today',
    avatarAlt: 'Flora',
    title: 'Congratulation Flora! 🎉',
    avatarImg: '/images/avatars/4.png',
    subtitle: 'Won the monthly best seller badge'
  },
  {
    meta: 'Yesterday',
    avatarColor: 'primary',
    subtitle: '5 hours ago',
    avatarText: 'Robert Austin',
    title: 'New user registered.'
  },
  {
    meta: '11 Aug',
    avatarAlt: 'message',
    title: 'New message received 👋🏻',
    avatarImg: '/images/avatars/5.png',
    subtitle: 'You have 10 unread messages'
  },
  {
    meta: '25 May',
    title: 'Paypal',
    avatarAlt: 'paypal',
    subtitle: 'Received Payment',
    avatarImg: '/images/misc/paypal.png'
  },
  {
    meta: '19 Mar',
    avatarAlt: 'order',
    title: 'Received Order 📦',
    avatarImg: '/images/avatars/3.png',
    subtitle: 'New order received from John'
  },
  {
    meta: '27 Dec',
    avatarAlt: 'chart',
    subtitle: '25 hrs ago',
    avatarImg: '/images/misc/chart.png',
    title: 'Finance report has been generated'
  }
]

const CustomBreadcrumbs = () => {
  const router = useRouter()
  const theme = useTheme()
  const { t } = useTranslation()
  const path = router.pathname.replace(/\/$/g, '')

  console.log('path', path)

  const breadcrumbNameMap = {
    '/home': { name: t('Overview'), icon: 'mdi:telescope' },
    '/observability/slo': { name: 'SLOs', icon: 'mdi:target' },
    '/tasks': { name: t('Automations'), icon: 'mdi:arrow-decision-auto' },
    '/administration/inventory': { name: t('Inventory Management'), icon: 'mdi:server' },
    '/administration/services': { name: t('Services'), icon: 'mdi:service-toolbox' },
    '/administration/users': { name: t('User Management'), icon: 'mdi:account-multiple' },
    '/oscar': { name: t('Oscar Chat'), icon: 'mdi:message-text' },
    '/oscar/docs': { name: t('Doc Portal'), icon: 'mdi:arrow-decision-auto' }
  }

  // Check if the entire path is a key in the breadcrumbNameMap
  const breadcrumb = breadcrumbNameMap[path]

  return (
    <Breadcrumbs separator={<Icon icon='mdi:keyboard-arrow-right' fontSize='large' />} aria-label='breadcrumb'>
      <Link underline='hover' color='inherit' href='/'>
        <CustomChip
          rounded
          label={t('Home')}
          key='/'
          icon={<Icon icon='mdi:home' />}
          skin='light'
          color={theme.palette.mode === 'light' ? 'primary' : 'warning'}
        />
      </Link>
      {breadcrumb && (
        <Link underline='hover' color='text.primary' href={`/${path}`}>
          <CustomChip
            rounded
            label={breadcrumb.name}
            key={breadcrumb}
            icon={<Icon icon={breadcrumb.icon} />}
            skin='light'
            color={theme.palette.mode === 'light' ? 'primary' : 'warning'}
          />
        </Link>
      )}
    </Breadcrumbs>
  )
}

const AppBarContent = props => {
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {hidden ? (
          <IconButton color='inherit' sx={{ ml: -2.75 }} onClick={toggleNavVisibility}>
            <Icon icon='mdi:menu' />
          </IconButton>
        ) : null}
        <CustomBreadcrumbs />
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
        <Autocomplete hidden={hidden} settings={settings} />
      </Box>
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        <OscarChatToggler settings={settings} saveSettings={saveSettings} />
        <UserModeToggler settings={settings} saveSettings={saveSettings} />
        {/* <UserNotificationDropdown settings={settings} notifications={notifications} /> */}
        <UserLanguageDropdown settings={settings} saveSettings={saveSettings} />
        <UserDropdown settings={settings} />
      </Box>
    </Box>
  )
}

export default AppBarContent
