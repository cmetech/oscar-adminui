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
import UserShortcutsDropdown from 'src/layouts/components/shared-components/UserShortcutsDropdown'
import UserModeToggler from 'src/layouts/components/shared-components/UserModeToggler'
import UserDropdown from 'src/layouts/components/UserDropdown'
import UserNotificationDropdown from 'src/layouts/components/UserNotificationDropdown'
import UserLanguageDropdown from 'src/layouts/components/UserLanguageDropdown'
import OscarChatToggler from 'src/layouts/components/shared-components/OscarChatToggler'

const CustomBreadcrumbs = () => {
  const router = useRouter()
  const theme = useTheme()
  const { t } = useTranslation()
  const path = router.pathname.replace(/\/$/g, '')

  console.log('path', path)

  const breadcrumbNameMap = {
    '/home': { name: t('Overview'), icon: 'mdi:telescope' },
    '/observability/alerts': { name: t('Alerts'), icon: 'mdi:bell' },
    '/observability/performance': { name: t('Performance'), icon: 'mdi:speedometer' },
    '/observability/capacity': { name: t('Capacity'), icon: 'mdi:thermometer-check' },
    '/observability/inventory': { name: t('Inventory Management'), icon: 'mdi:server' },
    '/observability/logs/explorer': { name: t('Log Explorer'), icon: 'mdi:explore' },
    '/service-continuity/slo': { name: 'SLOs', icon: 'mdi:target' },
    '/service-continuity/tasks': { name: t('Tasks'), icon: 'mdi:arrow-decision-auto' },
    '/service-continuity/workflows': { name: t('Workflows'), icon: 'mdi:workflow' },
    '/service-continuity/availability': { name: t('Availability'), icon: 'mdi:list-status' },
    '/management/application/services': { name: t('Services'), icon: 'mdi:server-network' },
    '/management/security/users': { name: t('User Management'), icon: 'mdi:account-multiple' },
    '/account-settings/account': { name: t('Account Settings'), icon: 'mdi:account-settings' },
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
  const theme = useTheme()

  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box
        bgcolor={theme.palette.mode === 'dark' ? 'customColors.dark' : ''}
        component='img'
        sx={{ display: 'flex', alignItems: 'center', paddingLeft: 3, paddingTop: 1, paddingBottom: 1 }}
        src={theme.palette.mode == 'dark' ? '/images/logo.png' : '/images/ERI_horizontal_black_login_RGB.png'}
        alt='logo'
        width='170px'
        height='40px'
      />
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        <UserModeToggler settings={settings} saveSettings={saveSettings} />
        <UserLanguageDropdown settings={settings} saveSettings={saveSettings} />
        <UserDropdown settings={settings} />
      </Box>
    </Box>
  )
}

export default AppBarContent
