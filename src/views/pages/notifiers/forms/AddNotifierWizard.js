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
    // yup.object({
    //   name: yup.string().required('Name is required'),
    //   email_addresses: yup.array().when('type', {
    //     is: 'email',
    //     then: yup
    //       .array()
    //       .of(yup.string().email('Must be a valid email').required('At least one email is required'))
    //       .required('At least one email is required'),
    //     otherwise: yup.array().notRequired()
    //   }),
    //   webhook_url: yup.string().when('type', {
    //     is: 'webhook',
    //     then: yup.string().url('Must be a valid URL').required('Webhook URL is required'),
    //     otherwise: yup.string().notRequired()
    //   })
    // }),
    yup.object(),
    yup.object() // No validation for the review step
  ]

  // Validate Form
  const validateForm = async () => {
    try {
      const validationSchema = stepValidationSchemas[activeStep]

      console.log('Validating form:', notifierForm) // Log form data before validation
      await validationSchema.validate(notifierForm, { abortEarly: false })
      setFormErrors({})

      return true
    } catch (yupError) {
      console.log('Yup Validation Error:', yupError)

      const transformedErrors = yupError.inner
        ? yupError.inner.reduce(
            (acc, currentError) => ({
              ...acc,
              [currentError.path]: currentError.message
            }),
            {}
          )
        : {}

      // Log the validation errors for debugging
      console.log('Validation Errors:', transformedErrors)

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
        if (section === 'email_addresses') {
          newForm[section][index] = value
        } else {
          newForm[section][index][name] = value
        }
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
      console.log('Form is not valid')
      console.log('Form:', notifierForm)

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
      <Grid item xs={12} key={`${index}-${resetFormFields}`}>
        <Box key={`${index}-${resetFormFields}`} sx={{ marginBottom: 1 }}>
          <Grid container spacing={3} alignItems='center'>
            <Grid item xs={8}>
              <TextfieldStyled
                key={`key-${section}-${index}`}
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
      </Grid>
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

  return (
    <Fragment>
      {renderGeneralSection(taskForm)}
      {taskForm.type === 'email' && renderEmailSection(taskForm)}
      {taskForm.type === 'webhook' && renderWebhookSection(taskForm)}
    </Fragment>
  )
}

export default AddNotifierWizard
