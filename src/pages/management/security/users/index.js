// ** React Imports
import { useContext, useState } from 'react'
import getConfig from 'next/config'
import { useTranslation } from 'react-i18next'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Tab from '@mui/material/Tab'
import MuiTabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'

import { styled, useTheme } from '@mui/material/styles'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Views
import UsersList from 'src/views/pages/users/UsersList'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { set } from 'nprogress'
import { get } from 'react-hook-form'

const TabList = styled(MuiTabList)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    minWidth: 65,
    minHeight: 40,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.up('md')]: {
      minWidth: 130
    }
  }
}))

const Settings = () => {
  // ** Hooks
  const ability = useContext(AbilityContext)
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()
  const { t } = useTranslation()

  const [value, setValue] = useState('1')
  const [userTotal, setUserTotal] = useState(0)
  const [serverTotal, setServerTotal] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='users'>
            {userTotal == 0 ? (
              <Tab value='1' label={t('Users')} icon={<Icon icon='mdi:user' />} iconPosition='start' />
            ) : (
              <Tab
                value='1'
                label={`${t('Users')} (${userTotal})`}
                icon={<Icon icon='mdi:users' />}
                iconPosition='start'
              />
            )}
          </TabList>
          <TabPanel value='1'>
            <UsersList set_user_total={setUserTotal} />
          </TabPanel>
        </TabContext>
      </Grid>
    </Grid>
  )
}

Settings.acl = {
  action: 'manage',
  subject: 'security'
}

export default Settings
