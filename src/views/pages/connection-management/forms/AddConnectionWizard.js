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
import Stack from '@mui/material/Stack'
import moment from 'moment-timezone'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import StepperCustomDot from 'src/views/pages/misc/forms/StepperCustomDot'
import { useTheme, styled } from '@mui/material/styles'
import { refetchConnectionsTriggerAtom } from 'src/lib/atoms'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Styled Component
import StepperWrapper from 'src/@core/styles/mui/stepper'

// ** Import yup for form validation
import * as yup from 'yup'

// Define initial state for the connection form
const initialConnectionFormState = {
  name: '',
  type: 'http', // default to 'http' connection type
  description: '',
  host: '',
  login: '',
  schema: '',
  port: '',
  password: '',
  extra: []
}

// Define available connection types
const connectionTypes = [
  'MYSQL',
  'POSTGRESQL',
  'MONGODB',
  'ORACLE',
  'REDIS',
  'KAFKA',
  'RABBITMQ',
  'ELASTICSEARCH',
  'SFTP',
  'SMTP',
  'POP3',
  'IMAP',
  'SSH',
  'HTTP',
  'HTTPS'
]

const steps = [
  {
    title: 'Connection Type',
    subtitle: 'Type',
    description: 'Select the connection type.'
  },
  {
    title: 'Connection Details',
    subtitle: 'Details',
    description: 'Edit the connection details.'
  },
  {
    title: 'Connection Extras',
    subtitle: 'Information',
    description: 'Edit the Connection Extras details.'
  },
  {
    title: 'Review',
    subtitle: 'Summary',
    description: 'Review the connection details and submit.'
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

const AddConnectionWizard = ({ onSuccess }) => {
  // ** States
  const [connectionForm, setConnectionForm] = useState(initialConnectionFormState)
  const [activeStep, setActiveStep] = useState(0)
  const [resetFormFields, setResetFormFields] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [, setRefetchTrigger] = useAtom(refetchConnectionsTriggerAtom)

  const theme = useTheme()
  const session = useSession()

  useEffect(() => {
    // Reset the active step when connection type changes
    setActiveStep(0)
  }, [connectionForm.type])

  const NO_AUTH_REQUIRED = ['redis', 'kafka', 'rabbitmq', 'sftp', 'http', 'https', 'smtp', 'pop3', 'imap']

  const stepValidationSchemas = [
    // Step 0: Connection Type
    yup.object().shape({
      type: yup.string().required('Connection type is required')
    }),

    // Step 1: Connection Details
    yup.object().shape({
      name: yup.string().required('Name is required'),
      host: yup.string().required('Host is required'),
      port: yup.number().typeError('Port must be a number').required('Port is required'),
      schema: yup.string(),
      login: yup.string().when('type', {
        is: type => !NO_AUTH_REQUIRED.includes(type),
        then: () => yup.string().required('Login is required'),
        otherwise: () => yup.string()
      }),
      password: yup.string().when('type', {
        is: type => !NO_AUTH_REQUIRED.includes(type),
        then: () => yup.string().required('Password is required'),
        otherwise: () => yup.string()
      }),
      description: yup.string()
    }),

    // Step 2: Connection Extras
    yup.object().shape({
      extra: yup.array().of(
        yup.object().shape({
          key: yup.string(),
          value: yup.string()
        })
      )
    }),

    // Step 3: Review (no validation needed)
    yup.object()
  ]

  // Validate Form
  const validateForm = async () => {
    try {
      const validationSchema = stepValidationSchemas[activeStep]

      console.log('Validating form:', connectionForm) // Log form data before validation
      await validationSchema.validate(connectionForm, { abortEarly: false })
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

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleMouseDownPassword = event => {
    event.preventDefault()
  }

  const handleFormChange = (event, index, section) => {
    const target = event.target || event
    const name = target.name
    let value = target.value

    // Convert name field to uppercase, other string values to lowercase except specific fields
    if (typeof value === 'string') {
      if (name === 'name') {
        value = value.toUpperCase()
      } else if (!['description', 'password'].includes(name)) {
        value = value.toLowerCase()
      }
    }

    setConnectionForm(prevForm => {
      const newForm = { ...prevForm }

      if (section) {
        // Check if the section is an array or an object
        if (Array.isArray(newForm[section])) {
          // For array sections, clone the array and update the specific index
          const updatedSection = [...newForm[section]]
          updatedSection[index] = { ...updatedSection[index], [name]: value }
          newForm[section] = updatedSection
        } else if (typeof newForm[section] === 'object') {
          // For object sections like 'schedule', update directly
          newForm[section] = { ...newForm[section], [name]: value }
        }
      } else {
        // Directly update top-level fields or handle nested updates
        if (name.includes('.')) {
          // Nested object updates, e.g., "schedule.year"
          const [sectionName, fieldName] = name.split('.')
          newForm[sectionName] = {
            ...newForm[sectionName],
            [fieldName]: value
          }
        } else {
          // Top-level field updates
          newForm[name] = value
        }
      }

      return newForm
    })
  }

  const addSectionEntry = section => {
    let newEntry
    switch (section) {
      case 'extra':
        newEntry = { key: '', value: '' }
        break
      default:
        newEntry = {} // Default case, should not be reached
    }

    const updatedSection = [...connectionForm[section], newEntry]
    setConnectionForm({ ...connectionForm, [section]: updatedSection })
  }

  const removeSectionEntry = (section, index) => {
    const updatedSection = [...connectionForm[section]]
    updatedSection.splice(index, 1)
    setConnectionForm({ ...connectionForm, [section]: updatedSection })
  }

  const handleBack = () => {
    if (activeStep === 2) {
      // When navigating back from Metadata Info
      setResetFormFields(prev => !prev) // Toggle reset state
    }
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = async () => {
    const isValid = await validateForm()
    if (!isValid) {
      console.log('Form is not valid')
      console.log('Form:', connectionForm)

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

        // Filter out empty key-value pairs and convert to object
        const filteredExtra = connectionForm.extra.filter(({ key, value }) => key.trim() !== '' && value.trim() !== '')
        const extraObject = Object.fromEntries(filteredExtra.map(({ key, value }) => [key, value]))
        const extraString = JSON.stringify(extraObject)

        const payload = {
          ...connectionForm,
          extra: extraString
        }

        const endpoint = `/api/connections`
        const response = await axios.post(endpoint, payload, { headers })

        if (response.data) {
          const connection = response.data

          if (connection) {
            toast.success('Connection successfully created')
          } else {
            toast.error('Failed to create connection')
          }

          // Call onSuccess to close the form
          if (onSuccess) {
            onSuccess()
          }

          setTimeout(() => {
            setRefetchTrigger(new Date().getTime())
          }, 2000)
        }
      } catch (error) {
        console.error('Error creating connection', error)
        toast.error('Error creating connection')
      }
    }
  }

  const handleReset = () => {
    setConnectionForm(initialConnectionFormState)
    setResetFormFields(false)
    setActiveStep(0)
  }

  const renderDynamicFormSection = section => {
    // Determine field labels based on section type
    const getFieldLabels = section => {
      switch (section) {
        case 'extra':
          return { keyLabel: 'Key', valueLabel: 'Value' }
        default:
          return { keyLabel: 'Key', valueLabel: 'Value' }
      }
    }

    const { keyLabel, valueLabel } = getFieldLabels(section)

    return (
      <Fragment>
        {connectionForm[section].map((entry, index) => (
          <Grid item xs={12} key={`${index}-${resetFormFields}`}>
            <Box sx={{ marginBottom: 1 }}>
              <Grid container spacing={3} alignItems='center'>
                <Grid item xs={4}>
                  <TextfieldStyled
                    key={`key-${section}-${index}`}
                    fullWidth
                    label={keyLabel}
                    name='key'
                    value={entry.key?.toUpperCase() || ''}
                    onChange={e => handleFormChange(e, index, section)}
                    variant='outlined'
                    margin='normal'
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextfieldStyled
                    key={`value-${section}-${index}`}
                    fullWidth
                    label={valueLabel}
                    name='value'
                    value={entry.value?.toUpperCase() || ''}
                    onChange={e => handleFormChange(e, index, section)}
                    variant='outlined'
                    margin='normal'
                  />
                </Grid>
                <Grid item xs={2} style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <IconButton onClick={() => removeSectionEntry(section, index)} color='secondary'>
                    <Icon icon='mdi:minus-circle-outline' />
                  </IconButton>
                  <IconButton
                    onClick={() => addSectionEntry(section)}
                    style={{ color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : 'black' }}
                  >
                    <Icon icon='mdi:plus-circle-outline' />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        ))}
      </Fragment>
    )
  }

  const renderContent = () => {
    const getStepContent = step => {
      switch (step) {
        case 0:
          return (
            <Fragment>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin='normal'>
                    <AutocompleteStyled
                      freeSolo
                      clearOnBlur
                      selectOnFocus
                      handleHomeEndKeys
                      id='connection-type-autocomplete'
                      options={connectionTypes}
                      value={connectionForm.type?.toUpperCase() || ''}
                      onChange={(event, value) =>
                        setConnectionForm({
                          ...connectionForm,
                          type: value?.toLowerCase()
                        })
                      }
                      onInputChange={(event, value, reason) => {
                        if (reason === 'clear') {
                          setConnectionForm({ ...connectionForm, type: '' })
                        } else {
                          setConnectionForm({
                            ...connectionForm,
                            type: value?.toLowerCase()
                          })
                        }
                      }}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label='Connection Type'
                          fullWidth
                          required
                          autoComplete='off'
                          error={Boolean(formErrors.type)}
                          helperText={formErrors.type}
                          InputProps={{
                            ...params.InputProps,
                            style: { textTransform: 'uppercase' }
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} style={{ textTransform: 'uppercase' }}>
                          {option}
                        </li>
                      )}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Fragment>
          )
        case 1:
          return (
            <Fragment>
              <Typography variant='h6' gutterBottom>
                Connection Details
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
                    value={connectionForm.name}
                    onChange={handleFormChange}
                    error={Boolean(formErrors?.name)}
                    helperText={formErrors?.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextfieldStyled
                    required
                    id='host'
                    name='host'
                    label='Host'
                    fullWidth
                    autoComplete='off'
                    value={connectionForm.host}
                    onChange={handleFormChange}
                    error={Boolean(formErrors?.host)}
                    helperText={formErrors?.host}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextfieldStyled
                    required
                    id='port'
                    name='port'
                    label='Port'
                    fullWidth
                    autoComplete='off'
                    value={connectionForm.port}
                    onChange={handleFormChange}
                    error={Boolean(formErrors?.port)}
                    helperText={formErrors?.port}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextfieldStyled
                    id='schema'
                    name='schema'
                    label='Schema'
                    fullWidth
                    autoComplete='off'
                    value={connectionForm.schema}
                    onChange={handleFormChange}
                    error={Boolean(formErrors?.schema)}
                    helperText={formErrors?.schema}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextfieldStyled
                    id='login'
                    name='login'
                    label='Login'
                    fullWidth
                    autoComplete='off'
                    value={connectionForm.login}
                    onChange={handleFormChange}
                    error={Boolean(formErrors?.login)}
                    helperText={formErrors?.login}
                    required={!NO_AUTH_REQUIRED.includes(connectionForm.type)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant='outlined'>
                    <InputLabelStyled
                      htmlFor='outlined-adornment-password'
                      required={!NO_AUTH_REQUIRED.includes(connectionForm.type)}
                    >
                      Password
                    </InputLabelStyled>
                    <OutlinedInputStyled
                      id='outlined-adornment-password'
                      type={showPassword ? 'text' : 'password'}
                      value={connectionForm.password}
                      onChange={e => handleFormChange({ target: { name: 'password', value: e.target.value } })}
                      endAdornment={
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='toggle password visibility'
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge='end'
                          >
                            <Icon icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                          </IconButton>
                        </InputAdornment>
                      }
                      label='Password'
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextfieldStyled
                    fullWidth
                    label='Description'
                    name='description'
                    autoComplete='off'
                    value={connectionForm.description !== undefined ? connectionForm.description : ''}
                    onChange={handleFormChange}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Fragment>
          )
        case 2:
          return (
            <Fragment>
              <Stack direction='column' spacing={1}>
                {connectionForm.extra.length > 0 ? (
                  renderDynamicFormSection('extra')
                ) : (
                  <Box>
                    <Button
                      startIcon={
                        <Icon
                          icon='mdi:plus-circle-outline'
                          style={{
                            color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : 'black'
                          }}
                        />
                      }
                      onClick={() => addSectionEntry('extra')}
                      style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
                    >
                      Add Extra
                    </Button>
                  </Box>
                )}
              </Stack>
            </Fragment>
          )
        case 3:
          return <ReviewAndSubmitSection connectionForm={connectionForm} />
        default:
          return 'Unknown Step'
      }
    }

    if (activeStep === steps.length) {
      return (
        <Fragment>
          <Typography>Connection details have been submitted.</Typography>
          <ReviewAndSubmitSection connectionForm={connectionForm} />
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

const Section = ({ title, data }) => {
  return (
    <Fragment>
      <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {data.map((item, index) => (
          <Fragment key={`${title}-${index}`}>
            <Grid item xs={12} sm={6}>
              <TextfieldStyled
                fullWidth
                label='Key'
                value={item.key || ''}
                InputProps={{ readOnly: true }}
                variant='outlined'
                margin='normal'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextfieldStyled
                fullWidth
                label='Value'
                value={item.value || ''}
                InputProps={{ readOnly: true }}
                variant='outlined'
                margin='normal'
              />
            </Grid>
          </Fragment>
        ))}
      </Grid>
    </Fragment>
  )
}

const ReviewAndSubmitSection = ({ connectionForm }) => {
  const renderGeneralSection = connectionForm => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
          General Information
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Connection Name'
          value={connectionForm.name || ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Connection Type'
          value={connectionForm.type || ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Host'
          value={connectionForm.host || ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Port'
          value={connectionForm.port || ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Schema'
          value={connectionForm.schema || ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Login'
          value={connectionForm.login || ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Password'
          value={connectionForm.password ? '********' : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12}>
        <TextfieldStyled
          fullWidth
          label='Description'
          value={connectionForm.description || ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
          multiline
          rows={2}
        />
      </Grid>
    </Grid>
  )

  return (
    <Fragment>
      {renderGeneralSection(connectionForm)}
      {connectionForm.extra && connectionForm.extra.length > 0 && <Section title='Extra' data={connectionForm.extra} />}
    </Fragment>
  )
}

export default AddConnectionWizard
