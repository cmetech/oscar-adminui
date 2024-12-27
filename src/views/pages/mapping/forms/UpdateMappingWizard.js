// ** React Imports
import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

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

// Define initial state for the mapping form
const initialMappingFormState = {
  mappingName: '',
  mappingDescription: '',
  mappingNamespaceName: '',
  mappingComment: '',
  mappingAdditionalref: '',
  mappingMetadata: [{ key: '', value: '', metadata_owner_level:'', metadata_owner_name:''}],
  mappingElement: [{key: '', value: '', description:'', comment:''}]
}

const steps = [
  {
    title: 'Mapping Information',
    subtitle: 'Add Mapping Information',
    description: 'Add the Name, Description, and Mapping Name for the Mapping.'
  },
  {
    title: 'Mapping Element Information',
    subtitle: 'Add Mappilement Information',
    description: 'Add the Mapping Element Key-Value pair details.'
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
  '& .MuiOutlinedInput-root': {
    fieldset: {
      borderColor: 'inherit' // default border color
    },
    '&.Mui-focused': {
      fieldset: {
        borderColor: theme.palette.customColors.accent // border color when focused
      }
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

const Section = ({ title, data }) => {
 console.log("Section with title" + title + "Data with "+ data)

  return (
    <Fragment>
      <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
        {title.charAt(0).toUpperCase() + title.slice(1)}
      </Typography>
      {data.map((item, index) => (
        <Grid container spacing={2} key={`${title}-${index}`}>
          {Object.entries(item).map(([itemKey, itemValue]) => (
            <Grid item xs={12} sm={6} key={`${itemKey}-${index}`}>
              <TextField
                fullWidth
                label={itemKey.charAt(0).toUpperCase() + itemKey.slice(1)}
                value={itemValue != null ? itemValue.toString() : ""}
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

const ReviewAndSubmitSection = ({ mappingForm }) => {
  console.log("Review And Submit Section started with" + mappingForm)
  
  return (
    <Fragment>
      {Object.entries(mappingForm).map(([key, value]) => {
        console.log("Logging----->  Key:" +key+ "Value:", value);
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // For nested objects (excluding arrays), recursively render sections
          return <ReviewAndSubmitSection mappingForm={value} key={key} />
        } else if (Array.isArray(value)) {
          console.log("Going inside Array Section", value);
          
          return <Section title={key} data={value} key={key} />
        } else {
          // For simple key-value pairs
          return (
            <Grid container spacing={2} key={key}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={value != null ? value.toString() : ""}
                  InputProps={{ readOnly: true }}
                  variant='outlined'
                  margin='normal'
                />
              </Grid>
            </Grid>
          )
        }
      })}
    </Fragment>
  )
}

const UpdateMappingWizard = ({ onClose, ...props }) => {

  // Destructure all props here
  const { currentMapping, rows, setRows } = props

  // ** States
  const [mappingForm, setMappingForm] = useState(initialMappingFormState)
  const [activeStep, setActiveStep] = useState(0)
  const [resetFormFields, setResetFormFields] = useState(false)
  const [components, setComponents] = useState([])
  const [mappingNamespaces, setMappingNamespaces] = useState([])

  const theme = useTheme()
  const session = useSession()

  // Use useEffect to initialize the form with currentServer data
  useEffect(() => {
    // Check if currentMapping exists and is not empty
    if (currentMapping && Object.keys(currentMapping).length > 0) {
      const updatedMappingForm = {
        mappingName: currentMapping.name.toUpperCase() || '',
        mappingDescription: currentMapping.description.toUpperCase() || '',
        mappingNamespaceName: currentMapping.mapping_namespace_name.toUpperCase() || '',
        mappingComment: currentMapping.comment.toUpperCase() || '',
        mappingAdditionalref: currentMapping.additional_ref.toUpperCase() || '',
        mappingElement: currentMapping.element || [{ key: '', value: '', description:'', comment:'' }],
        mappingMetadata: currentMapping.metadata || [{ key: '', value: '', metadata_owner_level:'', metadata_owner_name:'' }]
      }
      setMappingForm(updatedMappingForm)
    }
  }, [currentMapping])

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

    // Function to handle form field changes
  const handleFormChange = (event, index, section) => {
    const { name, value } = event.target

    // Upper case the value being entered
    const upperCasedValue = value.toUpperCase()

    if (section) {
      // Handle changes for dynamic sections (metadata or element)
      const updatedSection = [...mappingForm[section]]
      updatedSection[index][name] = upperCasedValue
      setMappingForm({ ...mappingForm, [section]: updatedSection })
    } else {
      // Handle changes for static fields
      setMappingForm({ ...mappingForm, [name]: upperCasedValue })
    }
  }

  // Function to add a new entry to a dynamic section
  const addSectionEntry = section => {
    const newEntry = section === 'mappingMetadata' ? { key: '', value: '', metadata_owner_level: '', metadata_owner_name:''} : { key: '', value: '', description: '',  comment:''}
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
    if (activeStep === 2 || activeStep === 3) {
      // When navigating back from Metadata Info
      setResetFormFields(prev => !prev) // Toggle reset state
    }
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = async () => {
    if (activeStep === 1 || activeStep ==2) {
      // Assuming step 1 is Network Info and step 2 is Metadata Info
      setResetFormFields(prev => !prev) // Toggle reset state to force UI update
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
          name: mappingForm.mappingName,
          description: mappingForm.mappingDescription,
          comment: mappingForm.mappingComment,
          additional_ref: mappingForm.mappingAdditionalref,
          mapping_namespace_name: mappingForm.mappingNamespaceName,
          element: mappingForm.mappingElement.filter(el => {
            return el.key && typeof el.key === 'string' && el.key.trim() !== '';
          }),
          metadata: mappingForm.mappingMetadata.filter(md => {
            return md.key && typeof md.key === 'string' && md.key.trim() !== '';
          })
        }

        console.log('Submitting mapping details', payload)

        // Update the endpoint to point to your Next.js API route
        const endpoint = `/api/mapping/${props.currentMapping.id}`
        const response = await axios.patch(endpoint, payload, { headers })

        if (response.data) {
          const updatedServer = response.data

          const updatedRows = props.rows.map(row => {
            if (row.id === updatedServer.id) {
              return updatedServer
            }

            return row
          })

          props.setRows(updatedRows)

          toast.success('Mapping details updated successfully')

          // Call onClose to close the modal
          onClose && onClose()
        }
      } catch (error) {
        console.error('Error updating mapping details', error)
        toast.error('Error updating mapping details')
      }
    }
  }

  const handleReset = () => {
    if (currentMapping && Object.keys(currentMapping).length > 0) {
      const resetMappingForm = {
        mappingName: currentMapping.name.toUpperCase() || '',
        mappingDescription: currentMapping.description.toUpperCase() || '',
        mappingNamespaceName: currentMapping.mapping_namespace_name.toUpperCase() || '',
        mappingComment: currentMapping.comment.toUpperCase() || '',
        mappingAdditionalref: currentMapping.additional_ref.toUpperCase() || '',
        mappingElement: [{ key: '', value: '', description: '', comment: ''}],
        mappingMetadata: [{ key: '', value: '', metadata_owner_level: '', metadata_owner_name: ''}]
      }
      setMappingForm(resetMappingForm)

    } else {
      setMappingForm(initialMappingFormState) // Fallback to initial state if currentServer is not available
    }
    setResetFormFields(false)
    setActiveStep(0)
  }


  // Render form fields for metadata
  const renderDynamicFormSection = section => {
    return mappingForm[section].map((entry, index) => (
      <Box key={`${index}-${resetFormFields}`} sx={{ marginBottom: 1 }}>
        <Grid container spacing={3} alignItems='center'>
          <Grid item xs={section === 'mappingMetadata' ? 3 : 3}>
            <TextfieldStyled
              key={`field1-${section}-${index}-${resetFormFields}`}
              fullWidth
              label={section === 'mappingMetadata' ? 'Key' : 'Key'}
              name={section === 'mappingMetadata' ? 'key' : 'key'}
              value={entry.key || entry.name}
              onChange={e => handleFormChange(e, index, section)}
              variant='outlined'
              margin='normal'
            />
          </Grid>
          <Grid item xs={section === 'mappingMetadata' ? 3 : 3}>
            <TextfieldStyled
              key={`field2-${section}-${index}-${resetFormFields}`}
              fullWidth
              label={section === 'mappingMetadata' ? 'Value' : 'Value'}
              name={section === 'mappingMetadata' ? 'value' : 'value'}
              value={entry.value || entry.ip_address}
              onChange={e => handleFormChange(e, index, section)}
              variant='outlined'
              margin='normal'
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
                value={entry.metadata_owner_level || entry.meta_owner_level ||' '}
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
                variant='outlined'
                margin='normal'
              />
            </Grid>
          )}

          {section === 'mappingMetadata' && (
            <Grid item xs={section === 'mappingMetadata' ? 3 : 3}>
              <TextfieldStyled
                key={`field2-${section}-${index}-${resetFormFields}`}
                fullWidth
                label={section === 'mappingMetadata' ? 'Metadata Owner Name' : 'Meta Name'}
                name={section === 'mappingMetadata' ? 'metadata_owner_name' : 'meta_name'}
                value={entry.metadata_owner_name || entry.ip_address || ''}
                onChange={e => handleFormChange(e, index, section)}
                variant='outlined'
                margin='normal'
              />
            </Grid>
          )}

          {section === 'mappingElement' && (
            <Grid item xs={3}>
              <TextfieldStyled
                key={`field2-${section}-${index}-${resetFormFields}`}
                fullWidth
                label='Description'
                name='description'
                value={entry.description}
                onChange={e => handleFormChange(e, index, section)}
                onBlur={e => validateField(e.target.name, e.target.value, index, section)}
                variant='outlined'
                margin='normal'
              />
            </Grid>
          )}

          {section === 'mappingElement' && (
            <Grid item xs={3}>
              <TextfieldStyled
                key={`field2-${section}-${index}-${resetFormFields}`}
                fullWidth
                label='Comment'
                name='comment'
                value={entry.comment}
                onChange={e => handleFormChange(e, index, section)}
                onBlur={e => validateField(e.target.name, e.target.value, index, section)}
                variant='outlined'
                margin='normal'
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
    ))
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
                <TextfieldStyled
                  required
                  id='mappingName'
                  name='mappingName'
                  label='Mapping Name'
                  fullWidth
                  autoComplete='off'
                  value={mappingForm.mappingName}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextfieldStyled
                  required
                  id='mappingDescription'
                  name='mappingDescription'
                  label='Mapping Description'
                  fullWidth
                  autoComplete='off'
                  value={mappingForm.mappingDescription}
                  onChange={handleFormChange}
                />
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
                  renderInput={params => (
                    <TextfieldStyled {...params} label='Mapping Namespace Name' fullWidth required autoComplete='off' />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextfieldStyled
                  required
                  id='mappingComment'
                  name='mappingComment'
                  label='Mapping Comment'
                  fullWidth
                  autoComplete='off'
                  value={mappingForm.mappingComment}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextfieldStyled
                  required
                  id='mappingAdditionalref'
                  name='mappingAdditionalref'
                  label='Mapping Additional Reference'
                  fullWidth
                  autoComplete='off'
                  value={mappingForm.mappingAdditionalref}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>
          </Fragment>
        )
        case 1:
          return (
            <Fragment>
              <Stack direction='column' spacing={1}>
                {renderDynamicFormSection('mappingElement')}
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
                    onClick={() => addSectionEntry('mappingElement')}
                    style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }} // Optional: Also conditionally change the text color of the button
                  >
                    Update Mapping Element
                  </Button>
                </Box>
              </Stack>
            </Fragment>
          )
      case 2:
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
                  style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
                >
                  Update Metadata
                </Button>
              </Box>
            </Stack>
          </Fragment>
        )
      case 3:
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

export default UpdateMappingWizard

