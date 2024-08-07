// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Chip from '@mui/material/Chip'
import getConfig from 'next/config'

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
    '/observability/alerts': { name: t('Alerts'), icon: 'mdi:bell' },
    '/observability/performance': { name: t('Performance'), icon: 'mdi:speedometer' },
    '/observability/capacity': { name: t('Capacity'), icon: 'mdi:thermometer-check' },
    '/observability/inventory': { name: t('Inventory Management'), icon: 'mdi:server' },
    '/observability/logs/explorer': { name: t('Log Explorer'), icon: 'mdi:explore' },
    '/service-continuity/slo': { name: 'SLOs', icon: 'mdi:target' },
    '/service-continuity/tasks': { name: t('Tasks'), icon: 'mdi:arrow-decision-auto' },
    '/service-continuity/workflows': { name: t('Workflows'), icon: 'mdi:workflow' },
    '/service-continuity/availability': { name: t('Availability'), icon: 'mdi:list-status' },
    '/service-continuity/probes': { name: t('Probes'), icon: 'mdi:monitor-eye' },
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
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props
  const { publicRuntimeConfig } = getConfig()
  const docs_host = publicRuntimeConfig.MKDOCS_HOST || 'localhost'
  const domain = publicRuntimeConfig.DOMAIN || 'localhost'
  const theme = useTheme()

  const shortcuts = [
    {
      title: 'Academy',
      subtitle: 'FAQs & Articles',
      icon: 'mdi:help-circle-outline',
      url: `https://${docs_host}/ext/docs/?theme=${theme.palette.mode}`,
      externalLink: true,
      openInNewTab: true
    },
    {
      title: 'Workflows',
      subtitle: 'Manage Workflows',
      icon: 'mdi:workflow',
      url: `https://${domain}/airflow`,
      externalLink: true,
      openInNewTab: true
    },
    {
      title: 'Log Explorer',
      subtitle: 'Explore Logs',
      icon: 'mdi:math-log',
      url: '/api/oscar/ui?path=explore',
      externalLink: true,
      openInNewTab: true
    },
    {
      title: 'Monitor Workers',
      url: `https://${domain}:5555/flower/`,
      subtitle: 'Celery Flower',
      icon: 'mdi:monitor-dashboard',
      externalLink: true,
      openInNewTab: true
    }
  ]

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
        <UserShortcutsDropdown settings={settings} shortcuts={shortcuts} />
        <UserLanguageDropdown settings={settings} saveSettings={saveSettings} />
        <UserDropdown settings={settings} />
      </Box>
    </Box>
  )
}

export default AppBarContent
