// ** React Imports
import { useContext, useState, useEffect, forwardRef, Fragment, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAtom } from 'jotai'
import { timezoneAtom } from 'src/lib/atoms'
import {
  predefinedRangesDayjs,
  today,
  todayRounded,
  todayRoundedPlus1hour,
  yesterdayRounded,
  getLast24Hours,
  getDefaultDateRange,
  getExtendedPredefinedRangesDayjs
} from 'src/lib/calendar-timeranges'
import dayjs from 'src/lib/dayjs-config'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import toast from 'react-hot-toast'
import axios from 'axios'

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

// ** MoreActionsDropdown Component
const MoreActionsDropdown = ({ onAction }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { t } = useTranslation()
  const theme = useTheme()

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMenuItemClick = action => {
    onAction(action)
    handleClose()
  }

  const menuItemStyles = {
    py: 2,
    px: 4,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.text.primary,
    textDecoration: 'none',
    '& svg': {
      mr: 2,
      fontSize: '1.375rem',
      color: theme.palette.text.primary
    }
  }

  return (
    <Fragment>
      <IconButton color='secondary' onClick={handleClick}>
        <Icon icon='mdi:menu' />
      </IconButton>
      <Menu
        id='more-actions-menu'
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4 } }}
      >
        <MenuItem sx={{ p: 0 }} onClick={() => handleMenuItemClick('reload_configuration')}>
          <Box sx={menuItemStyles}>
            <Icon icon='mdi:reload' />
            {t('Reload Configuration')}
          </Box>
        </MenuItem>
        <MenuItem sx={{ p: 0 }} onClick={() => handleMenuItemClick('reload_rules')}>
          <Box sx={menuItemStyles}>
            <Icon icon='mdi:reload' />
            {t('Reload Rules')}
          </Box>
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

// ** Main Component
const Alerts = () => {
  // ** Hooks
  const ability = useContext(AbilityContext)
  const { t } = useTranslation()
  const theme = useTheme()

  // ** Get the user's selected timezone
  const [timezone] = useAtom(timezoneAtom)

  const [value, setValue] = useState('1')
  const [alertGroupTotal, setAlertGroupTotal] = useState(0)
  const [activeAlertsTotal, setActiveAlertsTotal] = useState(0)
  // ** Initialize dateRange state with the default date range
  const [dateRange, setDateRange] = useState(getDefaultDateRange(timezone))
  const [onAccept, setOnAccept] = useState(getDefaultDateRange(timezone))

  // ** Get extended predefined ranges
  const extendedPredefinedRangesDayjs = getExtendedPredefinedRangesDayjs(timezone, t)

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [actionToConfirm, setActionToConfirm] = useState('')

  const handleChange = (event, newValue) => {
    setValue(newValue)
    if (newValue === '2') {
      const newDateRange = getDefaultDateRange(timezone)
      setDateRange(newDateRange)
      setOnAccept(newDateRange)
    }
  }

  const handleOnAccept = value => {
    const [start, end] = value
    if (start && end) {
      const diff = dayjs(end).diff(dayjs(start), 'hour', true)
      if (diff > 12) {
        // Adjust the end date to 12 hours from the start
        const newEndDate = dayjs(start).add(12, 'hour')
        setDateRange([start, newEndDate])

        // Show a toast message
        toast.error('You cannot select a range longer than 12 hours. The end time has been adjusted accordingly.')
        setError('You cannot select a range longer than 12 hours.')
      } else {
        setDateRange(value)
        setError('')
      }
    } else {
      setDateRange(value)
    }
  }

  // ** Add useEffect to update dateRange when timezone changes
  useEffect(() => {
    // Update dateRange and onAccept when timezone changes
    const newDateRange = getDefaultDateRange(timezone)
    setDateRange(newDateRange)
    setOnAccept(newDateRange)
  }, [timezone])

  // ** Function to calculate maximum end date/time
  const getMaxEndDateTime = () => {
    return dateRange[0] ? dayjs(dateRange[0]).add(12, 'hour') : null
  }

  const handleMoreActions = action => {
    setActionToConfirm(action)
    setConfirmationDialogOpen(true)
  }

  const handleConfirmAction = async () => {
    try {
      let url = ''
      if (actionToConfirm === 'reload_configuration') {
        url = '/api/alertmanager'
      } else if (actionToConfirm === 'reload_rules') {
        url = '/api/alertmanager/rules'
      }

      await axios.post(url)
      toast.success(t(`${actionToConfirm.replace('_', ' ')} successful`))
    } catch (error) {
      console.error(`Failed to ${actionToConfirm}`, error)
      toast.error(t(`Failed to ${actionToConfirm}`))
    } finally {
      setConfirmationDialogOpen(false)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={10}>
          <Typography variant='h4'>{t('Alert Management')}</Typography>
          <MoreActionsDropdown onAction={handleMoreActions} />
        </Box>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmationDialogOpen}
          onClose={() => setConfirmationDialogOpen(false)}
          aria-labelledby='confirmation-dialog-title'
        >
          <DialogTitle id='confirmation-dialog-title'>{t('Confirm Action')}</DialogTitle>
          <DialogContent>
            <Typography>{t(`Are you sure you want to ${actionToConfirm.replace('_', ' ')}?`)}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmationDialogOpen(false)} variant='outlined' color='secondary'>
              {t('Cancel')}
            </Button>
            <Button onClick={handleConfirmAction} variant='contained' color='primary'>
              {t('Confirm')}
            </Button>
          </DialogActions>
        </Dialog>

        {value === '2' && (
          <DateTimeRangePicker
            calendars={2}
            closeOnSelect={false}
            value={dateRange}
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
                items: extendedPredefinedRangesDayjs,
                sx: {
                  '& .MuiChip-root': {
                    color:
                      theme.palette.mode === 'dark'
                        ? theme.palette.customColors.brandYellow
                        : theme.palette.primary.main,
                    '&:hover': {
                      color:
                        theme.palette.mode === 'dark'
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
              },
              endDesktopDateTimePicker: {
                maxDateTime: getMaxEndDateTime()
              },
              endMobileDateTimePicker: {
                maxDateTime: getMaxEndDateTime()
              }
            }}
          />
        )}
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
  action: 'read',
  subject: 'alerts'
}

export default Alerts
