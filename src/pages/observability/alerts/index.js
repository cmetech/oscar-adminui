// ** React Imports
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { predefinedRangesDayjs, today, todayRounded, todayRoundedPlus1hour, yesterdayRounded } from 'src/lib/calendar-timeranges'
import dayjs from 'dayjs'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { Box, Typography, TextField } from '@mui/material'

// ** Styled Component Imports
import { styled, useTheme } from '@mui/material/styles'
import MuiTabList from '@mui/lab/TabList'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Views
import AlertHistorytList from 'src/views/pages/alerts/AlertHistoryList'
import ActiveAlertsList from 'src/views/pages/alerts/ActiveAlertsList'
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'
import { DateTimeRangePicker } from '@mui/x-date-pickers-pro/DateTimeRangePicker'
import { renderDigitalClockTimeView } from '@mui/x-date-pickers/timeViewRenderers'
import { CustomDateTimeRangePicker } from 'src/lib/styled-components'

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
  const theme = useTheme()

  const [value, setValue] = useState('1')
  const [alertGroupTotal, setAlertGroupTotal] = useState(0)
  const [activeAlertsTotal, setActiveAlertsTotal] = useState(0)
  const [dateRange, setDateRange] = useState([yesterdayRounded, todayRoundedPlus1hour])
  const [onAccept, setOnAccept] = useState(value)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleOnAccept = value => {
    console.log('onAccept', value)
    setOnAccept(value)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={6}>
          <Typography variant='h4'>{t('Alert Management')}</Typography>
          {value === '2' && (
            <DateTimeRangePicker
              calendars={2}
              closeOnSelect={false}
              value={dateRange}
              defaultValue={[yesterdayRounded, todayRoundedPlus1hour]}
              views={['day', 'hours']}
              timeSteps={{ minute: 10 }}
              viewRenderers={{ hours: renderDigitalClockTimeView }}
              onChange={newValue => {
                // console.log('Date range:', newValue)
                setDateRange(newValue)
              }}
              onAccept={handleOnAccept}
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
                desktopPaper: {
                  style: {
                    backgroundColor:
                      theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.common.white
                  }
                },

                day: {
                  sx: {
                    '& .MuiPickersDay-root': {
                      color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
                      '&:hover': {
                        color: theme.palette.customColors.accent
                      }
                    },
                    '& .MuiPickersDay-root.Mui-selected': {
                      color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.white
                    }
                  }
                },

                shortcuts: {
                  items: predefinedRangesDayjs,
                  sx: {
                    '& .MuiChip-root': {
                      color:
                        theme.palette.mode === 'dark'
                          ? theme.palette.customColors.brandYellow
                          : theme.palette.primary.main,
                      '&:hover': {
                        color:
                          theme.palette.mode == 'dark'
                            ? theme.palette.customColors.brandYellow
                            : theme.palette.primary.main,
                        backgroundColor:
                          theme.palette.mode === 'dark' ? theme.palette.secondary.dark : theme.palette.secondary.light
                      }
                    }
                  }
                },

                digitalClockItem: {
                  sx: {
                    '&:hover': {
                      color:
                        theme.palette.mode === 'dark'
                          ? theme.palette.customColors.brandBlack
                          : theme.palette.customColors.black,
                      background:
                        theme.palette.mode == 'dark'
                          ? theme.palette.customColors.brandGray4
                          : theme.palette.customColors.brandGray4
                    },
                    '&.Mui-selected': {
                      background:
                        theme.palette.mode == 'dark'
                          ? theme.palette.customColors.brandYellow4
                          : theme.palette.customColors.brandGray1
                    }
                  }
                },

                actionBar: {
                  actions: ['clear', 'today', 'cancel', 'accept'],
                  sx: {
                    '& .MuiDialogActions-root, .MuiButton-root': {
                      // Targeting buttons inside MuiDialogActions-root
                      borderWidth: '1px', // Ensure there's a visible border
                      borderStyle: 'solid', // Necessary for the border to show
                      borderColor:
                        theme.palette.mode === 'dark'
                          ? theme.palette.customColors.brandGray1b
                          : theme.palette.primary.main,
                      color:
                        theme.palette.mode === 'dark'
                          ? theme.palette.customColors.brandWhite
                          : theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 255, 0.04)', // Custom background color on hover
                        borderColor:
                          theme.palette.mode === 'dark'
                            ? theme.palette.customColors.brandWhite
                            : theme.palette.primary.main,
                        color:
                          theme.palette.mode === 'dark'
                            ? theme.palette.customColors.brandYellow
                            : theme.palette.primary.main
                      }
                    }
                  }
                }
              }}
            />
          )}
        </Box>
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='Alert-tabs'>
            {activeAlertsTotal == 0 ? (
              <Tab value='1' label={t('Active Alerts')} icon={<Icon icon='mdi:bell-alert' />} iconPosition='start' />
            ) : (
              <Tab
                value='1'
                label={`${t('Active Alerts')} (${activeAlertsTotal})`}
                icon={<Icon icon='mdi:bell-alert' />}
                iconPosition='start'
              />
            )}
            {alertGroupTotal == 0 ? (
              <Tab value='2' label={t('Alert History')} icon={<Icon icon='mdi:bell-alert' />} iconPosition='start' />
            ) : (
              <Tab
                value='2'
                label={`${t('Alert History')} (${alertGroupTotal})`}
                icon={<Icon icon='mdi:bell-alert' />}
                iconPosition='start'
              />
            )}
          </TabList>
          <TabPanel value='1'>
            <ActiveAlertsList
              dateRange={dateRange}
              set_total={setActiveAlertsTotal}
              total={activeAlertsTotal}
              onAccept={onAccept}
            />
          </TabPanel>
          <TabPanel value='2'>
            <AlertHistorytList
              dateRange={dateRange}
              set_total={setAlertGroupTotal}
              total={alertGroupTotal}
              onAccept={onAccept}
            />
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
