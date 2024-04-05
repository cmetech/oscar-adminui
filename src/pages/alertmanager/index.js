// ** React Imports
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// ** Styled Component Imports
import { styled } from '@mui/material/styles'
import MuiTabList from '@mui/lab/TabList'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Views
import AlertHistorytList from 'src/views/pages/alerts/AlertHistoryList'
//import ActiveAlertsList from 'src/views/pages/inventory/DatacentersList'
import DatacentersList from 'src/views/pages/inventory/DatacentersList'
//alerts/ActiveAlertsList'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

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

const Alerts = () => {
  // ** Hooks
  const ability = useContext(AbilityContext)
  const { t } = useTranslation()
  const [value, setValue] = useState('1')
  const [alertGroupTotal, setAlertGroupTotal] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label="Alert-tabs">
          {alertGroupTotal == 0 ? (
              <Tab value='1' label={t('Alert History')} icon={<Icon icon='mdi:arrow-decision-auto' />} iconPosition='start' />
            ) : (
              <Tab
                value='1'
                label={`${t('Alert History')} (${alertGroupTotal})`}
                icon={<Icon icon='mdi:arrow-decision-auto' />}
                iconPosition='start'
              />
            )}
            <Tab value="2" label={t('Active Alerts')} />
          </TabList>
          <TabPanel value="1">
            <AlertHistorytList set_total={setAlertGroupTotal} total={alertGroupTotal} />
          </TabPanel>
          <TabPanel value="2">
            <DatacentersList />
          </TabPanel>
        </TabContext>
      </Grid>
    </Grid>
  )
}

Alerts.acl = {
  action: 'manage',
  subject: 'alerts-page'
}

export default Alerts
