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
import FormGroup from '@mui/material/FormGroup'
import FormLabel from '@mui/material/FormLabel'
import Autocomplete from '@mui/material/Autocomplete'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'

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

import { componentsAtom, refetchComponentTriggerAtom } from 'src/lib/atoms'

const steps = [
  {
    title: 'Component Information',
    subtitle: 'Edit Component Information',
    description: 'Edit the Name, Type, and Description for the component.'
  },
  {
    title: 'Review',
    subtitle: 'Review and Submit',
    description: 'Review the Component details and submit.'
  }
]

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

// Define validation schema for form
const validationSchema = yup.object({
  componentName: yup
    .string()
    .required('Component Name is required')
    .matches(/^[A-Za-z0-9-]+$/, 'Only alphanumeric characters and hyphens are allowed')
    .min(3, 'Name must be at least 3 characters')
    .trim(),
  subcomponentName: yup
    .string()
    .matches(/^[A-Za-z0-9-]+$/, 'Only alphanumeric characters and hyphens are allowed')
    .min(3, 'Name must be at least 3 characters')
    .trim(),
  componentType: yup
    .string()
    .matches(/^[A-Za-z0-9-]+$/, 'Only alphanumeric characters and hyphens are allowed')
    .min(3, 'Name must be at least 3 characters')
    .trim(),
  componentDetails: yup.string().trim()
})

const UpdateComponentWizard = ({ onClose, ...props }) => {
  // ** States
  const [componentName, setComponentName] = useState(props.currentComponent?.name || '')
  const [componentDetails, setComponentDetails] = useState(props.currentComponent?.details || '')
  const [componentType, setComponentType] = useState(props.currentComponent?.type || '')
  const [subcomponentName, setSubcomponentName] = useState(props.currentComponent?.default_subcomponent_name || '')
  const [subComponents, setSubComponents] = useState([])
  const [activeStep, setActiveStep] = useState(0)
  const [formErrors, setFormErrors] = useState({})
  const [, setComponents] = useAtom(componentsAtom)
  const [, setRefetchTrigger] = useAtom(refetchComponentTriggerAtom)

  const theme = useTheme()
  const session = useSession()

  // Validate Form
  const validateForm = async () => {
    try {
      // Validate the form values
      await validationSchema.validate(
        {
          componentName,
          subcomponentName,
          componentType,
          componentDetails
        },
        { abortEarly: false }
      )

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
      }

      return false
    }
  }

  useEffect(() => {
    const fetchSubComponents = async () => {
      try {
        // Directly use the result of the await expression
        const response = await axios.get('/api/inventory/subcomponents')
        const data = response.data.rows

        // Iterate over the data array and extract the name value from each object
        const subComponentNames = data.map(subcomponent => subcomponent.name.toUpperCase())
        setSubComponents(subComponentNames)
      } catch (error) {
        console.error('Failed to fetch subcomponents:', error)
      }
    }

    fetchSubComponents()
  }, []) // Empty dependency array means this effect runs once on mount

  // Handle Stepper
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleSubcomponentNameChange = event => {
    setSubcomponentName(event.target.value)
  }

  const handleNext = async () => {
    // Validate the form before proceeding to the next step or submitting
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
          name: componentName,
          default_subcomponent_name: subcomponentName,
          details: componentDetails,
          type: componentType
        }

        // Update the endpoint to point to your Next.js API route
        const endpoint = `/api/inventory/components/${props.currentComponent.id}`
        const response = await axios.patch(endpoint, payload, { headers })

        if (response.data) {
          const updatedComponent = response.data

          const updatedRows = props.rows.map(row => {
            if (row.id === updatedComponent.id) {
              return updatedComponent
            }

            return row
          })

          props.setRows(updatedRows)
          props.currentComponent = updatedComponent

          toast.success('Component details updated successfully')

          // Call onClose to close the modal
          onClose && onClose()
        }
      } catch (error) {
        console.error('Error updating component details', error)
        toast.error('Error updating component details')
      }
    }
  }

  const handleReset = () => {
    setComponentName(props?.currentComponent?.name || '')
    setComponentDetails(props?.currentComponent?.details || '')
    setSubComponentName(props?.currentComponent?.default_subcomponent_name || '')
    setComponentType(props?.currentComponent?.type || '')
    setActiveStep(0)
  }

  // Handle changes to the form fields
  const handleComponentNameChange = event => {
    setComponentName(event.target.value)
  }

  const handleComponentDetailsChange = event => {
    setComponentDetails(event.target.value)
  }

  const handleComponentTypeChange = event => {
    setComponentType(event.target.value)
  }

  // Handle Confirm Password
  const handleConfirmChange = prop => event => {
    setState({ ...state, [prop]: event.target.value })
  }

  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Fragment>
            <Grid container spacing={6}>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <TextfieldStyled
                    fullWidth
                    value={componentName.toUpperCase()}
                    onChange={handleComponentNameChange}
                    label='Name'
                    error={Boolean(formErrors?.componentName)}
                    helperText={formErrors?.componentName}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='subcomponentName-autocomplete'
                  options={subComponents}
                  value={subcomponentName.toUpperCase()}
                  onChange={(event, newValue) => {
                    // Directly calling handleFormChange with a synthetic event object
                    handleSubcomponentNameChange({ target: { name: 'subcomponentName', value: newValue } }, null, null)
                  }}
                  onInputChange={(event, newInputValue) => {
                    if (event) {
                      handleSubcomponentNameChange(
                        { target: { name: 'subcomponentName', value: newInputValue } },
                        null,
                        null
                      )
                    }
                  }}
                  renderInput={params => (
                    <TextField {...params} label='Subcomponent Name' fullWidth required autoComplete='off' />
                  )}
                  error={Boolean(formErrors?.subcomponentName)}
                  helperText={formErrors?.subcomponentName}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <TextfieldStyled
                    fullWidth
                    value={componentDetails.toUpperCase()}
                    onChange={handleComponentDetailsChange}
                    label='Details'
                    error={Boolean(formErrors?.componentDetails)}
                    helperText={formErrors?.componentDetails}
                  />
                </FormControl>
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <TextfieldStyled
                    fullWidth
                    value={componentType.toUpperCase()}
                    onChange={handleComponentTypeChange}
                    label='Type'
                    error={Boolean(formErrors?.componentType)}
                    helperText={formErrors?.componentType}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Fragment>
        )
      case 1:
        return (
          <Fragment>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography
                  variant='h6'
                  sx={{
                    mt: 2,
                    mb: 1,
                    textDecoration: 'underline',
                    color:
                      theme.palette.mode === 'light'
                        ? theme.palette.customColors.brandBlack
                        : theme.palette.customColors.brandYellow
                  }}
                >
                  General Information
                </Typography>
                <Grid item xs={12}>
                  <Typography>
                    Name: <strong>{componentName.toUpperCase()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Subcomponent Name: <strong>{subcomponentName.toUpperCase()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Details: <strong>{componentDetails.toUpperCase()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Type: <strong>{componentType.toUpperCase()}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Fragment>
        )
      default:
        return 'Unknown Step'
    }
  }

  const renderContent = () => {
    if (activeStep === steps.length) {
      return (
        <Fragment>
          <Typography>Component details have been submitted.</Typography>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Typography
                variant='h6'
                sx={{
                  mt: 2,
                  mb: 1,
                  textDecoration: 'underline',
                  color:
                    theme.palette.mode === 'light'
                      ? theme.palette.customColors.brandBlack
                      : theme.palette.customColors.brandYellow
                }}
              >
                General Information
              </Typography>
              <Grid item xs={12}>
                <Typography>
                  Name: <strong>{componentName.toUpperCase()}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  Subcomponent Name: <strong>{subcomponentName.toUpperCase()}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  Details: <strong>{componentDetails.toUpperCase()}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  Type: <strong>{componentType.toUpperCase()}</strong>
                </Typography>
              </Grid>
            </Grid>
          </Grid>
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

export default UpdateComponentWizard
