// ** React Imports
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { predefinedRangesDayjs } from 'src/lib/calendar-timeranges'
import dayjs from 'dayjs'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { Box, Typography, TextField } from '@mui/material';

// ** Styled Component Imports
import { styled } from '@mui/material/styles'
import MuiTabList from '@mui/lab/TabList'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Views
import AlertHistorytList from 'src/views/pages/alerts/AlertHistoryList'
import ActiveAlertsList from 'src/views/pages/alerts/ActiveAlertsList'
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'
import { renderDigitalClockTimeView } from '@mui/x-date-pickers/timeViewRenderers'

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
  const [activeAlertsTotal, setActiveAlertsTotal] = useState(0)
  const [dateRange, setDateRange] = useState([null, null])

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
          <Typography variant="h4">{t('Alert Management')}</Typography>
          {value === '1' && (
            // Conditionally render the DateRangePicker when the Alert History tab is active
            <DateRangePicker
                calendars={2}
                closeOnSelect={false}
                value={dateRange}
                defaultValue={[dayjs().subtract(2, 'day'), dayjs()]}
                //disableFuture
                views={['day', 'hours']}
                timeSteps={{ minute: 15 }}
                viewRenderers={{ hours: renderDigitalClockTimeView }}
                onChange={newValue => {
                  console.log('Date range:', newValue)
                  setDateRange(newValue)
                }}
                slotProps={{
                  field: { dateSeparator: 'to' },
                  textField: ({ position }) => ({
                    size: 'small',
                    color: position === 'start' ? 'secondary' : 'secondary',
                    focused: true,
                    InputProps: {
                      endAdornment: <Icon icon='mdi:calendar' />
                    }
                  }),
                  shortcuts: {
                    items: predefinedRangesDayjs
                  }
                }}
              />
          )}
        </Box>
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
            {activeAlertsTotal == 0 ? (
              <Tab value='2' label={t('Active Alerts')} icon={<Icon icon='mdi:arrow-decision-auto' />} iconPosition='start' />
            ) : (
              <Tab
                value='2'
                label={`${t('Active Alerts')} (${activeAlertsTotal})`}
                icon={<Icon icon='mdi:arrow-decision-auto' />}
                iconPosition='start'
              />
            )}
          </TabList>
          <TabPanel value="1">
            <AlertHistorytList dateRange={dateRange} set_total={setAlertGroupTotal} total={alertGroupTotal} />
          </TabPanel>
          <TabPanel value="2">
            <ActiveAlertsList dateRange={dateRange} set_total={setActiveAlertsTotal} total={activeAlertsTotal} />
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
