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
import { da, el, fi } from 'date-fns/locale'
import { set } from 'nprogress'
import { main } from '@popperjs/core'

// Define initial state for the server form
const initialServerFormState = {
  hostName: '',
  componentName: '',
  datacenterName: '',
  environmentName: '',
  status: 'Active',
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

const ReviewAndSubmitSection = ({ serverForm }) => {
  return (
    <Fragment>
      {Object.entries(serverForm).map(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // For nested objects (excluding arrays), recursively render sections
          return <ReviewAndSubmitSection serverForm={value} key={key} />
        } else if (Array.isArray(value)) {
          return <Section title={key} data={value} key={key} />
        } else {
          // For simple key-value pairs
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

  const theme = useTheme()
  const session = useSession()

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
    fetchEnviroments()
    fetchComponents()
  }, []) // Empty dependency array means this effect runs once on mount

  // Function to handle form field changes
  const handleFormChange = (event, index, section) => {
    const { name, value } = event.target

    // Upper case the value being entered
    const upperCasedValue = value.toUpperCase()

    if (section) {
      // Handle changes for dynamic sections (metadata or networkInterfaces)
      const updatedSection = [...serverForm[section]]
      updatedSection[index][name] = upperCasedValue
      setServerForm({ ...serverForm, [section]: updatedSection })
    } else {
      // Handle changes for static fields
      setServerForm({ ...serverForm, [name]: upperCasedValue })
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

        if (response.data) {
          toast.success('Server details added successfully')

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
    return serverForm[section].map((entry, index) => (
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
              variant='outlined'
              margin='normal'
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
              variant='outlined'
              margin='normal'
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
            {serverForm[section].length > 1 && (
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
                  />
                </CustomToolTip>
              </Grid>
              <Grid item xs={12} sm={6}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
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
                  renderInput={params => (
                    <TextField {...params} label='Component Name' fullWidth required autoComplete='off' />
                  )}
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
                  renderInput={params => (
                    <TextField {...params} label='Datacenter Name' fullWidth required autoComplete='off' />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='environmentName-autocomplete'
                  options={environments}
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
                    value={serverForm.status.toUpperCase()}
                    label='Status'
                    onChange={handleFormChange}
                    name='status'
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
