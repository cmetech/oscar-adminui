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

import { mappingsAtom, refetchMappingTriggerAtom } from 'src/lib/atoms'

// Define initial state for the mapping form
const initialMappingFormState = {
  mappingName: '',
  mappingDescription: '',
  mappingNamespaceName: '',
  mappingComment: '',
  mappingAdditionalref: '',
  mappingMetadata: [{ key: '', value: '', metadata_owner_level:'', metadata_owner_name:''}]
}

const steps = [
  {
    title: 'Mapping Information',
    subtitle: 'Add Mapping Information',
    description: 'Add the Name, Description, and Mapping Name for the Mapping.'
  },
  {
    title: 'Metadata Information',
    subtitle: 'Add Metadata Information',
    description: 'Add the Metadata details.'
  },
  {
    title: 'Review',
    subtitle: 'Review and Submit',
    description: 'Review the Environment details and submit.'
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
  '&.MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.customColors.accent
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.customColors.accent // border color when focused
    }
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

// Replace 'defaultBorderColor' with your default border color.

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
  // Style the border color
  // '& .MuiOutlinedInput-notchedOutline': {
  //   borderColor: 'inherit' // Replace with your default border color
  // },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'inherit' // Replace with your hover state border color
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.customColors.accent // Border color when focused
  }

  // You can add more styles here for other parts of the input
}))

// Define validation schema for the form
const validationSchema = yup.object({
  mappingName: yup
    .string()
    .trim()
    .required('Mapping Name is required')
    .matches(/^[A-Za-z0-9-]+$/, 'Only alphanumeric characters and hyphens are allowed')
    .min(3, 'Name must be at least 3 characters')
    .trim(),
  mappingDescription: yup
    .string()
    .trim()
    .min(3, 'Description must be at least 3 characters')
    .trim(),
  mappingNamespaceName: yup
    .string()
    .trim()
    .required('Mapping NameSpace is required')
    .matches(/^[A-Za-z0-9-]+$/, 'Only alphanumeric characters and hyphens are allowed')
    .min(3, 'Name must be at least 3 characters')
    .trim(),
  mappingComment: yup.string().trim(),
  mappingAdditionalref: yup.string().trim(),
  mappingMetadata: yup
    .array()
    .of(
      yup.object().shape({
        key: yup.string(),
        value: yup.string(),
        metadata_owner_level: yup.string(),
        metadata_owner_name: yup.string()
      })
    )
    .test(
      'metadata-key-value-pair',
      'Both key and value are required in metadata if either is provided',
      (metadata = []) => metadata.every(md => (!md.key && !md.value) || (md.key && md.value))
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
                  value={itemValue != null ? itemValue.toString() : ""}
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

const ReviewAndSubmitSection = ({ mappingForm, formErrors }) => {
  return (
    <Fragment>
      {Object.entries(mappingForm).map(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // For nested objects (excluding arrays), recursively render sections
          return <ReviewAndSubmitSection mappingForm={value} formErrors={formErrors} key={key} />
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
                  value={value != null ? value.toString() : ""}
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

const AddMappingWizard = ({ onSuccess, ...props }) => {
  // ** States
  const [mappingForm, setMappingForm] = useState(initialMappingFormState)
  const [activeStep, setActiveStep] = useState(0)
  const [resetFormFields, setResetFormFields] = useState(false)
  const [mappingNamespaces, setMappingNamespaces] = useState([])
  const [isMappingNamespaceEnabled, setIsMappingNamespaceEnabled] = useState(false)
  const [filteredMappings, setFilteredMappings] = useState([])
  const [formErrors, setFormErrors] = useState({})
  const [, setMappings] = useAtom(mappingsAtom)
  const [, setRefetchTrigger] = useAtom(refetchMappingTriggerAtom)

  const theme = useTheme()
  const session = useSession()

  useEffect(() => {
    console.log('Current FormErrors:', formErrors)
  }, [formErrors])

  useEffect(() => {
    const fetchMappingNamespaces = async () => {
      try {
        // Directly use the result of the await expression
        const response = await axios.get('/api/mappingnamespaces')
        const data = response.data.rows

        // Iterate over the data array and extract the name value from each object
        const mappingNamespaceNames = data.map(mappingNamespace => mappingNamespace.name.toUpperCase())
        setMappingNamespaces(mappingNamespaceNames)
      } catch (error) {
        console.error('Failed to fetch mappingnamespaces:', error)
      }
    }

    fetchMappingNamespaces()
  }, [])

  const validateField = async (fieldName, value, index, section) => {
    // Construct the correct path for nested fields
    const fieldPath = section ? `${section}[${index}].${fieldName}` : fieldName

    console.log(`Validating Field: ${fieldPath} with Value: ${value}`)

    try {
      // Adjust the context object based on whether we're validating a section or a top-level field
      const contextObject = section ? { [section]: mappingForm[section] } : mappingForm

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
      // Assuming mappingForm is the state holding your form data
      // and validationSchema is your Yup schema
      await validationSchema.validate(mappingForm, { abortEarly: false })

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
      const updatedSection = [...mappingForm[section]]
      updatedSection[index][name] = upperCasedValue
      setMappingForm({ ...mappingForm, [section]: updatedSection })
    } else {
      console.log(`Updating ${name} to ${value}`)

      // Handle changes for static fields
      setMappingForm({ ...mappingForm, [name]: upperCasedValue })

      // Validate the field after the value has been updated
      validateField(name, upperCasedValue)
    }

    if (name === 'mappingNamespaceName') {
      setIsEnvironmentEnabled(false) // Disable environment field initially
      setFilteredEnvironments([]) // Reset filtered environments

      try {
        const response = await axios.get(`/api/mappingnamespaces?name=${upperCasedValue}`)
        const data = response.data.rows
        const mappingNamespacesNames = data.map(env => env.name.toUpperCase())
        setFilteredEnvironments(mappingNamespacesNames)
        setIsEnvironmentEnabled(true) // Enable environment field after fetching
      } catch (error) {
        console.error('Failed to fetch environments for the selected datacenter:', error)
        toast.error('Failed to fetch environments')
      }
    }
  }


  // Function to add a new entry to a dynamic section
  const addSectionEntry = section => {
    const newEntry = section === 'mappingMetadata' ? { key: '', value: '', metadata_owner_level: '',  metadata_owner_name:''} : { metakey: '', metavalue: ''}
    const updatedSection = [...mappingForm[section], newEntry]
    setMappingForm({ ...mappingForm, [section]: updatedSection })
  }

  // Function to remove an entry from a dynamic section
  const removeSectionEntry = (section, index) => {
    const updatedSection = [...mappingForm[section]]
    updatedSection.splice(index, 1)
    setMappingForm({ ...mappingForm, [section]: updatedSection })
  }

  // Handle Stepper
  const handleBack = () => {
    if (activeStep === 2) {
      // When navigating back from Metadata Info
      setResetFormFields(prev => !prev) // Toggle reset state
    }
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = async () => {
    if (activeStep === 1) {
      // Assuming step 1 is Metadata Info
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
          name: mappingForm.mappingName,
          description: mappingForm.mappingDescription,
          mapping_namespace_name: mappingForm.mappingNamespaceName,
          comment: mappingForm.mappingComment,
          additional_ref: mappingForm.mappingAdditionalref,
          metadata: mappingForm.mappingMetadata.filter(md => {
            return md.key && typeof md.key === 'string' && md.key.trim() !== '';
          })
        }

        console.log('Submitting mapping details', payload)

        // Update the endpoint to point to your Next.js API route
        const endpoint = '/api/mapping'
        const response = await axios.post(endpoint, payload, { headers })

        if (response.status === 201 && response.data) {
          toast.success('Mapping details added successfully')
          setRefetchTrigger(Date.now())
          setMappingForm(initialMappingFormState)

          // Call the onSuccess callback after successful submission
          onSuccess()
        }
      } catch (error) {
        console.error('Error adding mapping details', error)
        toast.error('Error adding mapping details')
        setMappingForm(initialMappingFormState)
      }
    }
  }

  const handleReset = () => {
    setMappingForm(initialMappingFormState)
    setResetFormFields(false)
    setActiveStep(0)
  }

  // Render form fields for metadata
  const renderDynamicFormSection = section => {
    return mappingForm[section].map((entry, index) => {
      const errorKeyBase = section === 'mappingMetadata' ? 'value' : 'metavalue'
      const errorKey = `${section}[${index}].${errorKeyBase}`

      return (
        <Box key={`${index}-${resetFormFields}`} sx={{ marginBottom: 1 }}>
          <Grid container spacing={3} alignItems='center'>
            <Grid item xs={section === 'mappingMetadata' ? 3 : 3}>
              <TextfieldStyled
                key={`field1-${section}-${index}-${resetFormFields}`}
                fullWidth
                label={section === 'mappingMetadata' ? 'Key' : 'Name'}
                name={section === 'mappingMetadata' ? 'key' : 'name'}
                value={entry.key || entry.name}
                onChange={e => handleFormChange(e, index, section)}
                onBlur={e => validateField(e.target.name, e.target.value, index, section)}
                variant='outlined'
                margin='normal'
                error={!!formErrors[errorKey]}
                helperText={formErrors[errorKey] || ''}
              />
            </Grid>
            <Grid item xs={section === 'mappingMetadata' ? 3 : 3}>
              <TextfieldStyled
                key={`field2-${section}-${index}-${resetFormFields}`}
                fullWidth
                label={section === 'mappingMetadata' ? 'Value' : 'MetaValue'}
                name={section === 'mappingMetadata' ? 'value' : 'meta_value'}
                value={entry.value || entry.metavalue}
                onChange={e => handleFormChange(e, index, section)}
                onBlur={e => validateField(e.target.name, e.target.value, index, section)}
                variant='outlined'
                margin='normal'
                error={!!formErrors[`${section}[${index}].${section === 'mappingMetadata' ? 'value' : 'ip_address'}`]}
                helperText={formErrors[`${section}[${index}].${section === 'mappingMetadata' ? 'value' : 'ip_address'}`] || ''}
              />
            </Grid>

            {section === 'mappingMetadata' && (
              <Grid item xs={3}>
                <AutocompleteStyled
                  key={`field2-${section}-${index}-${resetFormFields}`}
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id={`autocomplete-${section}-${index}-${resetFormFields}`}
                  options={[' ','Mapping', 'MappingElement']}
                  value={entry.metadata_owner_level || entry.meta_owner_level || ' '}
                  onChange={(event, newValue) => {
                    handleFormChange({ target: { name: 'metadata_owner_level', value: newValue } }, index, section);
                  }}
                  onInputChange={(event, newInputValue) => {
                    if (event) {
                      handleFormChange({ target: { name: 'metadata_owner_level', value: newInputValue } }, index, section);
                    }
                  }}
                  onBlur={e => validateField(e.target.name, e.target.value, index, section)}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Metadata Owner Level"
                      fullWidth
                      required
                      autoComplete="off"
                    />
                  )}
                  error={!!formErrors[`${section}[${index}].${section === 'mappingMetadata' ? 'metadata_owner_level' : 'ip_address'}`]}
                  helperText={formErrors[`${section}[${index}].${section === 'mappingMetadata' ? 'metadata_owner_level' : 'ip_address'}`] || ''}
                />
              </Grid>
            )}

            {section === 'mappingMetadata' && (
              <Grid item xs={3}>
                <TextfieldStyled
                  key={`field2-${section}-${index}-${resetFormFields}`}
                  fullWidth
                  label='Metadata Owner'
                  name='metadata_owner_name'
                  value={entry.metadata_owner_name || entry.meta_owner}
                  onChange={e => handleFormChange(e, index, section)}
                  onBlur={e => validateField(e.target.name, e.target.value, index, section)}
                  variant='outlined'
                  margin='normal'
                  error={!!formErrors[`${section}[${index}].${section === 'mappingMetadata' ? 'metadata_owner_name' : 'ip_address'}`]}
                  helperText={formErrors[`${section}[${index}].${section === 'mappingMetadata' ? 'metadata_owner_name' : 'ip_address'}`] || ''}
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
              {mappingForm[section].length > 0 && (
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
              Mapping Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <CustomToolTip title='The name of the mapping' placement='top'>
                  <TextfieldStyled
                    required
                    id='mappingName'
                    name='mappingName'
                    label='Mapping Name'
                    fullWidth
                    autoComplete='off'
                    value={mappingForm.mappingName}
                    onChange={handleFormChange}
                    onBlur={e => validateField(e.target.name, e.target.value)}
                    error={!!formErrors.mappingName}
                    helperText={formErrors.mappingName || ''}
                  />
                </CustomToolTip>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomToolTip title='Description of the mapping' placement='top'>
                  <TextfieldStyled
                    required
                    id='mappingDescription'
                    name='mappingDescription'
                    label='Mapping Description'
                    fullWidth
                    autoComplete='off'
                    value={mappingForm.mappingDescription}
                    onChange={handleFormChange}
                    onBlur={e => validateField(e.target.name, e.target.value)}
                    error={!!formErrors.mappingDescription}
                    helperText={formErrors.mappingDescription || ''}
                  />
                </CustomToolTip>
              </Grid>
              <Grid item xs={12} sm={6}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='mappingNamespaceName-autocomplete'
                  options={mappingNamespaces}
                  value={mappingForm.mappingNamespaceName}
                  onChange={(event, newValue) => {
                    // Directly calling handleFormChange with a synthetic event object
                    handleFormChange({ target: { name: 'mappingNamespaceName', value: newValue } }, null, null)
                  }}
                  onInputChange={(event, newInputValue) => {
                    if (event) {
                      handleFormChange({ target: { name: 'mappingNamespaceName', value: newInputValue } }, null, null)
                    }
                  }}
                  onBlur={e => validateField(e.target.name, e.target.value)}
                  renderInput={params => (
                    <TextField {...params} label='Mapping Namespace Name' fullWidth required autoComplete='off' />
                  )}
                  error={!!formErrors.mappingNamespaceName}
                  helperText={formErrors.mappingNamespaceName || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomToolTip title='A comment for the map' placement='top'>
                  <TextfieldStyled
                    required
                    id='mappingComment'
                    name='mappingComment'
                    label='Mapping Comment'
                    fullWidth
                    autoComplete='off'
                    value={mappingForm.mappingComment}
                    onChange={handleFormChange}
                    onBlur={e => validateField(e.target.name, e.target.value)}
                    error={!!formErrors.mappingComment}
                    helperText={formErrors.mappingComment || ''}
                  />
                </CustomToolTip>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomToolTip title='Additional-Reference for the map' placement='top'>
                  <TextfieldStyled
                    required
                    id='mappingAdditionalref'
                    name='mappingAdditionalref'
                    label='Mapping Additional Reference'
                    fullWidth
                    autoComplete='off'
                    value={mappingForm.mappingAdditionalref}
                    onChange={handleFormChange}
                    onBlur={e => validateField(e.target.name, e.target.value)}
                    error={!!formErrors.mappingAdditionalref}
                    helperText={formErrors.mappingAdditionalref || ''}
                  />
                </CustomToolTip>
              </Grid>
            </Grid>
          </Fragment>
        )
      case 1:
        return (
          <Fragment>
            <Stack direction='column' spacing={1}>
              {renderDynamicFormSection('mappingMetadata')}
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
                  onClick={() => addSectionEntry('mappingMetadata')}
                  style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }} // Optional: Also conditionally change the text color of the button
                >
                  Add Metadata
                </Button>
              </Box>
            </Stack>
          </Fragment>
        )
      case 2:
        return <ReviewAndSubmitSection mappingForm={mappingForm} />
      default:
        return 'Unknown Step'
    }
  }

  const renderContent = () => {
    if (activeStep === steps.length) {
      return (
        <Fragment>
          <Typography>Mapping details have been submitted.</Typography>
          <ReviewAndSubmitSection mappingForm={mappingForm} />
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

export default AddMappingWizard