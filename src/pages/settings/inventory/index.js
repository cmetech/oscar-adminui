// ** React Imports
import { useContext, useState } from 'react'
import getConfig from 'next/config'

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
import DatacentersList from 'src/views/pages/inventory/DatacentersList'
import EnvironmentsList from 'src/views/pages/inventory/EnvironmentsList'
import ServersList from 'src/views/pages/inventory/ServersList'
import ComponentsList from 'src/views/pages/inventory/ComponentsList'
import SubcomponentsList from 'src/views/pages/inventory/SubcomponentsList'

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

  const [value, setValue] = useState('1')
  const [datacenterTotal, setDatacenterTotal] = useState(0)
  const [environmentTotal, setEnvironmentTotal] = useState(0)
  const [serverTotal, setServerTotal] = useState(0)
  const [componentTotal, setComponentTotal] = useState(0)
  const [subcomponentTotal, setSubcomponentTotal] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='assets'>
            {datacenterTotal == 0 ? (
              <Tab value='1' label='Datacenters' />
            ) : (
              <Tab value='1' label={'Datacenters (' + datacenterTotal + ')'} />
            )}
            {environmentTotal == 0 ? (
              <Tab value='2' label='Environments' />
            ) : (
              <Tab value='2' label={'Environments (' + environmentTotal + ')'} />
            )}
            {serverTotal == 0 ? (
              <Tab value='3' label='Servers' />
            ) : (
              <Tab value='3' label={'Servers (' + serverTotal + ')'} />
            )}
            {componentTotal == 0 ? (
              <Tab value='4' label='Components' />
            ) : (
              <Tab value='4' label={'Components (' + componentTotal + ')'} />
            )}
            {subcomponentTotal == 0 ? (
              <Tab value='5' label='SubComponents' />
            ) : (
              <Tab value='5' label={'SubComponents (' + subcomponentTotal + ')'} />
            )}
          </TabList>
          <TabPanel value='1'>
            <DatacentersList set_total={setDatacenterTotal} total={datacenterTotal} />
          </TabPanel>
          <TabPanel value='2'>
            <EnvironmentsList set_total={setEnvironmentTotal} total={environmentTotal} />
          </TabPanel>
          <TabPanel value='3'>
            <ServersList set_total={setServerTotal} total={serverTotal} />
          </TabPanel>
          <TabPanel value='4'>
            <ComponentsList set_total={setComponentTotal} total={componentTotal} />
          </TabPanel>
          <TabPanel value='5'>
            <SubcomponentsList set_total={setSubcomponentTotal} total={subcomponentTotal} />
          </TabPanel>
        </TabContext>
      </Grid>
    </Grid>
  )
}

Settings.acl = {
  action: 'manage',
  subject: 'settings-page'
}

export default Settings
