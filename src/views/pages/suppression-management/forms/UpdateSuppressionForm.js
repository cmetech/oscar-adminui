// UpdateSuppressionForm Component

import React, { Fragment, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme, styled } from '@mui/material/styles'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useAtom, useSetAtom } from 'jotai'
import { refetchSuppressionsTriggerAtom, timezoneAtom } from 'src/lib/atoms'
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
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { useSession } from 'next-auth/react'
import { renderDigitalClockTimeView } from '@mui/x-date-pickers/timeViewRenderers'

// ** MUI Imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Autocomplete
} from '@mui/material'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import * as yup from 'yup'

// ** Custom Components Imports
import StepperWrapper from 'src/@core/styles/mui/stepper'
import StepperCustomDot from 'src/views/pages/misc/forms/StepperCustomDot'

// ** Timezone data
import { getAllTimezones } from 'src/lib/enums'

// ** Styled Components
const TextFieldStyled = styled(TextField)(({ theme }) => ({
  '& label.Mui-focused': {
    color: theme.palette.customColors.accent
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.customColors.accent
    }
  },
  marginTop: theme.spacing(2)
}))

const AutocompleteStyled = styled(Autocomplete)(({ theme }) => ({
  '& .MuiInputLabel-outlined.Mui-focused': {
    color: theme.palette.customColors.accent
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.customColors.accent
    }
  }
}))

const SwitchStyled = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: theme.palette.customColors.accent
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: theme.palette.customColors.accent
  }
}))

const DAYS = [
  { value: '0', label: 'Sun' },
  { value: '1', label: 'Mon' },
  { value: '2', label: 'Tue' },
  { value: '3', label: 'Wed' },
  { value: '4', label: 'Thu' },
  { value: '5', label: 'Fri' },
  { value: '6', label: 'Sat' }
]

// ** Validation schemas for each step
const stepValidationSchemas = [
  // Step 0: Name and Description
  yup.object().shape({
    name: yup.string().required('Name is required'),
    description: yup.string()
  }),
  // Step 1: Suppression Window Definition
  yup.object().shape({
    startTime: yup
      .mixed()
      .test('is-dayjs', 'Start Time is required', value => value && dayjs.isDayjs(value))
      .required('Start Time is required'),
    endTime: yup
      .mixed()
      .test('is-dayjs', 'End Time is required', value => value && dayjs.isDayjs(value))
      .required('End Time is required'),
    timezone: yup.string().required('Timezone is required'),
    selectedDays: yup.array().min(0, 'Select days for the suppression window'),
    valid_from: yup.mixed().nullable(),
    valid_until: yup
      .mixed()
      .nullable()
      .test('valid-range', 'End date must be after start date', function (value) {
        const { valid_from } = this.parent
        if (valid_from && value) {
          return dayjs(value).isAfter(dayjs(valid_from))
        }

        return true
      })
  })
  // Step 2: Review/Summary (no validation needed)
]

const steps = [
  {
    title: 'Name & Description',
    subtitle: 'Basic Information',
    description: 'Update suppression window name and description.'
  },
  {
    title: 'Suppression Window',
    subtitle: 'Define Suppression',
    description: 'Update the suppression window details.'
  },
  {
    title: 'Review',
    subtitle: 'Summary',
    description: 'Review your changes before submitting.'
  }
]

const UpdateSuppressionForm = ({ open, onClose, suppression }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const setRefetchTrigger = useSetAtom(refetchSuppressionsTriggerAtom)
  const [activeStep, setActiveStep] = useState(0)
  const [formErrors, setFormErrors] = useState({})
  const session = useSession()
  const userTimezone = session?.data?.user?.timezone || 'UTC'

  const [timezone] = useAtom(timezoneAtom)
  const [dateRange, setDateRange] = useState(getDefaultDateRange(timezone))
  const extendedPredefinedRangesDayjs = getExtendedPredefinedRangesDayjs(timezone, t)

  // Convert UTC times to user's timezone for display
  const [suppressionForm, setSuppressionForm] = useState({
    name: suppression?.name || '',
    description: suppression?.description || '',
    startTime: dayjs()
      .hour(suppression?.start_hour || 0)
      .minute(suppression?.start_minute || 0),
    endTime: dayjs()
      .hour(suppression?.end_hour || 0)
      .minute(suppression?.end_minute || 0),
    timezone: suppression?.timezone || 'UTC',
    selectedDays: suppression?.days_of_week?.split(',') || ['0', '1', '2', '3', '4', '5', '6'],
    valid_from: suppression?.valid_from ? dayjs(suppression.valid_from) : null,
    valid_until: suppression?.valid_until ? dayjs(suppression.valid_until) : null
  })

  const [loading, setLoading] = useState(false)

  // ** Handle form input changes
  const handleFormChange = (event, fieldName) => {
    const target = event.target || event
    const name = fieldName || target.name
    let value

    // Special handling for different field types
    if (name === 'startTime' || name === 'endTime' || name === 'valid_from' || name === 'valid_until') {
      value = dayjs(event) // Ensure we're creating a dayjs object for all date/time fields
    } else if (name === 'selectedDays') {
      value = event
    } else {
      value = target.value
    }

    setSuppressionForm(prevForm => ({
      ...prevForm,
      [name]: value
    }))

    // For debugging
    console.log(`Updated ${name}:`, value)
  }

  // ** Handle Stepper
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = async () => {
    const currentStepSchema = stepValidationSchemas[activeStep]
    try {
      if (currentStepSchema) {
        await currentStepSchema.validate(suppressionForm, { abortEarly: false })
      }
      setFormErrors({})
      if (activeStep === steps.length - 1) {
        submitSuppression()
      } else {
        setActiveStep(prevActiveStep => prevActiveStep + 1)
      }
    } catch (err) {
      console.log('Validation error:', err)
      const errors = {}
      if (err.inner && err.inner.length > 0) {
        err.inner.forEach(validationError => {
          errors[validationError.path] = validationError.message
        })
        setFormErrors(errors)
      } else {
        toast.error(err.message)
      }
    }
  }

  // ** Function to calculate maximum end date/time
  const getMaxEndDateTime = () => {
    return dateRange[0] ? dayjs(dateRange[0]).add(12, 'hour') : null
  }

  // ** Submit the form
  const submitSuppression = async () => {
    try {
      const { name, description, startTime, endTime, timezone, selectedDays, valid_from, valid_until } = suppressionForm

      // Convert times to UTC for storage
      const startTimeUTC = startTime.tz(timezone).tz('UTC')
      const endTimeUTC = endTime.tz(timezone).tz('UTC')

      const data = {
        name,
        description,
        start_hour: startTimeUTC.hour(),
        start_minute: startTimeUTC.minute(),
        end_hour: endTimeUTC.hour(),
        end_minute: endTimeUTC.minute(),
        timezone,
        is_recurring: true,
        days_of_week: selectedDays.join(','),
        valid_from: valid_from ? valid_from.tz(timezone).tz('UTC').toISOString() : null,
        valid_until: valid_until ? valid_until.tz(timezone).tz('UTC').toISOString() : null
      }

      // Validate that valid_until is after valid_from if both exist
      if (valid_from && valid_until) {
        if (dayjs(valid_until).isBefore(dayjs(valid_from))) {
          throw new Error(t('Valid Until date must be after Valid From date'))
        }
      }

      console.log('Submitting data:', data) // For debugging

      await axios.put(`/api/suppressions/${encodeURIComponent(suppression.id)}`, data)
      toast.success(t('Suppression window updated successfully'))
      setRefetchTrigger(prev => prev + 1)
      onClose()
    } catch (error) {
      console.error('Error updating suppression:', error)
      toast.error(error.response?.data?.message || t('Failed to update suppression window'))
    }
  }

  const handleClose = () => {
    setSuppressionForm({
      name: '',
      description: '',
      startTime: dayjs(),
      endTime: dayjs().add(1, 'hour'),
      timezone: 'UTC',
      selectedDays: ['0', '1', '2', '3', '4', '5', '6'],
      valid_from: null,
      valid_until: null
    })
    setActiveStep(0)
    setFormErrors({})
    onClose()
  }

  // ** Render functions for each step
  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Fragment>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextFieldStyled
                  required
                  label={t('Name')}
                  name='name'
                  fullWidth
                  value={suppressionForm.name}
                  onChange={handleFormChange}
                  InputProps={{
                    readOnly: true
                  }}
                  error={Boolean(formErrors?.name)}
                  helperText={formErrors?.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextFieldStyled
                  label={t('Description')}
                  name='description'
                  fullWidth
                  value={suppressionForm.description}
                  onChange={handleFormChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Fragment>
        )
      case 1:
        return (
          <Fragment>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TimePicker
                  label={t('Start Time')}
                  value={suppressionForm.startTime}
                  onChange={newValue => {
                    console.log('New start time value:', newValue)
                    setSuppressionForm(prev => ({
                      ...prev,
                      startTime: newValue
                    }))
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(formErrors?.startTime),
                      helperText: formErrors?.startTime
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TimePicker
                  label={t('End Time')}
                  value={suppressionForm.endTime}
                  onChange={newValue => {
                    console.log('New end time value:', newValue)
                    setSuppressionForm(prev => ({
                      ...prev,
                      endTime: newValue
                    }))
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(formErrors?.endTime),
                      helperText: formErrors?.endTime
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label={t('Valid From (Optional)')}
                  value={suppressionForm.valid_from}
                  onChange={newValue => handleFormChange(newValue, 'valid_from')}
                  views={['year', 'month', 'day', 'hours', 'minutes']}
                  timeSteps={{ minutes: 10 }}
                  viewRenderers={{
                    hours: renderDigitalClockTimeView
                  }}
                  sx={{ zIndex: 9999 }}
                  slotProps={{
                    popper: {
                      sx: { zIndex: 9999 }
                    },
                    layout: {
                      sx: { zIndex: 9999 }
                    },
                    textField: {
                      fullWidth: true,
                      error: Boolean(formErrors?.valid_from),
                      helperText: formErrors?.valid_from,
                      color: 'secondary',
                      focused: true,
                      InputProps: {
                        endAdornment: <Icon icon='mdi:calendar' />
                      }
                    },
                    desktopPaper: {
                      sx: {
                        backgroundColor:
                          theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.common.white
                      }
                    },
                    day: {
                      sx: {
                        '& .MuiPickersDay-root': {
                          color:
                            theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
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
                              theme.palette.mode === 'dark'
                                ? theme.palette.secondary.dark
                                : theme.palette.secondary.light
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
                          background: theme.palette.customColors.brandGray4
                        },
                        '&.Mui-selected': {
                          background:
                            theme.palette.mode === 'dark'
                              ? theme.palette.customColors.brandYellow4
                              : theme.palette.customColors.brandGray1
                        }
                      }
                    },
                    actionBar: {
                      actions: ['clear', 'today', 'cancel', 'accept'],
                      sx: {
                        '& .MuiDialogActions-root, .MuiButton-root': {
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor:
                            theme.palette.mode === 'dark'
                              ? theme.palette.customColors.brandGray1b
                              : theme.palette.primary.main,
                          color:
                            theme.palette.mode === 'dark'
                              ? theme.palette.customColors.brandWhite
                              : theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 255, 0.04)',
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
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label={t('Valid Until (Optional)')}
                  value={suppressionForm.valid_until}
                  onChange={newValue => handleFormChange(newValue, 'valid_until')}
                  minDateTime={suppressionForm.valid_from ? dayjs(suppressionForm.valid_from) : null}
                  slotProps={{
                    field: { dateSeparator: 'to' },
                    textField: ({ position }) => ({
                      color: position === 'start' ? 'secondary' : 'secondary',
                      focused: true,
                      InputProps: {
                        endAdornment: <Icon icon='mdi:calendar' />
                      },
                      error: Boolean(formErrors?.valid_until),
                      helperText: formErrors?.valid_until
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
                          color:
                            theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
                          '&:hover': {
                            color: theme.palette.customColors.accent
                          }
                        },
                        '& .MuiPickersDay-root.Mui-selected': {
                          color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.white
                        }
                      }
                    },
                    // ** Use the extended predefined ranges from calendar-timeranges.js
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
                              theme.palette.mode === 'dark'
                                ? theme.palette.secondary.dark
                                : theme.palette.secondary.light
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
              </Grid>
              <Grid item xs={12}>
                <AutocompleteStyled
                  options={getAllTimezones()}
                  value={suppressionForm.timezone}
                  onChange={(_, newValue) => handleFormChange({ value: newValue || 'UTC', name: 'timezone' })}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t('Timezone')}
                      fullWidth
                      error={Boolean(formErrors?.timezone)}
                      helperText={formErrors?.timezone}
                    />
                  )}
                  disableClearable
                  freeSolo
                  autoComplete
                  autoHighlight
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1'>{t('Days of Week')}</Typography>
                <ToggleButtonGroup
                  value={suppressionForm.selectedDays}
                  onChange={(e, newDays) => handleFormChange(newDays, 'selectedDays')}
                  aria-label='days of week'
                  multiple
                  fullWidth
                  sx={{ flexWrap: 'wrap' }}
                >
                  {DAYS.map(day => (
                    <ToggleButton
                      key={day.value}
                      value={day.value}
                      aria-label={day.label}
                      sx={{ flex: '1 0 14%', m: 0.5 }}
                    >
                      {day.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                {formErrors?.selectedDays && (
                  <Typography variant='caption' color='error'>
                    {formErrors.selectedDays}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Fragment>
        )
      case 2:
        return (
          <Fragment>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                  {t('Review Suppression Window Details')}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant='body2'>
                    <strong>{t('Name')}:</strong> {suppressionForm.name}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>{t('Description')}:</strong> {suppressionForm.description || t('No description')}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>{t('Time Window')}:</strong>{' '}
                    {`${suppressionForm.startTime.format('HH:mm')} - ${suppressionForm.endTime.format('HH:mm')} ${
                      suppressionForm.timezone
                    }`}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>{t('Days')}:</strong>{' '}
                    {suppressionForm.selectedDays.map(day => DAYS.find(d => d.value === day)?.label).join(', ')}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>{t('Valid From')}:</strong>{' '}
                    {suppressionForm.valid_from ? suppressionForm.valid_from.format('YYYY-MM-DD HH:mm') : t('Not set')}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>{t('Valid Until')}:</strong>{' '}
                    {suppressionForm.valid_until
                      ? suppressionForm.valid_until.format('YYYY-MM-DD HH:mm')
                      : t('Not set')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Fragment>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Dialog open={open} maxWidth='md' fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 10 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='md'
      sx={{
        '& .MuiDialog-paper': {
          zIndex: 1000
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {t('Update Suppression Window')}
          </Typography>
        </Box>
        <IconButton
          size='small'
          onClick={handleClose}
          sx={{ position: 'absolute', right: theme.spacing(2), top: theme.spacing(2) }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* Added content above the stepper */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 3 }}>
            {t('Update Suppression Information')}
          </Typography>
          <Typography variant='body2'>{t('Information submitted will be effective immediately.')}</Typography>
        </Box>

        <StepperWrapper>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => {
              return (
                <Step key={index}>
                  <StepLabel StepIconComponent={StepperCustomDot}>
                    <div className='step-label'>
                      <div>
                        <Typography className='step-title'>{t(step.title)}</Typography>
                        <Typography
                          className='step-subtitle'
                          style={{
                            color:
                              theme.palette.mode === 'dark'
                                ? theme.palette.customColors.brandYellow
                                : theme.palette.secondary.light
                          }}
                        >
                          {t(step.subtitle)}
                        </Typography>
                      </div>
                    </div>
                  </StepLabel>
                </Step>
              )
            })}
          </Stepper>
        </StepperWrapper>

        {/* Add spacing between StepperWrapper and form content */}
        <Box sx={{ mt: 4 }} />

        {/* Wrap the form content in a Box with padding */}
        <Box sx={{ paddingLeft: theme.spacing(5), paddingRight: theme.spacing(5) }}>
          <form onSubmit={e => e.preventDefault()}>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {steps[activeStep].title}
                </Typography>
                <Typography
                  variant='caption'
                  component='p'
                  paddingBottom={5}
                  className='step-subtitle'
                  style={{
                    color:
                      theme.palette.mode === 'dark'
                        ? theme.palette.customColors.brandYellow
                        : theme.palette.secondary.light
                  }}
                >
                  {steps[activeStep].description}
                </Typography>
              </Grid>
              {getStepContent(activeStep)}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  size='large'
                  variant='outlined'
                  color='secondary'
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  {t('Back')}
                </Button>
                <Button size='large' variant='contained' onClick={handleNext}>
                  {activeStep === steps.length - 1 ? t('Submit') : t('Next')}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateSuppressionForm
