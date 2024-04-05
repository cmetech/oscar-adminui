// ** React Imports
import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useAtom } from 'jotai'

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
import FormHelperText from '@mui/material/FormHelperText'
import FormGroup from '@mui/material/FormGroup'
import FormLabel from '@mui/material/FormLabel'
import Autocomplete from '@mui/material/Autocomplete'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import StepperCustomDot from 'src/views/pages/misc/forms/StepperCustomDot'
import { useTheme, styled } from '@mui/material/styles'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Styled Component
import StepperWrapper from 'src/@core/styles/mui/stepper'

// ** Import yup for form validation
import * as yup from 'yup'

import { serversAtom, refetchServerTriggerAtom } from 'src/lib/atoms'

// Define initial state for the server form
const initialServerFormState = {
  hostName: '',
  componentName: '',
  datacenterName: '',
  environmentName: '',
  status: 'ACTIVE',
  metadata: [{ key: '', value: '' }],
  networkInterfaces: [{ name: '', ip_address: '', label: '' }]
}

const steps = [
  {
    title: 'Server Information',
    subtitle: 'Add Server Information',
    description: 'Add the Hostname, Datacenter, and Environment details.'
  },
  {
    title: 'Network Information',
    subtitle: 'Add Network Information',
    description: 'Add the Network details.'
  },
  {
    title: 'Metadata Information',
    subtitle: 'Add Metadata Information',
    description: 'Add the Metadata details.'
  },
  {
    title: 'Review',
    subtitle: 'Review and Submit',
    description: 'Review the Server details and submit.'
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
  color: theme.palette.mode == 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main,
  '&.Mui-checked': {
    color: theme.palette.mode == 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
  }
}))

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
  '&.MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.mode == 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main // border color when focused
    }
  }
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

// Replace 'defaultBorderColor' with your default border color.

const InputLabelStyled = styled(InputLabel)(({ theme }) => ({
  '&.Mui-focused': {
    color: theme.palette.mode == 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
  }
}))

const RadioStyled = styled(Radio)(({ theme }) => ({
  '&.MuiRadio-root': {
    color: theme.palette.mode == 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
  },
  '&.Mui-checked': {
    color: theme.palette.mode == 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
  }
}))

const OutlinedInputStyled = styled(OutlinedInput)(({ theme }) => ({
  // Style the border color
  // '& .MuiOutlinedInput-notchedOutline': {
  //   borderColor: 'inherit' // Replace with your default border color
  // },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'inherit' // Replace with your hover state border color
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main // Border color when focused
  }

  // You can add more styles here for other parts of the input
}))

// Define validation schema for the form
const validationSchema = yup.object({
  hostName: yup.string().required('Host Name is required'),
  componentName: yup.string().required('Component Name is required'),
  datacenterName: yup.string().required('Datacenter Name is required'),
  environmentName: yup.string().required('Environment Name is required'),
  status: yup.string().required('Status is required'),
  metadata: yup
    .array()
    .of(
      yup.object().shape({
        key: yup.string(),
        value: yup.string()
      })
    )
    .test(
      'metadata-key-value-pair',
      'Both key and value are required in metadata if either is provided',
      (metadata = []) => metadata.every(md => (!md.key && !md.value) || (md.key && md.value))
    ),
  networkInterfaces: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Name is required'),
      ip_address: yup
        .string()
        .required('IP Address is required')
        .matches(
          /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
          'Invalid IP address format'
        ),
      label: yup.string().required('Label is required')
    })
  )
})

const Section = ({ title, data, formErrors }) => {
  return (
    <Fragment>
      <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
        {title.charAt(0).toUpperCase() + title.slice(1)}
      </Typography>
      {data.map((item, index) => (
        <Grid container spacing={2} key={`${title}-${index}`}>
          {Object.entries(item).map(([itemKey, itemValue]) => {
            // Construct the fieldPath for accessing the error, matching how it's stored in formErrors
            console.log('Title:', title + ' Index:', index + ' ItemKey:', itemKey + ' ItemValue:', itemValue)
            const errorKey = `${title}[${index}].${itemKey}`
            const errorMessage = formErrors?.[errorKey] ?? '' // Access the specific error message

            return (
              <Grid item xs={12} sm={6} key={`${itemKey}-${index}`}>
                <TextfieldStyled
                  fullWidth
                  label={itemKey.charAt(0).toUpperCase() + itemKey.slice(1)}
                  value={itemValue.toString()}
                  InputProps={{ readOnly: true }}
                  variant='outlined'
                  margin='normal'
                  error={Boolean(errorMessage)}
                  helperText={errorMessage}
                />
              </Grid>
            )
          })}
        </Grid>
      ))}
    </Fragment>
  )
}

const ReviewAndSubmitSection = ({ serverForm, formErrors }) => {
  return (
    <Fragment>
      {Object.entries(serverForm).map(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // For nested objects (excluding arrays), recursively render sections
          return <ReviewAndSubmitSection serverForm={value} formErrors={formErrors} key={key} />
        } else if (Array.isArray(value)) {
          const sectionErrors = formErrors?.[key] || {}

          return <Section title={key} data={value} formErrors={sectionErrors} key={key} />
        } else {
          // For simple key-value pairs
          // Directly access the error message using the key for non-array, non-object fields
          const errorMessage = formErrors?.[key] ?? ''

          return (
            <Grid container spacing={2} key={key}>
              <Grid item xs={12} sm={6}>
                <TextfieldStyled
                  fullWidth
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={value.toString()}
                  InputProps={{ readOnly: true }}
                  variant='outlined'
                  margin='normal'
                  error={Boolean(errorMessage)}
                  helperText={errorMessage}
                />
              </Grid>
            </Grid>
          )
        }
      })}
    </Fragment>
  )
}

// Replace 'defaultBorderColor' and 'hoverBorderColor' with actual color values

const AddServerWizard = ({ onSuccess, ...props }) => {
  // ** States
  const [serverForm, setServerForm] = useState(initialServerFormState)
  const [activeStep, setActiveStep] = useState(0)
  const [resetFormFields, setResetFormFields] = useState(false)
  const [components, setComponents] = useState([])
  const [datacenters, setDatacenters] = useState([])
  const [environments, setEnvironments] = useState([])
  const [isEnvironmentEnabled, setIsEnvironmentEnabled] = useState(false)
  const [filteredEnvironments, setFilteredEnvironments] = useState([])
  const [formErrors, setFormErrors] = useState({})
  const [, setServers] = useAtom(serversAtom)
  const [, setRefetchTrigger] = useAtom(refetchServerTriggerAtom)

  const theme = useTheme()
  const session = useSession()

  useEffect(() => {
    console.log('Current FormErrors:', formErrors)
  }, [formErrors])

  useEffect(() => {
    const fetchDatacenters = async () => {
      try {
        // Directly use the result of the await expression
        const response = await axios.get('/api/inventory/datacenters')
        const data = response.data.rows

        // Iterate over the data array and extract the name value from each object
        const datacenterNames = data.map(datacenter => datacenter.name.toUpperCase())
        setDatacenters(datacenterNames)
      } catch (error) {
        console.error('Failed to fetch datacenters:', error)
      }
    }

    const fetchEnviroments = async () => {
      try {
        // Directly use the result of the await expression
        const response = await axios.get('/api/inventory/environments')
        const data = response.data.rows

        // Iterate over the data array and extract the name value from each object
        const environmentNames = data.map(environment => environment.name.toUpperCase())
        setEnvironments(environmentNames)
      } catch (error) {
        console.error('Failed to fetch environments:', error)
      }
    }

    const fetchComponents = async () => {
      try {
        // Directly use the result of the await expression
        const response = await axios.get('/api/inventory/components')
        const data = response.data.rows

        // Iterate over the data array and extract the name value from each object
        const componentNames = data.map(component => component.name.toUpperCase())
        setComponents(componentNames)
      } catch (error) {
        console.error('Failed to fetch components:', error)
      }
    }

    fetchDatacenters()

    // fetchEnviroments()
    fetchComponents()
  }, []) // Empty dependency array means this effect runs once on mount

  const validateField = async (fieldName, value, index, section) => {
    // Construct the correct path for nested fields
    const fieldPath = section ? `${section}[${index}].${fieldName}` : fieldName

    console.log(`Validating Field: ${fieldPath} with Value: ${value}`)

    try {
      // Adjust the context object based on whether we're validating a section or a top-level field
      const contextObject = section ? { [section]: serverForm[section] } : serverForm

      await validationSchema.validateAt(fieldPath, contextObject)

      console.log(`Validation Success for: ${fieldPath}`)

      // If validation is successful, clear any existing error for the field
      // This might need to be adjusted to handle errors for specific array indices
      setFormErrors(prevErrors => {
        return {
          ...prevErrors,
          [fieldPath]: ''
        }
      })
    } catch (error) {
      console.log(`Validation Error for: ${fieldPath}, Message: ${error.message}`)

      // If validation fails, set the error message for the field
      // Adjust this to handle array fields correctly
      setFormErrors(prevErrors => {
        if (error && error?.message) {
          console.log(`Setting error for key: ${fieldPath}`, error.message)
        }

        return {
          ...prevErrors,
          [fieldPath]: error.message
        }
      })
    }
  }

  const validateForm = async () => {
    try {
      // Assuming serverForm is the state holding your form data
      // and validationSchema is your Yup schema
      await validationSchema.validate(serverForm, { abortEarly: false })

      // If validation is successful, clear errors
      setFormErrors({})

      return true
    } catch (yupError) {
      if (yupError instanceof yup.ValidationError) {
        // Log the entire error
        console.log('Validation Error:', yupError)

        // Log detailed info about each validation error
        yupError.inner.forEach(error => {
          console.log(`Field: ${error.path}, Error: ${error.message}`)
        })

        // Transform the validation errors to a more manageable structure
        // and set them to state or handle them as needed
        const transformedErrors = yupError.inner.reduce(
          (acc, currentError) => ({
            ...acc,
            [currentError.path]: currentError.message
          }),
          {}
        )

        setFormErrors(transformedErrors)
      } else {
        // Handle other types of errors (e.g., network errors)
        console.error('An unexpected error occurred:', yupError)
      }

      return false
    }
  }

  // Function to handle form field changes
  const handleFormChange = async (event, index, section) => {
    const { name, value } = event.target

    // Upper case the value being entered
    const upperCasedValue = value?.toUpperCase()

    if (section) {
      // Handle changes for dynamic sections (metadata or networkInterfaces)
      const updatedSection = [...serverForm[section]]
      updatedSection[index][name] = upperCasedValue
      setServerForm({ ...serverForm, [section]: updatedSection })
    } else {
      console.log(`Updating ${name} to ${value}`)

      // Handle changes for static fields
      setServerForm({ ...serverForm, [name]: upperCasedValue })

      // Validate the field after the value has been updated
      validateField(name, upperCasedValue)
    }

    if (name === 'datacenterName') {
      setIsEnvironmentEnabled(false) // Disable environment field initially
      setFilteredEnvironments([]) // Reset filtered environments

      try {
        const response = await axios.get(`/api/inventory/environments?datacenter_name=${upperCasedValue}`)
        const data = response.data.rows
        const environmentNames = data.map(env => env.name.toUpperCase())
        setFilteredEnvironments(environmentNames)
        setIsEnvironmentEnabled(true) // Enable environment field after fetching
      } catch (error) {
        console.error('Failed to fetch environments for the selected datacenter:', error)
        toast.error('Failed to fetch environments')
      }
    }
  }

  // Function to add a new entry to a dynamic section
  const addSectionEntry = section => {
    const newEntry = section === 'metadata' ? { key: '', value: '' } : { name: '', ip_address: '', label: '' }
    const updatedSection = [...serverForm[section], newEntry]
    setServerForm({ ...serverForm, [section]: updatedSection })
  }

  // Function to remove an entry from a dynamic section
  const removeSectionEntry = (section, index) => {
    const updatedSection = [...serverForm[section]]
    updatedSection.splice(index, 1)
    setServerForm({ ...serverForm, [section]: updatedSection })
  }

  // Handle Stepper
  const handleBack = () => {
    if (activeStep === 2 || activeStep === 3) {
      // When navigating back from Metadata Info
      setResetFormFields(prev => !prev) // Toggle reset state
    }
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = async () => {
    if (activeStep === 1 || activeStep === 2) {
      // Assuming step 1 is Network Info and step 2 is Metadata Info
      setResetFormFields(prev => !prev) // Toggle reset state to force UI update
    }
    setActiveStep(prevActiveStep => prevActiveStep + 1)
    if (activeStep === steps.length - 1) {
      // Validate the form before proceeding to the next step or submitting
      const isValid = await validateForm()
      if (!isValid) {
        console.log('Form validation failed')

        return // Stop the submission or the next step if the validation fails
      }

      try {
        const apiToken = session?.data?.user?.apiToken // Assuming this is how you get the apiToken

        const headers = {
          Accept: 'application/json',
          Authorization: `Bearer ${apiToken}` // Include the bearer token in the Authorization header
        }

        const payload = {
          hostname: serverForm.hostName,
          datacenter_name: serverForm.datacenterName,
          environment_name: serverForm.environmentName,
          component_name: serverForm.componentName,
          metadata: serverForm.metadata,
          network_interfaces: serverForm.networkInterfaces,
          ip_address: serverForm.networkInterfaces[0].ip_address,
          status: serverForm.status
        }

        console.log('Submitting server details', payload)

        // Update the endpoint to point to your Next.js API route
        const endpoint = '/api/inventory/servers'
        const response = await axios.post(endpoint, payload, { headers })

        if (response.status === 201 && response.data) {
          toast.success('Server details added successfully')
          setRefetchTrigger(Date.now())

          // Call the onSuccess callback after successful submission
          onSuccess()
        }
      } catch (error) {
        console.error('Error adding server details', error)
        toast.error('Error adding server details')
      }
    }
  }

  const handleReset = () => {
    setServerForm(initialServerFormState)
    setResetFormFields(false)
    setActiveStep(0)
  }

  // Render form fields for metadata and network interfaces
  const renderDynamicFormSection = section => {
    return serverForm[section].map((entry, index) => {
      const errorKeyBase = section === 'metadata' ? 'value' : 'ip_address'
      const errorKey = `${section}[${index}].${errorKeyBase}`

      return (
        <Box key={`${index}-${resetFormFields}`} sx={{ marginBottom: 1 }}>
          <Grid container spacing={3} alignItems='center'>
            <Grid item xs={section === 'metadata' ? 5 : 4}>
              <TextfieldStyled
                key={`field1-${section}-${index}-${resetFormFields}`}
                fullWidth
                label={section === 'metadata' ? 'Key' : 'Name'}
                name={section === 'metadata' ? 'key' : 'name'}
                value={entry.key || entry.name}
                onChange={e => handleFormChange(e, index, section)}
                onBlur={e => validateField(e.target.name, e.target.value, index, section)}
                variant='outlined'
                margin='normal'
                error={!!formErrors[errorKey]}
                helperText={formErrors[errorKey] || ''}
              />
            </Grid>
            <Grid item xs={section === 'metadata' ? 5 : 3}>
              <TextfieldStyled
                key={`field2-${section}-${index}-${resetFormFields}`}
                fullWidth
                label={section === 'metadata' ? 'Value' : 'IP Address'}
                name={section === 'metadata' ? 'value' : 'ip_address'}
                value={entry.value || entry.ip_address}
                onChange={e => handleFormChange(e, index, section)}
                onBlur={e => validateField(e.target.name, e.target.value, index, section)}
                variant='outlined'
                margin='normal'
                error={!!formErrors[`${section}[${index}].${section === 'metadata' ? 'value' : 'ip_address'}`]}
                helperText={formErrors[`${section}[${index}].${section === 'metadata' ? 'value' : 'ip_address'}`] || ''}
              />
            </Grid>
            {/* Conditional TextField for Label only in networkInterfaces */}
            {section === 'networkInterfaces' && (
              <Grid item xs={3}>
                <TextfieldStyled
                  key={`label-${section}-${index}-${resetFormFields}`}
                  fullWidth
                  label='Label'
                  name='label'
                  value={entry.label}
                  onChange={e => handleFormChange(e, index, section)}
                  onBlur={e => validateField(e.target.name, e.target.value, index, section)}
                  variant='outlined'
                  margin='normal'
                  error={!!formErrors[`networkInterfaces[${index}].label`]}
                  helperText={formErrors[`networkInterfaces[${index}].label`] || ''}
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
              {serverForm[section].length > 1 && (
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

  // Handle Confirm Password
  const handleConfirmChange = prop => event => {
    setState({ ...state, [prop]: event.target.value })
  }

  const handleClickShowConfirmPassword = () => {
    setState({ ...state, showPassword2: !state.showPassword2 })
  }

  const handleMouseDownConfirmPassword = event => {
    event.preventDefault()
  }

  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Fragment>
            <Typography variant='h6' gutterBottom>
              Server Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <CustomToolTip title='The hostname of the server' placement='top'>
                  <TextfieldStyled
                    required
                    id='hostName'
                    name='hostName'
                    label='Host Name'
                    fullWidth
                    autoComplete='off'
                    value={serverForm.hostName}
                    onChange={handleFormChange}
                    onBlur={e => validateField(e.target.name, e.target.value)}
                    error={!!formErrors.hostName}
                    helperText={formErrors.hostName || ''}
                  />
                </CustomToolTip>
              </Grid>
              <Grid item xs={12} sm={6}>
                <AutocompleteStyled
                  freeSolo
                  autoHighlight
                  id='componentName-autocomplete'
                  options={components}
                  value={serverForm.componentName}
                  onChange={(event, newValue) => {
                    // Directly calling handleFormChange with a synthetic event object
                    handleFormChange({ target: { name: 'componentName', value: newValue } }, null, null)
                  }}
                  onInputChange={(event, newInputValue) => {
                    if (event) {
                      handleFormChange({ target: { name: 'componentName', value: newInputValue } }, null, null)
                    }
                  }}
                  onBlur={e => validateField(e.target.name, e.target.value)}
                  renderInput={params => (
                    <TextField {...params} label='Choose Component' fullWidth required autoComplete='off' />
                  )}
                  error={!!formErrors.componentName}
                  helperText={formErrors.componentName || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='datacenterName-autocomplete'
                  options={datacenters}
                  value={serverForm.datacenterName}
                  onChange={(event, newValue) => {
                    // Directly calling handleFormChange with a synthetic event object
                    handleFormChange({ target: { name: 'datacenterName', value: newValue } }, null, null)
                  }}
                  onInputChange={(event, newInputValue) => {
                    if (event) {
                      handleFormChange({ target: { name: 'datacenterName', value: newInputValue } }, null, null)
                    }
                  }}
                  onBlur={e => validateField(e.target.name, e.target.value)}
                  renderInput={params => (
                    <TextField {...params} label='Datacenter Name' fullWidth required autoComplete='off' />
                  )}
                  error={!!formErrors.datacenterName}
                  helperText={formErrors.datacenterName || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='environmentName-autocomplete'
                  options={isEnvironmentEnabled ? filteredEnvironments : []}
                  value={serverForm.environmentName}
                  onChange={(event, newValue) => {
                    // Directly calling handleFormChange with a synthetic event object
                    handleFormChange({ target: { name: 'environmentName', value: newValue } }, null, null)
                  }}
                  onInputChange={(event, newInputValue) => {
                    if (event) {
                      handleFormChange({ target: { name: 'environmentName', value: newInputValue } }, null, null)
                    }
                  }}
                  onBlur={e => validateField(e.target.name, e.target.value)}
                  renderInput={params => (
                    <TextfieldStyled {...params} label='Environment Name' fullWidth required autoComplete='off' />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabelStyled id='status-select-label'>Status</InputLabelStyled>
                  <SelectStyled
                    labelId='status-select-label'
                    id='status-simple-select'
                    value={serverForm.status}
                    label='Status'
                    onChange={handleFormChange}
                    name='status'
                    error={!!formErrors.status}
                    helperText={formErrors.status || ''}
                  >
                    <MenuItem value={'ACTIVE'}>ACTIVE</MenuItem>
                    <MenuItem value={'INACTIVE'}>INACTIVE</MenuItem>
                  </SelectStyled>
                </FormControl>
              </Grid>
            </Grid>
          </Fragment>
        )
      case 1:
        return (
          <Fragment>
            <Stack direction='column' spacing={1}>
              {renderDynamicFormSection('networkInterfaces')}
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
                  onClick={() => addSectionEntry('networkInterfaces')}
                  style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
                >
                  Add Network Interface
                </Button>
              </Box>
            </Stack>
          </Fragment>
        )
      case 2:
        return (
          <Fragment>
            <Stack direction='column' spacing={1}>
              {renderDynamicFormSection('metadata')}
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
                  onClick={() => addSectionEntry('metadata')}
                  style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }} // Optional: Also conditionally change the text color of the button
                >
                  Add Metadata
                </Button>
              </Box>
            </Stack>
          </Fragment>
        )
      case 3:
        return <ReviewAndSubmitSection serverForm={serverForm} />
      default:
        return 'Unknown Step'
    }
  }

  const renderContent = () => {
    if (activeStep === steps.length) {
      return (
        <Fragment>
          <Typography>Server details have been submitted.</Typography>
          <ReviewAndSubmitSection serverForm={serverForm} />
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
              <Typography variant='caption' component='p' paddingBottom={5}>
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
                      <Typography className='step-subtitle'>{step.subtitle}</Typography>
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

export default AddServerWizard
