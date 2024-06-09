// ** React Imports
import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { atom, useAtom, useSetAtom } from 'jotai'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Step from '@mui/material/Step'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Stepper from '@mui/material/Stepper'
import MenuItem from '@mui/material/MenuItem'
import StepLabel from '@mui/material/StepLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import Autocomplete from '@mui/material/Autocomplete'
import Select from '@mui/material/Select'
import Checkbox from '@mui/material/Checkbox'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip'
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'
import moment from 'moment-timezone'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import StepperCustomDot from 'src/views/pages/misc/forms/StepperCustomDot'
import { useTheme, styled } from '@mui/material/styles'
import { refetchNotifierTriggerAtom } from 'src/lib/atoms'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Styled Component
import StepperWrapper from 'src/@core/styles/mui/stepper'

// ** Import yup for form validation
import * as yup from 'yup'

// Define initial state for the notifier form
const initialNotifierFormState = {
  name: '',
  type: 'email', // default to email notifier
  status: 'enabled',
  description: '',
  schedule: {
    year: '',
    month: '',
    day: '',
    day_of_week: '',
    hour: '',
    minute: '',
    second: '',
    start_date: '',
    end_date: '',
    timezone: '',
    jitter: 0
  },
  email_addresses: [''],
  webhook_url: ''
}

const steps = [
  {
    title: 'Notifier Type',
    subtitle: 'Type',
    description: 'Select the notifier type.'
  },
  {
    title: 'Notifier Details',
    subtitle: 'Details',
    description: 'Edit the notifier details.'
  },
  {
    title: 'Notifier Schedule',
    subtitle: 'Schedule',
    description: 'Edit the notifier schedule.'
  },
  {
    title: 'Review',
    subtitle: 'Summary',
    description: 'Review the notifier details and submit.'
  }
]

const CustomToolTip = styled(({ className, ...props }) => <Tooltip {...props} arrow classes={{ popper: className }} />)(
  ({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: theme.palette.common.black
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.black
    }
  })
)

const TextfieldStyled = styled(TextField)(({ theme }) => ({
  '& label.Mui-focused': {
    color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
    }
  }
}))

const SelectStyled = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    fieldset: {
      borderColor: 'inherit' // default border color
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main // border color when focused
    }
  }
}))

const InputLabelStyled = styled(InputLabel)(({ theme }) => ({
  '&.Mui-focused': {
    color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
  }
}))

const OutlinedInputStyled = styled(OutlinedInput)(({ theme }) => ({
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'inherit' // Replace with your hover state border color
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main // Border color when focused
  }
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

const AddNotifierWizard = ({ onSuccess }) => {
  // ** States
  const [notifierForm, setNotifierForm] = useState(initialNotifierFormState)
  const [activeStep, setActiveStep] = useState(0)
  const [resetFormFields, setResetFormFields] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [, setRefetchTrigger] = useAtom(refetchNotifierTriggerAtom)

  const theme = useTheme()
  const session = useSession()

  useEffect(() => {
    // Reset the active step when notifier type changes
    setActiveStep(0)
  }, [notifierForm.type])

  const stepValidationSchemas = [
    yup.object(), // No validation for the type step
    yup.object({
      name: yup.string().required('Name is required'),
      email_addresses: yup.array().when('type', {
        is: 'email',
        then: yup.array().of(yup.string().email('Must be a valid email')).required('At least one email is required')
      }),
      webhook_url: yup.string().when('type', {
        is: 'webhook',
        then: yup.string().url('Must be a valid URL').required('Webhook URL is required')
      })
    }),
    yup.object(), // No validation for the schedule step
    yup.object() // No validation for the review step
  ]

  // Validate Form
  const validateForm = async () => {
    try {
      const validationSchema = stepValidationSchemas[activeStep]
      await validationSchema.validate(notifierForm, { abortEarly: false })
      setFormErrors({})

      return true
    } catch (yupError) {
      const transformedErrors = yupError.inner.reduce(
        (acc, currentError) => ({
          ...acc,
          [currentError.path]: currentError.message
        }),
        {}
      )
      setFormErrors(transformedErrors)

      return false
    }
  }

  const handleFormChange = (event, index, section) => {
    const target = event.target || event
    const name = target.name
    let value = target.value

    setNotifierForm(prevForm => {
      const newForm = { ...prevForm }

      if (index !== undefined && section) {
        newForm[section][index][name] = value
      } else {
        newForm[name] = value
      }

      return newForm
    })
  }

  const addSectionEntry = section => {
    const newEntry = section === 'email_addresses' ? '' : {}
    setNotifierForm(prevForm => {
      const updatedSection = [...prevForm[section], newEntry]

      return { ...prevForm, [section]: updatedSection }
    })
  }

  const removeSectionEntry = (section, index) => {
    const updatedSection = [...notifierForm[section]]
    updatedSection.splice(index, 1)
    setNotifierForm({ ...notifierForm, [section]: updatedSection })
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = async () => {
    const isValid = await validateForm()
    if (!isValid) {
      return
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1)

    if (activeStep === steps.length - 1) {
      try {
        const apiToken = session?.data?.user?.apiToken

        const headers = {
          Accept: 'application/json',
          Authorization: `Bearer ${apiToken}`
        }

        const payload = {
          ...notifierForm,
          email_addresses: notifierForm.email_addresses.filter(email => email.trim() !== '')
        }

        const endpoint = `/api/notifiers/add`
        const response = await axios.post(endpoint, payload, { headers })

        if (response.data) {
          const notifier = response.data
          if (notifier) {
            toast.success('Notifier successfully created')
          } else {
            toast.error('Failed to create notifier')
          }

          onSuccess && onSuccess()
          setTimeout(() => {
            setRefetchTrigger(Date.now())
          }, 2000)
        }
      } catch (error) {
        console.error('Error creating notifier', error)
        toast.error('Error creating notifier')
      }
    }
  }

  const handleReset = () => {
    setNotifierForm(initialNotifierFormState)
    setResetFormFields(false)
    setActiveStep(0)
  }

  const renderDynamicFormSection = section => {
    const sectionTitles = {
      email_addresses: 'Email Address',
      webhook_url: 'Webhook URL'
    }

    return notifierForm[section].map((entry, index) => (
      <Box key={`${index}-${resetFormFields}`} sx={{ marginBottom: 1 }}>
        <Grid container spacing={3} alignItems='center'>
          <Grid item xs={8}>
            <TextfieldStyled
              fullWidth
              label={sectionTitles[section]}
              name={section}
              value={entry}
              onChange={e => handleFormChange(e, index, section)}
              variant='outlined'
              margin='normal'
            />
          </Grid>
          <Grid item xs={2} style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <IconButton
              onClick={() => addSectionEntry(section)}
              style={{ color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : 'black' }}
            >
              <Icon icon='mdi:plus-circle-outline' />
            </IconButton>
            {notifierForm[section].length > 1 && (
              <IconButton onClick={() => removeSectionEntry(section, index)} color='secondary'>
                <Icon icon='mdi:minus-circle-outline' />
              </IconButton>
            )}
          </Grid>
        </Grid>
      </Box>
    ))
  }

  const renderContent = () => {
    const getStepContent = step => {
      switch (step) {
        case 0:
          return (
            <Fragment>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth margin='normal'>
                    <InputLabelStyled id='notifier-type-label'>Notifier Type</InputLabelStyled>
                    <SelectStyled
                      labelId='notifier-type-label'
                      value={notifierForm.type}
                      onChange={e => setNotifierForm({ ...notifierForm, type: e.target.value })}
                      label='Notifier Type'
                    >
                      <MenuItem value='email'>Email</MenuItem>
                      <MenuItem value='webhook'>Webhook</MenuItem>
                    </SelectStyled>
                  </FormControl>
                </Grid>
              </Grid>
            </Fragment>
          )
        case 1:
          return (
            <Fragment>
              <Typography variant='h6' gutterBottom>
                Notifier Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextfieldStyled
                    required
                    id='name'
                    name='name'
                    label='Name'
                    fullWidth
                    autoComplete='off'
                    value={notifierForm.name}
                    onChange={handleFormChange}
                    error={Boolean(formErrors?.name)}
                    helperText={formErrors?.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <AutocompleteStyled
                    freeSolo
                    clearOnBlur
                    selectOnFocus
                    handleHomeEndKeys
                    id='notifier-status-autocomplete'
                    options={['ENABLED', 'DISABLED']}
                    value={notifierForm.status.toUpperCase()}
                    onChange={(event, newValue) => {
                      handleFormChange({ target: { name: 'status', value: newValue } }, null, null)
                    }}
                    onInputChange={(event, newInputValue) => {
                      if (event) {
                        handleFormChange({ target: { name: 'status', value: newInputValue } }, null, null)
                      }
                    }}
                    renderInput={params => (
                      <TextfieldStyled {...params} label='Status' fullWidth required autoComplete='off' />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextfieldStyled
                    fullWidth
                    label='Description'
                    name='description'
                    autoComplete='off'
                    value={notifierForm.description !== undefined ? notifierForm.description : ''}
                    onChange={handleFormChange}
                    multiline
                    rows={2}
                  />
                </Grid>
                {notifierForm.type === 'email' && renderDynamicFormSection('email_addresses')}
                {notifierForm.type === 'webhook' && (
                  <Grid item xs={12}>
                    <TextfieldStyled
                      fullWidth
                      label='Webhook URL'
                      name='webhook_url'
                      autoComplete='off'
                      value={notifierForm.webhook_url !== undefined ? notifierForm.webhook_url : ''}
                      onChange={handleFormChange}
                      error={Boolean(formErrors?.webhook_url)}
                      helperText={formErrors?.webhook_url}
                    />
                  </Grid>
                )}
              </Grid>
            </Fragment>
          )
        case 2:
          return (
            <ScheduleSection
              taskForm={notifierForm}
              handleFormChange={handleFormChange}
              dateRange={[notifierForm.schedule.start_date, notifierForm.schedule.end_date]}
              setDateRange={newRange => {
                handleFormChange({ target: { name: 'schedule.start_date', value: newRange[0] } }, null, 'schedule')
                handleFormChange({ target: { name: 'schedule.end_date', value: newRange[1] } }, null, 'schedule')
              }}
            />
          )
        case 3:
          return <ReviewAndSubmitSection taskForm={notifierForm} />
        default:
          return 'Unknown Step'
      }
    }

    if (activeStep === steps.length) {
      return (
        <Fragment>
          <Typography>Notifier details have been submitted.</Typography>
          <ReviewAndSubmitSection taskForm={notifierForm} />
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button size='large' variant='contained' onClick={handleReset}>
              Reset
            </Button>
          </Box>
        </Fragment>
      )
    } else {
      return (
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
                Back
              </Button>
              <Button size='large' variant='contained' onClick={handleNext}>
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </Grid>
          </Grid>
        </form>
      )
    }
  }

  return (
    <Fragment>
      <StepperWrapper>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => {
            return (
              <Step key={index}>
                <StepLabel StepIconComponent={StepperCustomDot}>
                  <div className='step-label'>
                    <div>
                      <Typography className='step-title'>{step.title}</Typography>
                      <Typography
                        className='step-subtitle'
                        style={{
                          color:
                            theme.palette.mode === 'dark'
                              ? theme.palette.customColors.brandYellow
                              : theme.palette.secondary.light
                        }}
                      >
                        {step.subtitle}
                      </Typography>
                    </div>
                  </div>
                </StepLabel>
              </Step>
            )
          })}
        </Stepper>
      </StepperWrapper>
      <Card sx={{ mt: 4, minHeight: 500 }}>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </Fragment>
  )
}

const ScheduleSection = ({ taskForm, handleFormChange, dateRange, setDateRange }) => {
  const [showDocumentation, setShowDocumentation] = useState(false)
  const toggleDocumentation = () => setShowDocumentation(!showDocumentation)

  // Get list of timezones from moment-timezone
  const timezones = moment.tz.names()

  // Handler for timezone change in Autocomplete
  const handleTimezoneChange = (event, newValue) => {
    handleFormChange({ target: { name: 'schedule.timezone', value: newValue } }, null, 'schedule')
  }

  return (
    <Fragment>
      <Grid container direction='column' spacing={2}>
        {/* Clickable Text to Toggle Visibility */}
        <Grid
          item
          style={{
            cursor: 'pointer',
            paddingLeft: '27px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <IconButton onClick={toggleDocumentation}>
            {showDocumentation ? <Icon icon='mdi:expand-less' /> : <Icon icon='mdi:expand-more' />}
          </IconButton>
          <Typography variant='body1' onClick={toggleDocumentation}>
            {showDocumentation ? 'Hide Schedule Instructions' : 'Show Schedule Instructions'}
          </Typography>
        </Grid>
        {showDocumentation && (
          <Grid container spacing={2} style={{ padding: '16px' }}>
            <Grid item>
              <Typography variant='body2' gutterBottom>
                <strong>Schedule your task</strong> with precision using flexible cron-style expressions. This section
                allows you to define when and how often your task should run, similar to scheduling jobs in UNIX-like
                systems.
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='body2' gutterBottom>
                Define <strong>start and end dates</strong> to control the active period of your task schedule. Input
                dates in ISO 8601 format or select them using the provided date pickers.
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='body2' gutterBottom>
                Not all fields are mandatory. Specify only the ones you need. Unspecified fields default to their
                broadest setting, allowing the task to run more frequently. For instance, leaving the{' '}
                <strong>day</strong> field empty schedules the task to run every day of the month.
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='body2' gutterBottom>
                Use the <strong>Expression Types</strong> below to refine your schedule:
                <ul>
                  <li>
                    <strong>*</strong> - Run at every possible time/value.
                  </li>
                  <li>
                    <strong>*/a</strong> - Run at every <em>a</em> interval.
                  </li>
                  <li>
                    <strong>a-b</strong> - Run within a range from <em>a</em> to <em>b</em>.
                  </li>
                  <li>
                    <strong>a-b/c</strong> - Run within a range at every <em>c</em> interval.
                  </li>
                  <li>And more, including combinations of expressions separated by commas.</li>
                </ul>
              </Typography>
            </Grid>
            <Grid item marginBottom={4}>
              <Typography variant='body2' gutterBottom>
                Abbreviated English month names (<strong>jan</strong> – <strong>dec</strong>) and weekday names (
                <strong>mon</strong> – <strong>sun</strong>) are also supported.
              </Typography>
            </Grid>
          </Grid>
        )}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='year'
            name='year'
            label='Year'
            fullWidth
            value={taskForm.schedule.year}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='month'
            name='month'
            label='Month'
            fullWidth
            value={taskForm.schedule.month}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='day'
            name='day'
            label='Day'
            fullWidth
            value={taskForm.schedule.day}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='hour'
            name='hour'
            label='Hour'
            fullWidth
            value={taskForm.schedule.hour}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='minute'
            name='minute'
            label='Minute'
            fullWidth
            value={taskForm.schedule.minute}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='second'
            name='second'
            label='Second'
            fullWidth
            value={taskForm.schedule.second}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <DateRangePicker
            localeText={{ start: 'Start Date', end: 'End Date' }}
            value={dateRange}
            onChange={newValue => {
              setDateRange(newValue)
            }}
            renderInput={(startProps, endProps) => (
              <Fragment>
                <TextfieldStyled {...startProps} />
                <Box sx={{ mx: 2 }}> to </Box>
                <TextfieldStyled {...endProps} />
              </Fragment>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <AutocompleteStyled
            id='timezone'
            options={timezones}
            getOptionLabel={option => option}
            renderInput={params => <TextfieldStyled {...params} label='Timezone' />}
            value={taskForm.schedule.timezone}
            onChange={handleTimezoneChange}
            autoComplete
            includeInputInList
            freeSolo
            clearOnBlur
          />
        </Grid>
      </Grid>
    </Fragment>
  )
}

const ReviewAndSubmitSection = ({ taskForm }) => {
  const renderGeneralSection = taskForm => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
          General Information
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Notifier Name'
          value={taskForm.name !== undefined ? taskForm.name : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Notifier Type'
          value={taskForm.type !== undefined ? taskForm.type : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Status'
          value={taskForm.status !== undefined ? taskForm.status : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12}>
        <TextfieldStyled
          fullWidth
          label='Description'
          value={taskForm.description !== undefined ? taskForm.description : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
          multiline
          rows={2}
        />
      </Grid>
    </Grid>
  )

  const renderEmailSection = taskForm => {
    if (taskForm.email_addresses && taskForm.email_addresses.length > 0) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
              Email Addresses
            </Typography>
          </Grid>
          {taskForm.email_addresses.map((email, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <TextfieldStyled
                fullWidth
                label={`Email ${index + 1}`}
                value={email}
                InputProps={{ readOnly: true }}
                variant='outlined'
                margin='normal'
              />
            </Grid>
          ))}
        </Grid>
      )
    }

    return null
  }

  const renderWebhookSection = taskForm => {
    if (taskForm.webhook_url && taskForm.webhook_url.trim() !== '') {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
              Webhook URL
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextfieldStyled
              fullWidth
              label='Webhook URL'
              value={taskForm.webhook_url}
              InputProps={{ readOnly: true }}
              variant='outlined'
              margin='normal'
            />
          </Grid>
        </Grid>
      )
    }

    return null
  }

  const renderScheduleSection = schedule => (
    <Fragment>
      <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
        Schedule Information
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(schedule).map(([key, value], index) => {
          const label = key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          const formattedValue = typeof value === 'object' && value !== null ? value.toLocaleString() : value

          return (
            <Grid item xs={12} sm={6} key={`schedule-${index}`}>
              <TextfieldStyled
                fullWidth
                label={label}
                value={formattedValue !== undefined ? formattedValue : ''}
                InputProps={{ readOnly: true }}
                variant='outlined'
                margin='normal'
              />
            </Grid>
          )
        })}
      </Grid>
    </Fragment>
  )

  return (
    <Fragment>
      {renderGeneralSection(taskForm)}
      {taskForm.type === 'email' && renderEmailSection(taskForm)}
      {taskForm.type === 'webhook' && renderWebhookSection(taskForm)}
      {taskForm.schedule && renderScheduleSection(taskForm.schedule)}
    </Fragment>
  )
}

export default AddNotifierWizard
