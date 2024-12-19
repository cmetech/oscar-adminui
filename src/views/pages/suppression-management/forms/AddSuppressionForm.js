// AddSuppressionForm Component

import React, { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme, styled } from '@mui/material/styles'
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
import * as yup from 'yup'
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
  Autocomplete
} from '@mui/material'
import { TimePicker, DateTimePicker } from '@mui/x-date-pickers'
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import axios from 'axios'
import { toast } from 'react-hot-toast'

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

// const SwitchStyled = styled(Switch)(({ theme }) => ({
//   '& .MuiSwitch-switchBase.Mui-checked': {
//     color: theme.palette.customColors.accent
//   },
//   '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
//     backgroundColor: theme.palette.customColors.accent
//   }
// }))

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
    valid_from: yup
      .mixed()
      .nullable()
      .test('is-date', 'Invalid date format', value => !value || dayjs.isDayjs(value)),
    valid_until: yup
      .mixed()
      .nullable()
      .test('is-date', 'Invalid date format', value => !value || dayjs.isDayjs(value))
      .test('is-after-valid-from', 'Must be after Valid From date', function (value) {
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
    description: 'Enter suppression window name and description.'
  },
  {
    title: 'Suppression Window',
    subtitle: 'Define Suppression',
    description: 'Specify the suppression window details.'
  },
  {
    title: 'Review',
    subtitle: 'Summary',
    description: 'Review your changes before submitting.'
  }
]

const TimePickerStyled = styled(TimePicker)(({ theme }) => ({
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.customColors.accent
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.customColors.accent
    }
  }
}))

const DateTimePickerStyled = styled(DateTimePicker)(({ theme }) => ({
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.customColors.accent
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.customColors.accent
    }
  }
}))

const AddSuppressionForm = ({ open, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const setRefetchTrigger = useSetAtom(refetchSuppressionsTriggerAtom)
  const session = useSession()
  const userTimezone = session?.data?.user?.timezone || 'UTC'

  // ** Stepper state
  const [activeStep, setActiveStep] = useState(0)
  const [formErrors, setFormErrors] = useState({})

  const [timezone] = useAtom(timezoneAtom)
  const [dateRange, setDateRange] = useState(getDefaultDateRange(timezone))
  const extendedPredefinedRangesDayjs = getExtendedPredefinedRangesDayjs(timezone, t)

  // ** Form state
  const [suppressionForm, setSuppressionForm] = useState({
    name: '',
    description: '',
    startTime: dayjs(),
    endTime: dayjs().add(1, 'hour'),
    timezone: userTimezone,
    selectedDays: ['0', '1', '2', '3', '4', '5', '6'],
    valid_from: null,
    valid_until: null
  })

  // ** Function to calculate maximum end date/time
  const getMaxEndDateTime = () => {
    return dateRange[0] ? dayjs(dateRange[0]).add(12, 'hour') : null
  }

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
  }

  // ** Handle Stepper
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = async () => {
    const currentStepSchema = stepValidationSchemas[activeStep]
    try {
      if (currentStepSchema) {
        console.log('Form values before validation:', suppressionForm)
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

  // ** Submit the form
  const submitSuppression = async () => {
    try {
      const { name, description, startTime, endTime, timezone, selectedDays, valid_from, valid_until } = suppressionForm

      const data = {
        name,
        description,
        start_hour: startTime.hour(),
        start_minute: startTime.minute(),
        end_hour: endTime.hour(),
        end_minute: endTime.minute(),
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

      await axios.post('/api/suppressions', data)

      // Update the data
      setRefetchTrigger(prev => prev + 1)

      // Show success message
      toast.success(t('Suppression window added successfully'))

      // Clean up and close
      if (typeof onSuccess === 'function') {
        onSuccess()
      }

      // Reset form and close dialog
      setSuppressionForm({
        name: '',
        description: '',
        startTime: dayjs(),
        endTime: dayjs().add(1, 'hour'),
        timezone: userTimezone,
        selectedDays: ['0', '1', '2', '3', '4', '5', '6'],
        valid_from: null,
        valid_until: null
      })

      onClose()
    } catch (error) {
      console.error('Error adding suppression:', error)
      toast.error(error.response?.data?.message || error.message || t('Failed to add suppression window'))
    }
  }

  const handleClose = () => {
    setSuppressionForm({
      name: '',
      description: '',
      startTime: dayjs(),
      endTime: dayjs().add(1, 'hour'),
      timezone: userTimezone,
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
                <TimePickerStyled
                  label={t('Start Time')}
                  value={suppressionForm.startTime}
                  onChange={newValue => {
                    console.log('New start time value:', newValue)
                    setSuppressionForm(prev => ({
                      ...prev,
                      startTime: newValue
                    }))
                  }}
                  viewRenderers={{
                    hours: renderDigitalClockTimeView
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(formErrors?.startTime),
                      helperText: formErrors?.startTime
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
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TimePickerStyled
                  label={t('End Time')}
                  value={suppressionForm.endTime}
                  onChange={newValue => {
                    console.log('New end time value:', newValue)
                    setSuppressionForm(prev => ({
                      ...prev,
                      endTime: newValue
                    }))
                  }}
                  viewRenderers={{
                    hours: renderDigitalClockTimeView
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(formErrors?.endTime),
                      helperText: formErrors?.endTime
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
                    }
                  }}
                />
              </Grid>
              {/* <Grid item xs={12} md={6}>
                <DateTimePickerStyled
                  label={t('Valid From (Optional)')}
                  value={suppressionForm.valid_from}
                  onChange={newValue => handleFormChange(newValue, 'valid_from')}
                  views={['year', 'month', 'day', 'hours', 'minutes']}
                  timeSteps={{ minutes: 10 }}
                  viewRenderers={{
                    hours: renderDigitalClockTimeView
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(formErrors?.valid_from),
                      helperText: formErrors?.valid_from,
                      size: 'small',
                      color: 'secondary',
                      focused: true,
                      InputProps: {
                        endAdornment: <Icon icon='mdi:calendar' />
                      }
                    },
                    popper: {
                      sx: {
                        zIndex: 9999
                      }
                    },
                    layout: {
                      sx: {
                        '.MuiPickersLayout-root': {
                          backgroundColor:
                            theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.common.white
                        }
                      }
                    },
                    day: {
                      sx: {
                        '& .MuiPickersDay-root': {
                          color:
                            theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
                          '&:hover': {
                            color: theme.palette.customColors.accent
                          },
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.customColors.accent
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
                        '& .MuiButton-root': {
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
                <DateTimePickerStyled
                  label={t('Valid Until (Optional)')}
                  value={suppressionForm.valid_until}
                  onChange={newValue => handleFormChange(newValue, 'valid_until')}
                  minDateTime={suppressionForm.valid_from ? dayjs(suppressionForm.valid_from) : null}
                  views={['year', 'month', 'day', 'hours', 'minutes']}
                  timeSteps={{ minutes: 10 }}
                  viewRenderers={{
                    hours: renderDigitalClockTimeView
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(formErrors?.valid_until),
                      helperText: formErrors?.valid_until,
                      size: 'small',
                      color: 'secondary',
                      focused: true,
                      InputProps: {
                        endAdornment: <Icon icon='mdi:calendar' />
                      }
                    },
                    popper: {
                      sx: {
                        zIndex: 9999
                      }
                    },
                    layout: {
                      sx: {
                        '.MuiPickersLayout-root': {
                          backgroundColor:
                            theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.common.white
                        }
                      }
                    },
                    day: {
                      sx: {
                        '& .MuiPickersDay-root': {
                          color:
                            theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
                          '&:hover': {
                            color: theme.palette.customColors.accent
                          },
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.customColors.accent
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
                        '& .MuiButton-root': {
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
              </Grid> */}
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
            <Typography variant='h6' sx={{ mt: 2 }}>
              {t('Review Your Changes')}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Typography variant='subtitle1'>
                  <strong>{t('Name')}:</strong> {suppressionForm.name}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>{t('Description')}:</strong> {suppressionForm.description}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>{t('Start Time')}:</strong> {suppressionForm.startTime.format('HH:mm')}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>{t('End Time')}:</strong> {suppressionForm.endTime.format('HH:mm')}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>{t('Timezone')}:</strong> {suppressionForm.timezone}
                </Typography>
                {suppressionForm.valid_from && (
                  <Typography variant='subtitle1'>
                    <strong>{t('Valid From')}:</strong> {dayjs(suppressionForm.valid_from).format('YYYY-MM-DD HH:mm')}
                  </Typography>
                )}
                {suppressionForm.valid_until && (
                  <Typography variant='subtitle1'>
                    <strong>{t('Valid Until')}:</strong> {dayjs(suppressionForm.valid_until).format('YYYY-MM-DD HH:mm')}
                  </Typography>
                )}
                <Typography variant='subtitle1'>
                  <strong>{t('Days of Week')}:</strong>{' '}
                  {suppressionForm.selectedDays
                    .map(dayValue => DAYS.find(day => day.value === dayValue)?.label)
                    .join(', ')}
                </Typography>
              </Grid>
            </Grid>
          </Fragment>
        )
      default:
        return 'Unknown Step'
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
            {t('Add Suppression Window')}
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
            {t('Add Suppression Information')}
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

export default AddSuppressionForm
