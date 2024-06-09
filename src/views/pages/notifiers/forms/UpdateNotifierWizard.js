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
import Select from '@mui/material/Select'
import Checkbox from '@mui/material/Checkbox'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import FormLabel from '@mui/material/FormLabel'
import Autocomplete from '@mui/material/Autocomplete'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
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

// Define initial state for the server form
const initialNotifierFormState = {
  name: '',
  type: '',
  status: 'enabled',
  description: '',
  email_addresses: [''],
  webhook_url: '',
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
  }
}

const steps = [
  {
    title: 'General',
    subtitle: 'Information',
    description: 'Edit the Notifier details.'
  },
  {
    title: 'Schedule',
    subtitle: 'Details',
    description: 'Edit the Schedule details. Click on Show Schedule Instructions below for more information.'
  },
  {
    title: 'Review',
    subtitle: 'Summary',
    description: 'Review the Notifier details and submit.'
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

const CheckboxStyled = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.customColors.accent,
  '&.Mui-checked': {
    color: theme.palette.customColors.accent
  }
}))

const TextfieldStyled = styled(TextField)(({ theme }) => ({
  '& label.Mui-focused': {
    color: theme.palette.customColors.accent
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.customColors.accent
    }
  }
}))

const SelectStyled = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    fieldset: {
      borderColor: 'inherit' // default border color
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.customColors.accent // border color when focused
    }
  }
}))

const InputLabelStyled = styled(InputLabel)(({ theme }) => ({
  '&.Mui-focused': {
    color: theme.palette.customColors.accent
  }
}))

const RadioStyled = styled(Radio)(({ theme }) => ({
  '&.MuiRadio-root': {
    color: theme.palette.customColors.accent
  },
  '&.Mui-checked': {
    color: theme.palette.customColors.accent
  }
}))

const OutlinedInputStyled = styled(OutlinedInput)(({ theme }) => ({
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'inherit' // Replace with your hover state border color
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.customColors.accent // Border color when focused
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

const ScheduleSection = ({ notifierForm, handleFormChange, dateRange, setDateRange }) => {
  const [showDocumentation, setShowDocumentation] = useState(false)
  const toggleDocumentation = () => setShowDocumentation(!showDocumentation)

  const timezones = moment.tz.names()

  const handleTimezoneChange = (event, newValue) => {
    handleFormChange({ target: { name: 'schedule.timezone', value: newValue } }, null, 'schedule')
  }

  return (
    <Fragment>
      <Grid container direction='column' spacing={2}>
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
            value={notifierForm.schedule.year}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='month'
            name='month'
            label='Month'
            fullWidth
            value={notifierForm.schedule.month}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='day'
            name='day'
            label='Day'
            fullWidth
            value={notifierForm.schedule.day}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='hour'
            name='hour'
            label='Hour'
            fullWidth
            value={notifierForm.schedule.hour}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='minute'
            name='minute'
            label='Minute'
            fullWidth
            value={notifierForm.schedule.minute}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='second'
            name='second'
            label='Second'
            fullWidth
            value={notifierForm.schedule.second}
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
            value={notifierForm.schedule.timezone}
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

const ReviewAndSubmitSection = ({ notifierForm }) => {
  const renderGeneralSection = notifierForm => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
          Notifier Information
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Notifier Name'
          value={notifierForm.name !== undefined ? notifierForm.name : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Notifier Type'
          value={notifierForm.type !== undefined ? notifierForm.type : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Status'
          value={notifierForm.status !== undefined ? notifierForm.status : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12}>
        <TextfieldStyled
          fullWidth
          label='Description'
          value={notifierForm.description !== undefined ? notifierForm.description : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
          multiline
          rows={2}
        />
      </Grid>
      {notifierForm.type === 'email' &&
        notifierForm.email_addresses.map((email, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <TextfieldStyled
              fullWidth
              label={`Email Address ${index + 1}`}
              value={email !== undefined ? email : ''}
              InputProps={{ readOnly: true }}
              variant='outlined'
              margin='normal'
            />
          </Grid>
        ))}
      {notifierForm.type === 'webhook' && (
        <Grid item xs={12}>
          <TextfieldStyled
            fullWidth
            label='Webhook URL'
            value={notifierForm.webhook_url !== undefined ? notifierForm.webhook_url : ''}
            InputProps={{ readOnly: true }}
            variant='outlined'
            margin='normal'
          />
        </Grid>
      )}
    </Grid>
  )

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
      {renderGeneralSection(notifierForm)}
      {notifierForm.schedule && renderScheduleSection(notifierForm.schedule)}
    </Fragment>
  )
}

const UpdateNotifierWizard = ({ onClose, currentNotifier }) => {
  const [notifierForm, setNotifierForm] = useState(initialNotifierFormState)
  const [activeStep, setActiveStep] = useState(0)
  const [resetFormFields, setResetFormFields] = useState(false)
  const [, setRefetchTrigger] = useAtom(refetchNotifierTriggerAtom)

  const [dateRange, setDateRange] = useState([null, null])

  const theme = useTheme()
  const session = useSession()

  useEffect(() => {
    if (currentNotifier && Object.keys(currentNotifier).length > 0) {
      const updatedNotifierForm = {
        ...initialNotifierFormState,
        name: currentNotifier.name || '',
        type: currentNotifier.type || '',
        status: currentNotifier.status || 'enabled',
        description: currentNotifier.description || '',
        email_addresses: currentNotifier.email_addresses || [''],
        webhook_url: currentNotifier.webhook_url || '',
        schedule: currentNotifier.schedule || initialNotifierFormState.schedule
      }

      setNotifierForm(updatedNotifierForm)
      setDateRange([currentNotifier.schedule?.start_date || null, currentNotifier.schedule?.end_date || null])
    }
  }, [currentNotifier])

  const handleFormChange = (event, index, section) => {
    const target = event.target || event
    const name = target.name
    let value = target.value

    if (
      typeof value === 'string' &&
      !['schedule.start_date', 'schedule.end_date', 'schedule.timezone'].includes(name)
    ) {
      value = value.toLowerCase()
    }

    setNotifierForm(prevForm => {
      const newForm = { ...prevForm }

      if (section) {
        if (Array.isArray(newForm[section])) {
          const updatedSection = [...newForm[section]]
          updatedSection[index] = { ...updatedSection[index], [name]: value }
          newForm[section] = updatedSection
        } else if (typeof newForm[section] === 'object') {
          newForm[section] = { ...newForm[section], [name]: value }
        }
      } else {
        if (name.includes('.')) {
          const [sectionName, fieldName] = name.split('.')
          newForm[sectionName] = {
            ...newForm[sectionName],
            [fieldName]: value
          }
        } else {
          newForm[name] = value
        }
      }

      return newForm
    })
  }

  const addEmailAddress = () => {
    setNotifierForm(prevForm => {
      const updatedEmails = [...prevForm.email_addresses, '']

      return { ...prevForm, email_addresses: updatedEmails }
    })
  }

  const removeEmailAddress = index => {
    setNotifierForm(prevForm => {
      const updatedEmails = [...prevForm.email_addresses]
      updatedEmails.splice(index, 1)

      return { ...prevForm, email_addresses: updatedEmails }
    })
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = async () => {
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

        const endpoint = `/api/notifiers/update/${currentNotifier.id}`
        const response = await axios.post(endpoint, payload, { headers })

        if (response.data) {
          const notifier = response.data

          if (notifier) {
            console.log('Notifier successfully updated for ', notifier.name)
            toast.success('Notifier successfully updated')
          } else {
            console.error('Failed to update notifier')
            toast.error('Failed to update notifier')
          }

          onClose && onClose()
          setRefetchTrigger(new Date().getTime())
        }
      } catch (error) {
        console.error('Error updating notifier details', error)
        toast.error('Error updating notifier details')
      }
    }
  }

  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Fragment>
            <Typography variant='h6' gutterBottom>
              Notifier Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextfieldStyled
                  required
                  id='name'
                  name='name'
                  label='Notifier Name'
                  fullWidth
                  autoComplete='off'
                  value={notifierForm.name.toUpperCase()}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='notifier-type-autocomplete'
                  options={['email', 'webhook']}
                  value={notifierForm.type.toUpperCase()}
                  onChange={(event, newValue) => {
                    handleFormChange({ target: { name: 'type', value: newValue } }, null, null)
                  }}
                  onInputChange={(event, newInputValue) => {
                    if (event) {
                      handleFormChange({ target: { name: 'type', value: newInputValue } }, null, null)
                    }
                  }}
                  renderInput={params => (
                    <TextfieldStyled {...params} label='Notifier Type' fullWidth required autoComplete='off' />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='notifier-status-autocomplete'
                  options={['enabled', 'disabled']}
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
                    <TextfieldStyled {...params} label='Notifier Status' fullWidth required autoComplete='off' />
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
              {notifierForm.type === 'email' &&
                notifierForm.email_addresses.map((email, index) => (
                  <Grid container spacing={2} alignItems='center' key={index}>
                    <Grid item xs={10} sm={5}>
                      <TextfieldStyled
                        required
                        id={`email-${index}`}
                        name='email'
                        label={`Email Address ${index + 1}`}
                        fullWidth
                        autoComplete='off'
                        value={email.toLowerCase()}
                        onChange={e =>
                          handleFormChange(
                            { target: { name: 'email_addresses', value: e.target.value } },
                            index,
                            'email_addresses'
                          )
                        }
                      />
                    </Grid>
                    <Grid item xs={2} sm={1}>
                      <IconButton
                        onClick={() => addEmailAddress()}
                        style={{
                          color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : 'black'
                        }}
                      >
                        <Icon icon='mdi:plus-circle-outline' />
                      </IconButton>
                      {notifierForm.email_addresses.length > 1 && (
                        <IconButton onClick={() => removeEmailAddress(index)} color='secondary'>
                          <Icon icon='mdi:minus-circle-outline' />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                ))}
              {notifierForm.type === 'webhook' && (
                <Grid item xs={12}>
                  <TextfieldStyled
                    required
                    id='webhook_url'
                    name='webhook_url'
                    label='Webhook URL'
                    fullWidth
                    autoComplete='off'
                    value={notifierForm.webhook_url}
                    onChange={handleFormChange}
                  />
                </Grid>
              )}
            </Grid>
          </Fragment>
        )
      case 1:
        return (
          <ScheduleSection
            notifierForm={notifierForm}
            handleFormChange={handleFormChange}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        )
      case 2:
        return <ReviewAndSubmitSection notifierForm={notifierForm} />
      default:
        return 'Unknown Step'
    }
  }

  const renderContent = () => {
    if (activeStep === steps.length) {
      return (
        <Fragment>
          <Typography>Notifier details have been submitted.</Typography>
          <ReviewAndSubmitSection notifierForm={notifierForm} />
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

export default UpdateNotifierWizard
