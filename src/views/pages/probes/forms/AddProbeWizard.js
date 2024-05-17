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

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Styled Component
import StepperWrapper from 'src/@core/styles/mui/stepper'

// ** Import yup for form validation
import * as yup from 'yup'
import { current } from '@reduxjs/toolkit'

// Define initial state for the server form
const initialProbeFormState = {
  name: '',
  type: '',
  status: 'enabled',
  description: '',
  target: '',
  host: '',
  port: '',
  url: ''
}

const steps = [
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
    title: 'Review',
    subtitle: 'Summary',
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
      {/* List all general fields here */}
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
          //label='Target'
          label={probeForm.type === 'PORT' ? "HOST" : "URL"}
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
          type="number"
        />        
        </Grid>
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
      {/* Add other general fields as needed */}
    </Grid>
  )

  return (
    <Fragment>
      {renderGeneralSection(probeForm)}
    </Fragment>
  )
}

// Define validation schema
const stepValidationSchemas = [
  yup.object(),// No validation in select type step
  yup.object({
    type: yup.string().required('Type is required'),
    port: yup.string()
      .when("type", (typeValue, schema) => {
        //console.log("Type Value in .when():", typeValue); 
        if (typeValue[0] === 'PORT') {
          //console.log("checking for port since typevalue = port")
          return schema
            .required('Port is required')
            .matches(/^\d+$/, 'Only numbers are allowed')
            .test('is-valid-port', 'Port must be a valid number between 1 and 65535', value => {
              const num = parseInt(value, 10);
              return !isNaN(num) && num >= 1 && num <= 65535;
            });
        } else {
          //console.log("Ignoring port check typevalue = port as its url")
          return schema.notRequired();
        }
      }),
      target: yup.string()
        .when("type", (typeValue, schema) => {
          if (typeValue[0] === 'PORT') {
            return schema
              .required('Target is required')
              .matches(/^(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, 'Must be a valid IP address')
          } else {
            //console.log("Ignoring target check typevalue = port as its url");
            return schema.notRequired();
          }
        })
  }),
  yup.object() //No validation for the review step
]

const AddProbeWizard = ({ onClose }) => {
  // ** States
  const [probeForm, setProbeForm] = useState(initialProbeFormState)
  const [activeStep, setActiveStep] = useState(0)
  const [probeType, setProbeType] = useState('URL')
  const [resetFormFields, setResetFormFields] = useState(false)  
  const [formErrors, setFormErrors] = useState({})
  const [, setRefetchTrigger] = useAtom(refetchProbeTriggerAtom)

  const theme = useTheme()
  const session = useSession()

  useEffect(() => {
    // Update the probeForm state to reflect the selected probeType
    setProbeForm(prevForm => ({
        ...prevForm,        
        type: probeType, 
        port: probeType === 'URL' ? '' : prevForm.port,
        //target: ''
    }));    
  }, [probeType]); 
  
  // Validate Form
  const validateForm = async () => {
    try {
      // Validate based on the current step
      const formData = {
        type: probeType,  // Assuming 'probeType' holds either 'PORT' or some other values correctly corresponding to your form selections
        port: probeForm.port,  // Make sure 'probeForm.port' exists and holds the current port number from the form
        target: probeForm.target
      };
      
      const validationSchema = stepValidationSchemas[activeStep]
      
      await validationSchema.validate(formData, { abortEarly: false } )

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
        //console.error("Validation failed without specific field errors:", yupError);
        setFormErrors({ general: yupError.message || "An unknown error occurred" });
      }

      return false
    }
  }

  const handleFormChange = (event, index, section) => {
    // Handling both synthetic events and direct value assignments from Autocomplete
    const target = event.target || event
    const name = target.name
    let value = target.value

    //console.log("The field being updated = ", name)

    // Convert string values to lowercase, except for specific fields
    if (typeof value === 'string') {
      value = value.toLowerCase()
    }

    //console.log('Updating fields '+name+ ' with: '+value)
    setProbeForm(prevForm => {
      const newForm = { ...prevForm }

      // Top-level field updates
      newForm[name] = value
      
      return newForm
    })
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
          ...probeForm
        }

        //console.log('Payload:', payload)

        // Update the endpoint to point to your Next.js API route
        const endpoint = `/api/probes/add`
        const response = await axios.post(endpoint, payload, { headers })

        if (response.data) {
          const probe = response.data

          if (probe) {
            console.log('Probe successfully created for ', probe.name)
          } else {
            console.error('Failed to create probe')
            toast.error('Failed to create probe')
          }

          // Call onClose to close the modal
          onClose && onClose()

          // Trigger a refetch of the probe list
          setRefetchTrigger(new Date().getTime())
        }
      } catch (error) {
        console.error('Error updating probe details', error)
        toast.error('Error updating probe details')
      }
    }
  }

  const handleReset = () => {
    setProbeForm(initialProbeFormState) // Fallback to initial state if currentServer is not available
    setResetFormFields(false)
    setActiveStep(0)
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
                    <strong>Probes</strong>, are designed to monitor services from an external perspective. 
                    The are two types of probes in Oscar: HTTP URL and Port Check. Please select the probe type to
                    get a detailed description of each probe type.
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body2" gutterBottom>
                    {probeType === 'URL' ? (
                      <Fragment>
                        <strong>URL</strong> - HTTP URL probes are designed to monitor the availability and response time of HTTP or HTTPS URLs. 
                        They can verify SSL/TLS certificate validity, uptime of websites, and more.
                        <ul>
                          <li>Monitoring the uptime of websites and web applications.</li>
                          <li>Verifying SSL/TLS certificate validity and expiration.</li>
                          <li>Tracking the response time of API endpoints or other web services to ensure they meet performance benchmarks.</li>
                          <li><strong>Example:</strong> http://example.com, https://example.com</li>
                        </ul>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <strong>PORT</strong> - Port Check probes verify if a specific TCP port on a host is open and listening, which is crucial for service accessibility such as databases and file servers.
                        <ul>
                          <li>Ensuring that core services like SSH, HTTP, HTTPS, FTP, and databases are accessible.</li>
                          <li>Network security audits to verify that only the expected ports are open.</li>
                          <li>Infrastructure monitoring in both development and production environments.</li>
                          <li><strong>Example:</strong> YourServerIP:PortNumber</li>
                        </ul>
                      </Fragment>
                    )}
                  </Typography>
                </Grid>            
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth margin="normal">
                    <InputLabelStyled id="probe-type-label">Probe Type</InputLabelStyled>
                    <SelectStyled
                      labelId="probe-type-label"
                      value={probeType}
                      onChange={e => setProbeType(e.target.value)}
                      label="Probe Type"
                    >                    
                      <MenuItem value="URL">URL</MenuItem>
                      <MenuItem value="PORT">PORT</MenuItem>
                    </SelectStyled>
                  </FormControl>
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
                    readOnly: true, // This makes the field read-only
                  }}
                />
              </Grid>               
              <Grid item xs={12} sm={6}>
                <TextField
                  required                 
                  id='target'
                  //name={probeType === 'PORT' ? "HOST" : "URL"}
                  name='target'
                  label={probeType === 'PORT' ? "HOST" : "URL"}
                  fullWidth
                  autoComplete='off'                  
                  //variant="outlined"
                  value={probeForm.target}                  
                  onChange={handleFormChange}
                  //margin="normal"
                />
              </Grid>             
              {probeType === 'PORT' && (
                <Grid item xs={12} sm={6}>
                <TextField
                  id='port'
                  name="port"
                  label="Port"
                  fullWidth                                    
                  type="number"
                  value={probeForm.port}
                  onChange={handleFormChange}
                  //margin="normal"
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
                    // Directly calling handleFormChange with a synthetic event object
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

export default AddProbeWizard
