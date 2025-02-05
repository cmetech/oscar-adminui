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
import { refetchProbeTriggerAtom } from 'src/lib/atoms'
import { detectTokensInPayload } from 'src/lib/utils'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Styled Component
import StepperWrapper from 'src/@core/styles/mui/stepper'

// ** Import yup for form validation
import * as yup from 'yup'

// Add these constants at the top of the file, after the imports
const VALIDATION_TYPES = ['HTTP_STATUS', 'REGEX', 'RULE']
const HTTP_SUCCESS_CODES = ['200', '201', '202', '204']

// Define initial state for the probe form
const initialProbeFormState = {
  name: '',
  type: '',
  status: 'enabled',
  description: '',
  target: '',
  host: '',
  port: '',
  url: '',
  ssl_verification: 'NO',
  schedule: {
    year: '',
    month: '',
    day: '',
    day_of_week: '',
    hour: '',
    minute: '*/5',
    second: '',
    start_date: '',
    end_date: '',
    timezone: '',
    jitter: 0
  },
  args: [{ value: '' }],
  kwargs: [],
  payload: '',
  payload_type: 'rest',
  http_method: 'GET',
  http_headers: [],
  validation_rules: [{ type: 'HTTP_STATUS', value: '200' }]
}

const allSteps = [
  {
    title: 'Probe Type',
    subtitle: 'Type',
    description: 'Select the probe type.'
  },
  {
    title: 'Probe Details',
    subtitle: 'Details',
    description: 'Edit the probe details.'
  },
  {
    title: 'Probe Headers',
    subtitle: 'API Headers',
    description: 'Edit the API Headers.'
  },
  {
    title: 'Probe Payload',
    subtitle: 'API Probe Payload',
    description: 'Edit the API Probe Payload details.'
  },
  {
    title: 'Probe Tokens',
    subtitle: 'Token details',
    description: 'Provide details for the probe payload template.'
  },
  {
    title: 'Validation Rules',
    subtitle: 'Response Validation',
    description: 'Define rules to validate the API response.'
  },
  {
    title: 'Review',
    subtitle: 'Summary',
    description: 'Review the Server details and submit.'
  }
]

const wellKnownFakerFunctions = [
  'name',
  'first_name',
  'last_name',
  'msisdn'
  // Add more well-known faker functions here
]

const wellKnownHttpHeaders = [
  'Content-Type',
  'Accept',
  'Authorization',
  'User-Agent',
  'Referer'
  // Add more well-known HTTP headers here
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
    color: theme.palette.mode == 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.mode == 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
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

// Replace 'defaultBorderColor' with your default border color.

const InputLabelStyled = styled(InputLabel)(({ theme }) => ({
  '&.Mui-focused': {
    color: theme.palette.mode == 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
  }
}))

const OutlinedInputStyled = styled(OutlinedInput)(({ theme }) => ({
  // Style the border color
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'inherit' // Replace with your hover state border color
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main // Border color when focused
  }
  // You can add more styles here for other parts of the input
}))

const AutocompleteStyled = styled(Autocomplete)(({ theme }) => ({
  '& .MuiInputLabel-outlined.Mui-focused': {
    color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
    }
  }
}))

const Section = ({ title, data }) => {
  return (
    <Fragment>
      <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
        {title.charAt(0).toUpperCase() + title.slice(1)}
      </Typography>
      {data.map((item, index) => (
        <Grid container spacing={2} key={`${title}-${index}`}>
          {Object.entries(item).map(([itemKey, itemValue]) => (
            <Grid item xs={12} sm={6} key={`${itemKey}-${index}`}>
              <TextfieldStyled
                fullWidth
                label={itemKey.charAt(0).toUpperCase() + itemKey.slice(1)}
                value={itemValue.toString()}
                InputProps={{ readOnly: true }}
                variant='outlined'
                margin='normal'
              />
            </Grid>
          ))}
        </Grid>
      ))}
    </Fragment>
  )
}

const ReviewAndSubmitSection = ({ probeForm }) => {
  const renderGeneralSection = probeForm => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
          Probe Information
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Probe Name'
          value={probeForm.name !== undefined ? probeForm.name : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Probe Type'
          value={probeForm.type !== undefined ? probeForm.type : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Status'
          value={probeForm.status !== undefined ? probeForm.status : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label={
            probeForm.type === 'PORT'
              ? 'HOST'
              : probeForm.type === 'API'
              ? 'ENDPOINT'
              : probeForm.type === 'PING'
              ? 'HOST'
              : 'URL'
          }
          value={probeForm.target !== undefined ? probeForm.target : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      {probeForm.type.toLowerCase() === 'port' && (
        <Grid item xs={12} sm={6}>
          <TextfieldStyled
            fullWidth
            label='Port'
            value={probeForm.port}
            InputProps={{ readOnly: true }}
            variant='outlined'
            margin='normal'
            type='number'
          />
        </Grid>
      )}
      {probeForm.type.toLowerCase() === 'api' && (
        <Fragment>
          <Grid item xs={12} sm={6}>
            <TextfieldStyled
              fullWidth
              label='Payload Type'
              value={probeForm.payload_type}
              InputProps={{ readOnly: true }}
              variant='outlined'
              margin='normal'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextfieldStyled
              fullWidth
              label='HTTP Method'
              value={probeForm.http_method}
              InputProps={{ readOnly: true }}
              variant='outlined'
              margin='normal'
            />
          </Grid>
        </Fragment>
      )}
      <Grid item xs={12}>
        <TextfieldStyled
          fullWidth
          label='Description'
          value={probeForm.description !== undefined ? probeForm.description : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
          multiline
          rows={2}
        />
      </Grid>
    </Grid>
  )

  const renderArgumentsSection = probeForm => {
    if (probeForm.kwargs && probeForm.kwargs.length > 0) {
      // Check if there's only one argument and if its key and value are not empty strings
      if (probeForm.kwargs.length === 1) {
        const arg = probeForm.kwargs[0]
        if (arg.key.trim() === '' && arg.value.trim() === '') {
          return null
        }
      }

      return (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
              Arguments
            </Typography>
          </Grid>
          {probeForm.kwargs.map((arg, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <TextfieldStyled
                fullWidth
                label={`Argument ${index + 1}`}
                value={arg.key !== undefined ? `${arg.key}: ${arg.value}` : ''}
                InputProps={{ readOnly: true }}
                variant='outlined'
                margin='normal'
              />
            </Grid>
          ))}
        </Grid>
      )
    }

    return null // Return null if there are no arguments
  }

  const renderHeadersSection = probeForm => {
    if (probeForm.http_headers && probeForm.http_headers.length > 0) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
              HTTP Headers
            </Typography>
          </Grid>
          {probeForm.http_headers.map((header, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <TextfieldStyled
                fullWidth
                label={`Header ${index + 1}`}
                value={header.key !== undefined ? `${header.key}: ${header.value}` : ''}
                InputProps={{ readOnly: true }}
                variant='outlined'
                margin='normal'
              />
            </Grid>
          ))}
        </Grid>
      )
    }

    return null // Return null if there are no headers
  }

  const renderPayloadSection = probeForm => {
    if (probeForm.payload && probeForm.payload.trim() !== '') {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
              Payload
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextfieldStyled
              fullWidth
              label='Payload'
              value={probeForm.payload !== undefined ? probeForm.payload : ''}
              InputProps={{ readOnly: true }}
              variant='outlined'
              margin='normal'
              multiline
              rows={20}
            />
          </Grid>
        </Grid>
      )
    }

    return null // Return null if there is no payload
  }

  const renderValidationRulesSection = probeForm => {
    if (probeForm.validation_rules && probeForm.validation_rules.length > 0) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
              Validation Rules
            </Typography>
          </Grid>
          {probeForm.validation_rules.map((rule, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <TextfieldStyled
                fullWidth
                label={`Rule ${index + 1}`}
                value={`${rule.type}: ${rule.value}`}
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

  return (
    <Fragment>
      {renderGeneralSection(probeForm)}
      {probeForm.type === 'API' && renderHeadersSection(probeForm)}
      {probeForm.type === 'API' && renderPayloadSection(probeForm)}
      {probeForm.type === 'API' && renderValidationRulesSection(probeForm)}
      {probeForm.type === 'API' && renderArgumentsSection(probeForm)}
    </Fragment>
  )
}

// Define validation schema
const allStepValidationSchemas = [
  yup.object(), // No validation in select type step
  yup.object({
    type: yup.string().required('Type is required'),
    port: yup.string().when('type', (typeValue, schema) => {
      if (typeValue[0] === 'PORT') {
        //console.log("checking for port since typevalue = port")
        return schema
          .required('Port is required')
          .matches(/^\d+$/, 'Only numbers are allowed')
          .test('is-valid-port', 'Port must be a valid number between 1 and 65535', value => {
            const num = parseInt(value, 10)

            return !isNaN(num) && num >= 1 && num <= 65535
          })
      } else {
        //console.log("Ignoring port check typevalue = port as its url")
        return schema.notRequired()
      }
    }),
    target: yup.string().when('type', (typeValue, schema) => {
      if (typeValue[0] === 'PORT' || typeValue[0] === 'PING') {
        return schema
          .required('Target is required')
          .matches(/^(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/, 'Must be a valid IP address')
      } else {
        //console.log("Ignoring target check typevalue = port as its url");
        return schema.notRequired()
      }
    })
  }),
  yup.object(), //No validation for the headers step
  yup.object(), //No validation for the payload step
  yup.object(), //No validation for the tokens step
  yup.object() //No validation for the review step
]

const UpdateProbeWizard = ({ onClose, ...props }) => {
  const { currentProbe, rows, setRows } = props

  // ** States
  const [probeForm, setProbeForm] = useState(initialProbeFormState)
  const [activeStep, setActiveStep] = useState(0)

  const [probeType, setProbeType] = useState(() => {
    const probeType = currentProbe.type.trim().toLowerCase()
    if (probeType === 'api') {
      return 'API'
    } else if (probeType === 'httpurl') {
      return 'URL'
    } else if (probeType === 'tcpport') {
      return 'PORT'
    } else if (probeType === 'ping') {
      return 'PING'
    } else {
      return 'UNKNOWN' // or handle any other default case
    }
  })

  const [resetFormFields, setResetFormFields] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [, setRefetchTrigger] = useAtom(refetchProbeTriggerAtom)

  const theme = useTheme()
  const session = useSession()

  const steps =
    probeType === 'API'
      ? allSteps
      : allSteps.filter(
          step =>
            step.title !== 'Probe Headers' &&
            step.title !== 'Probe Tokens' &&
            step.title !== 'Probe Payload' &&
            step.title !== 'Validation Rules'
        )

  const stepValidationSchemas =
    probeType === 'API'
      ? allStepValidationSchemas
      : allStepValidationSchemas.filter((schema, index) => index !== 2 && index !== 3 && index !== 4)

  // Validate Form
  const validateForm = async () => {
    try {
      // Validate based on the current step
      const formData = {
        type: probeType,
        port: probeForm.port,
        target: probeForm.target,
        payload: probeForm.payload,
        payload_type: probeForm.payload_type
      }

      const validationSchema = stepValidationSchemas[activeStep]

      await validationSchema.validate(formData, { abortEarly: false })

      // If validation is successful, clear errors
      setFormErrors({})

      return true
    } catch (yupError) {
      if (yupError.inner) {
        // Transform the validation errors to a more manageable structure
        const transformedErrors = yupError.inner.reduce(
          (acc, currentError) => ({
            ...acc,
            [currentError.path]: currentError.message
          }),
          {}
        )
        setFormErrors(transformedErrors)
      } else {
        // Handle cases where inner does not exist or is empty
        setFormErrors({ general: yupError.message || 'An unknown error occurred' })
      }

      return false
    }
  }

  useEffect(() => {
    if (currentProbe && Object.keys(currentProbe).length > 0) {
      const updatedProbeForm = {
        ...initialProbeFormState,
        name: currentProbe.name || '',
        type:
          currentProbe.type.trim().toLowerCase() === 'httpurl'
            ? 'URL'
            : currentProbe.type.trim().toLowerCase() === 'api'
            ? 'API'
            : currentProbe.type.trim().toLowerCase() === 'tcpport'
            ? 'PORT'
            : currentProbe.type.trim().toLowerCase() === 'ping'
            ? 'PING'
            : 'UNKNOWN',
        description: currentProbe.description || '',
        target: currentProbe.target,
        status: currentProbe.status,
        id: currentProbe.id
      }
      if (updatedProbeForm.type && updatedProbeForm.type === 'PORT') {
        const portinfo = updatedProbeForm.target.split(':')

        if (portinfo.length > 1) {
          updatedProbeForm.port = portinfo[1]
          updatedProbeForm.target = portinfo[0]
        } else {
          updatedProbeForm.port = 0
          updatedProbeForm.target = portinfo[0]
        }
      }

      // If the probe type is API, update the relevant fields
      if (updatedProbeForm.type === 'API') {
        updatedProbeForm.schedule = currentProbe.schedule || initialProbeFormState.schedule
        updatedProbeForm.kwargs = currentProbe.kwargs || initialProbeFormState.kwargs
        updatedProbeForm.payload = currentProbe.payload || initialProbeFormState.payload

        // Extract validation rules from kwargs if they exist
        if (currentProbe.kwargs && currentProbe.kwargs.__validation_rules__) {
          try {
            updatedProbeForm.validation_rules = JSON.parse(currentProbe.kwargs.__validation_rules__)
          } catch (e) {
            console.error('Error parsing validation rules:', e)
            updatedProbeForm.validation_rules = initialProbeFormState.validation_rules
          }
        }
      }

      // Update the probeForm state to reflect the selected probeType
      setProbeForm(updatedProbeForm)
      setProbeType(updatedProbeForm.type)
    }
  }, [currentProbe])

  const handleFormChange = (event, index, section) => {
    // Handling both synthetic events and direct value assignments from Autocomplete
    const target = event.target || event
    const name = target.name
    let value = target.value

    // Convert string values to lowercase, except for specific fields
    if (typeof value === 'string' && name !== 'payload' && name !== 'description') {
      value = value?.toLowerCase()
    }

    setProbeForm(prevForm => {
      const newForm = { ...prevForm }

      if (section === 'kwargs' && name) {
        newForm[section] = { ...newForm[section], [name]: value }
      } else if (index !== undefined && section) {
        newForm[section][index][name] = value
      } else {
        newForm[name] = value
      }

      return newForm
    })
  }

  const addSectionEntry = section => {
    let newEntry
    switch (section) {
      case 'http_headers':
      case 'kwargs':
      case 'metadata':
        newEntry = { key: '', value: '' }
        break
      case 'args':
        newEntry = { value: '' }
      default:
        newEntry = {} // Default case, should not be reached
    }

    setProbeForm(prevForm => {
      // Only add new entry if section is empty
      const updatedSection = [...prevForm[section], newEntry]

      return { ...prevForm, [section]: updatedSection }
    })
  }

  const removeSectionEntry = (section, index) => {
    const updatedSection = [...probeForm[section]]
    updatedSection.splice(index, 1)
    setProbeForm({ ...probeForm, [section]: updatedSection })
  }

  // Handle Stepper
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = async () => {
    const isValid = await validateForm()
    if (!isValid) {
      return // Stop the submission or the next step if the validation fails
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1)

    if (activeStep === steps.length - 1) {
      try {
        const apiToken = session?.data?.user?.apiToken // Assuming this is how you get the apiToken

        const headers = {
          Accept: 'application/json',
          Authorization: `Bearer ${apiToken}` // Include the bearer token in the Authorization header
        }

        const payload = {
          ...probeForm,
          args: probeForm.args.map(arg => arg.value),
          kwargs: Object.fromEntries(probeForm.kwargs.map(({ key, value }) => [key, value]))
        }

        // Conditionally add the payload field to kwargs if type is API
        if (probeForm.type === 'API') {
          payload.kwargs['payload'] = probeForm.payload
          payload['owner'] = 'internal'
          payload['organization'] = 'internal'
          delete payload.payload

          payload.kwargs['payload_type'] = probeForm.payload_type
          delete payload.payload_type

          payload.kwargs['http_method'] = probeForm.http_method
          delete payload.http_method

          // Add SSL Verification to Kwargs
          payload.kwargs['__ssl_verification__'] = probeForm.ssl_verification === 'yes' ? 'true' : 'false'

          // Remove the ssl_verification field from the payload
          delete payload.ssl_verification

          // Add Validation Rules to Kwargs
          payload.kwargs['__validation_rules__'] = JSON.stringify(probeForm.validation_rules)
        }

        // Add Headers to Kwargs
        if (probeForm.http_headers && probeForm.http_headers.length > 0) {
          const headersDict = Object.fromEntries(probeForm.http_headers.map(({ key, value }) => [key, value]))
          payload.kwargs['__http_headers__'] = JSON.stringify(headersDict)

          // Delete the http_headers field
          delete payload.http_headers
        }

        // Remove the payload and payload_type field if it's not an API type
        if (probeForm.type !== 'API') {
          delete payload.payload
          delete payload.payload_type
          delete payload.http_method
          delete payload.http_headers
          delete payload.ssl_verification
        }

        console.log('Payload:', payload)

        // Update the endpoint to point to your Next.js API route
        const endpoint = `/api/probes/update/${currentProbe.id}`
        const response = await axios.post(endpoint, payload, { headers })

        if (response.data) {
          const probe = response.data

          if (probe) {
            console.log('Probe successfully updated for ', probe.name)

            // Show a success toast
            toast.success('Probe successfully updated')
          } else {
            console.error('Failed to update probe')
            toast.error('Failed to update probe')
          }

          // Call onClose to close the modal
          onClose && onClose()

          setTimeout(() => {
            setRefetchTrigger(Date.now())
          }, 2000) // Adjust the delay as needed
        }
      } catch (error) {
        console.error('Error updating probe details', error)
        toast.error('Error updating probe details')
      }
    }
  }

  const renderDynamicFormSection = section => {
    // Determine field labels based on section type
    const getFieldLabels = section => {
      switch (section) {
        case 'http_headers':
        case 'kwargs':
        case 'metadata':
          return { keyLabel: 'Key', valueLabel: 'Value' }
        case 'args':
          return { valueLabel: 'Value' }
        default:
          return { keyLabel: 'Key', valueLabel: 'Value' }
      }
    }

    const { keyLabel, valueLabel } = getFieldLabels(section)

    const entries =
      section === 'kwargs'
        ? Object.entries(probeForm[section]).filter(
            ([key]) => !['__endpoint__', '__http_headers__', '__ssl_verification__'].includes(key.toLowerCase())
          )
        : probeForm[section]

    return entries.map((entry, index) => {
      const key = section === 'kwargs' ? entry[0] : entry.key
      const value = section === 'kwargs' ? entry[1] : entry.value

      return (
        <Box key={`${index}-${resetFormFields}`} sx={{ marginBottom: 1 }}>
          <Grid container spacing={3} alignItems='center'>
            {['http_headers'].includes(section) ? (
              <Grid item xs={5}>
                <AutocompleteStyled
                  freeSolo
                  options={wellKnownHttpHeaders}
                  value={key || ''}
                  onInputChange={(event, newValue) => {
                    handleFormChange(
                      { target: { name: section === 'kwargs' ? key : 'key', value: newValue } },
                      index,
                      section
                    )
                  }}
                  onChange={(event, newValue) => {
                    handleFormChange(
                      { target: { name: section === 'kwargs' ? key : 'key', value: newValue } },
                      index,
                      section
                    )
                  }}
                  renderInput={params => (
                    <TextfieldStyled {...params} fullWidth label={keyLabel} variant='outlined' margin='normal' />
                  )}
                />
              </Grid>
            ) : (
              <Grid item xs={5}>
                <TextfieldStyled
                  key={`key-${section}-${index}`}
                  fullWidth
                  label={keyLabel}
                  name={section === 'kwargs' ? key : 'key'}
                  value={key?.toUpperCase() || ''}
                  onChange={e => handleFormChange(e, index, section)}
                  variant='outlined'
                  margin='normal'
                />
              </Grid>
            )}
            {section === 'http_headers' ? (
              <Grid item xs={5}>
                <TextfieldStyled
                  key={`value-${section}-${index}`}
                  fullWidth
                  label={valueLabel}
                  name='value'
                  value={value || ''}
                  onChange={e => handleFormChange(e, index, section)}
                  variant='outlined'
                  margin='normal'
                />
              </Grid>
            ) : (
              <Grid item xs={5}>
                <AutocompleteStyled
                  freeSolo
                  options={wellKnownFakerFunctions}
                  value={value?.startsWith('faker.') ? value.slice(6) : value || ''}
                  onInputChange={(event, newValue) => {
                    const valueToStore = wellKnownFakerFunctions.includes(newValue) ? `faker.${newValue}` : newValue
                    handleFormChange({ target: { name: 'value', value: valueToStore } }, index, section)
                  }}
                  onChange={(event, newValue) => {
                    const valueToStore = wellKnownFakerFunctions.includes(newValue) ? `faker.${newValue}` : newValue
                    handleFormChange({ target: { name: 'value', value: valueToStore } }, index, section)
                  }}
                  renderInput={params => (
                    <TextfieldStyled {...params} fullWidth label={valueLabel} variant='outlined' margin='normal' />
                  )}
                />
              </Grid>
            )}
            <Grid item xs={2} style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
              <IconButton
                onClick={() => addSectionEntry(section)}
                style={{ color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : 'black' }}
              >
                <Icon icon='mdi:plus-circle-outline' />
              </IconButton>
              {entries.length > 1 && (
                <IconButton onClick={() => removeSectionEntry(section, index)} color='secondary'>
                  <Icon icon='mdi:minus-circle-outline' />
                </IconButton>
              )}
            </Grid>
          </Grid>
        </Box>
      )
    })
  }

  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Fragment>
            <Grid container direction='column' spacing={2}>
              <Grid container spacing={2} style={{ padding: '16px' }}>
                <Grid item>
                  <Typography variant='body2' gutterBottom>
                    <strong>Probes</strong>, are designed to monitor services from an external perspective. There are
                    four types of probes in OSCAR: HTTP URL, Port Check, PING, and API probe.
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant='body2' gutterBottom>
                    {probeType === 'URL' ? (
                      <Fragment>
                        <strong>URL</strong> - HTTP URL probes are designed to monitor the availability and response
                        time of HTTP or HTTPS URLs. They can verify SSL/TLS certificate validity, uptime of websites,
                        and more.
                        <ul>
                          <li>Monitoring the uptime of websites and web applications.</li>
                          <li>Verifying SSL/TLS certificate validity and expiration.</li>
                          <li>
                            Tracking the response time of API endpoints or other web services to ensure they meet
                            performance benchmarks.
                          </li>
                          <li>
                            <strong>Example:</strong> http://example.com, https://example.com
                          </li>
                        </ul>
                      </Fragment>
                    ) : probeType === 'PORT' ? (
                      <Fragment>
                        <strong>PORT</strong> - Port Check probes verify if a specific TCP port on a host is open and
                        listening, which is crucial for service accessibility such as databases and file servers.
                        <ul>
                          <li>Ensuring that core services like SSH, HTTP, HTTPS, FTP, and databases are accessible.</li>
                          <li>Network security audits to verify that only the expected ports are open.</li>
                          <li>Infrastructure monitoring in both development and production environments.</li>
                          <li>
                            <strong>Example:</strong> 10.10.10.10:9100
                          </li>
                        </ul>
                      </Fragment>
                    ) : probeType === 'PING' ? (
                      <Fragment>
                        <strong>PING</strong> - PING probes use ICMP echo requests to check the availability and network
                        latency of a host. They are useful for monitoring network connectivity and diagnosing network
                        issues.
                        <ul>
                          <li>Monitoring the availability of servers and network devices.</li>
                          <li>Measuring network latency to detect potential issues.</li>
                          <li>Ensuring that critical infrastructure components are reachable.</li>
                          <li>
                            <strong>Example:</strong> 192.168.1.1
                          </li>
                        </ul>
                      </Fragment>
                    ) : probeType === 'API' ? (
                      <Fragment>
                        <strong>API</strong> - API probes periodically monitor the availability of API endpoints. They
                        can track the performance, availability, and correctness of API responses.
                        <ul>
                          <li>Ensuring that APIs are available and responding correctly.</li>
                          <li>Monitoring API response times to ensure they meet performance benchmarks.</li>
                          <li>Checking the correctness of API responses by verifying the returned data.</li>
                          <li>Tracking the uptime of third-party API services that your application depends on.</li>
                          <li>
                            <strong>Example:</strong> https://api.example.com/v1/status
                          </li>
                        </ul>
                      </Fragment>
                    ) : null}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextfieldStyled
                    required
                    id='type'
                    name='type'
                    label='Type'
                    fullWidth
                    autoComplete='off'
                    value={probeType?.toUpperCase() || ''}
                    InputProps={{
                      readOnly: true // This makes the field read-only
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Fragment>
        )
      case 1:
        return (
          <Fragment>
            <Typography variant='h6' gutterBottom>
              Probe Information
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
                  value={probeForm.name.toUpperCase()}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextfieldStyled
                  required
                  id='type'
                  name='type'
                  label='Type'
                  fullWidth
                  autoComplete='off'
                  value={probeType?.toUpperCase() || ''}
                  InputProps={{
                    readOnly: true // This makes the field read-only
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextfieldStyled
                  required
                  id='target'
                  name='target'
                  label={
                    probeType === 'PORT'
                      ? 'HOST'
                      : probeType === 'API'
                      ? 'ENDPOINT'
                      : probeType === 'PING'
                      ? 'HOST'
                      : 'URL'
                  }
                  fullWidth
                  autoComplete='off'
                  value={probeForm.target}
                  onChange={handleFormChange}
                />
              </Grid>
              {probeType === 'PORT' && (
                <Grid item xs={12} sm={6}>
                  <TextfieldStyled
                    id='port'
                    name='port'
                    label='Port'
                    fullWidth
                    type='number'
                    value={probeForm.port}
                    onChange={handleFormChange}
                    error={Boolean(formErrors?.port)}
                    helperText={formErrors?.port}
                  />
                </Grid>
              )}
              {probeType === 'API' && (
                <Grid item xs={6} sm={6}>
                  <AutocompleteStyled
                    freeSolo
                    clearOnBlur
                    selectOnFocus
                    handleHomeEndKeys
                    id='probeapitype-autocomplete'
                    options={['REST', 'SOAP', 'GRAPHQL']}
                    value={probeForm.payload_type.toUpperCase()}
                    onChange={(event, newValue) => {
                      handleFormChange({ target: { name: 'payload_type', value: newValue } }, null, null)
                    }}
                    onInputChange={(event, newInputValue) => {
                      if (event) {
                        handleFormChange({ target: { name: 'payload_type', value: newInputValue } }, null, null)
                      }
                    }}
                    renderInput={params => (
                      <TextfieldStyled {...params} label='Message Type' fullWidth required autoComplete='off' />
                    )}
                  />
                </Grid>
              )}
              {probeType === 'API' && (
                <Grid item xs={12} sm={6}>
                  <AutocompleteStyled
                    freeSolo
                    clearOnBlur
                    selectOnFocus
                    handleHomeEndKeys
                    id='probehttpmethod-autocomplete'
                    options={['GET', 'POST']}
                    value={probeForm.http_method?.toUpperCase()}
                    onChange={(event, newValue) => {
                      handleFormChange({ target: { name: 'http_method', value: newValue } }, null, null)
                    }}
                    onInputChange={(event, newInputValue) => {
                      if (event) {
                        handleFormChange({ target: { name: 'http_method', value: newInputValue } }, null, null)
                      }
                    }}
                    renderInput={params => (
                      <TextfieldStyled {...params} label='HTTP Method' fullWidth required autoComplete='off' />
                    )}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='probestatus-autocomplete'
                  options={['ENABLED', 'DISABLED']}
                  value={probeForm.status.toUpperCase()}
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
              {probeType === 'API' && (
                <Grid item xs={12} sm={6}>
                  <AutocompleteStyled
                    freeSolo
                    clearOnBlur
                    selectOnFocus
                    handleHomeEndKeys
                    id='probesslverification-autocomplete'
                    options={['YES', 'NO']}
                    value={probeForm.ssl_verification}
                    onChange={(event, newValue) => {
                      handleFormChange({ target: { name: 'ssl_verification', value: newValue } }, null, null)
                    }}
                    onInputChange={(event, newInputValue) => {
                      if (event) {
                        handleFormChange({ target: { name: 'ssl_verification', value: newInputValue } }, null, null)
                      }
                    }}
                    renderInput={params => (
                      <TextfieldStyled {...params} label='SSL Verification' fullWidth required autoComplete='off' />
                    )}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={12}>
                <TextfieldStyled
                  fullWidth
                  label='Description'
                  name='description'
                  autoComplete='off'
                  value={probeForm.description !== undefined ? probeForm.description : ''}
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
            {probeType === 'API' ? (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                  <Typography variant='subtitle1' gutterBottom>
                    Probe Headers
                  </Typography>
                  {renderDynamicFormSection('http_headers')}
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
                      onClick={() => addSectionEntry('http_headers')}
                      style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
                    >
                      Add Probe Headers
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <ReviewAndSubmitSection probeForm={probeForm} />
            )}
          </Fragment>
        )
      case 3:
        return (
          <Fragment>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={12}>
                <TextfieldStyled
                  fullWidth
                  label='Payload'
                  name='payload'
                  autoComplete='off'
                  value={probeForm.payload !== undefined ? probeForm.payload : ''}
                  onChange={handleFormChange}
                  multiline
                  rows={20}
                  error={Boolean(formErrors?.payload)}
                  helperText={formErrors?.payload}
                />
              </Grid>
            </Grid>
          </Fragment>
        )
      case 4:
        return (
          <Fragment>
            <Grid container spacing={3} alignItems='flex-start'>
              <Grid item xs={12} sm={8}>
                <Typography variant='subtitle1' gutterBottom>
                  Probe Tokens
                </Typography>
                {renderDynamicFormSection('kwargs')}
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
                    onClick={() => addSectionEntry('kwargs')}
                    style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
                  >
                    Add Probe Tokens
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Fragment>
        )
      case 5:
        return (
          <Fragment>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom>
                  Response Validation Rules
                </Typography>
                {probeForm.validation_rules.map((rule, index) => (
                  <Box key={`validation-rule-${index}`} sx={{ marginBottom: 2 }}>
                    <Grid container spacing={3} alignItems='center'>
                      <Grid item xs={4}>
                        <FormControl fullWidth margin='normal'>
                          <InputLabelStyled id='validation-type-label'>Validation Type</InputLabelStyled>
                          <SelectStyled
                            labelId='validation-type-label'
                            label='Validation Type'
                            value={rule.type}
                            onChange={e => {
                              const newRules = [...probeForm.validation_rules]
                              newRules[index].type = e.target.value
                              // Reset value when type changes
                              newRules[index].value = e.target.value === 'HTTP_STATUS' ? '200' : ''
                              setProbeForm({ ...probeForm, validation_rules: newRules })
                            }}
                          >
                            {VALIDATION_TYPES.map(type => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </SelectStyled>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        {rule.type === 'HTTP_STATUS' ? (
                          <FormControl fullWidth margin='normal'>
                            <InputLabelStyled>Status Code</InputLabelStyled>
                            <SelectStyled
                              value={rule.value}
                              onChange={e => {
                                const newRules = [...probeForm.validation_rules]
                                newRules[index].value = e.target.value
                                setProbeForm({ ...probeForm, validation_rules: newRules })
                              }}
                            >
                              {HTTP_SUCCESS_CODES.map(code => (
                                <MenuItem key={code} value={code}>
                                  {code}
                                </MenuItem>
                              ))}
                            </SelectStyled>
                          </FormControl>
                        ) : (
                          <TextfieldStyled
                            fullWidth
                            label={rule.type === 'RULE' ? 'Rule Expression' : 'Regular Expression'}
                            value={rule.value}
                            onChange={e => {
                              const newRules = [...probeForm.validation_rules]
                              newRules[index].value = e.target.value
                              setProbeForm({ ...probeForm, validation_rules: newRules })
                            }}
                            margin='normal'
                          />
                        )}
                      </Grid>
                      <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          onClick={() => {
                            const newRules = [...probeForm.validation_rules, { type: 'HTTP_STATUS', value: '200' }]
                            setProbeForm({ ...probeForm, validation_rules: newRules })
                          }}
                          style={{
                            color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : 'black'
                          }}
                        >
                          <Icon icon='mdi:plus-circle-outline' />
                        </IconButton>
                        {probeForm.validation_rules.length > 1 && (
                          <IconButton
                            onClick={() => {
                              const newRules = probeForm.validation_rules.filter((_, i) => i !== index)
                              setProbeForm({ ...probeForm, validation_rules: newRules })
                            }}
                            color='secondary'
                          >
                            <Icon icon='mdi:minus-circle-outline' />
                          </IconButton>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </Fragment>
        )
      case 6:
        return <ReviewAndSubmitSection probeForm={probeForm} />
      default:
        return 'Unknown Step'
    }
  }

  const renderContent = () => {
    if (activeStep === steps.length) {
      return (
        <Fragment>
          <Typography>Probe details have been submitted.</Typography>
          <ReviewAndSubmitSection probeForm={probeForm} />
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

export default UpdateProbeWizard
