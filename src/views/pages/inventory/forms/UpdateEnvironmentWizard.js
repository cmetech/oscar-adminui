// ** React Imports
import { Fragment, use, useState } from 'react'
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

const steps = [
  {
    title: 'Environment Information',
    subtitle: 'Edit Environment Information',
    description: 'Edit the Name and Description for the environment.'
  },
  {
    title: 'Review',
    subtitle: 'Review and Submit',
    description: 'Review the Environment details and submit.'
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

// Define validation schema for the form
const validationSchema = yup.object({
  environmentName: yup
    .string()
    .required('Environment Name is required')
    .matches(/^[A-Za-z0-9-]+$/, 'Only alphanumeric characters and hyphens are allowed')
    .min(3, 'Name must be at least 3 characters')
    .trim(),
  environmentDescription: yup.string().trim()
})

const UpdateEnvironmentWizard = ({ onClose, ...props }) => {
  // ** States
  const [environmentName, setEnvironmentName] = useState(props?.currentEnvironment?.name || '')
  const [environmentDescription, setEnvironmentDescription] = useState(props?.currentEnvironment?.description || '')
  const [activeStep, setActiveStep] = useState(0)
  const [formErrors, setFormErrors] = useState({})

  const theme = useTheme()
  const session = useSession()

  // Validate Form
  const validateForm = async () => {
    try {
      // Validate the form values
      await validationSchema.validate({ environmentName, environmentDescription }, { abortEarly: false })

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

  // Handle Stepper
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
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
          name: environmentName,
          description: environmentDescription
        }

        // Update the endpoint to point to your Next.js API route
        const endpoint = `/api/inventory/environments/${props.currentEnvironment.id}`
        const response = await axios.patch(endpoint, payload, { headers })

        if (response.data) {
          const updatedEnvironment = response.data

          const updatedRows = props.rows.map(row => {
            if (row.id === updatedEnvironment.id) {
              return updatedEnvironment
            }

            return row
          })

          props.setRows(updatedRows)

          toast.success('Environment details updated successfully')

          // Call onClose to close the modal
          onClose && onClose()
        }
      } catch (error) {
        console.error('Error updating environment details', error)
        toast.error('Error updating environment details')
      }
    }
  }

  const handleReset = () => {
    setEnvironmentName(props?.currentEnvironment?.name || '')
    setEnvironmentDescription(props?.currentEnvironment?.description || '')
    setActiveStep(0)
  }

  // Handle changes to the form fields
  const handleEnvironmentNameChange = event => {
    setEnvironmentName(event.target.value)
  }

  const handleEnvironmentDescriptionChange = event => {
    setEnvironmentDescription(event.target.value)
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
            <Grid container spacing={6}>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <TextfieldStyled
                    fullWidth
                    value={environmentName.toUpperCase()}
                    onChange={handleEnvironmentNameChange}
                    label='Name'
                    error={Boolean(formErrors.environmentName)}
                    helperText={formErrors.environmentName}
                  />
                </FormControl>
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <TextfieldStyled
                    fullWidth
                    value={environmentDescription.toUpperCase()}
                    onChange={handleEnvironmentDescriptionChange}
                    label='Description'
                    error={Boolean(formErrors.environmentDescription)}
                    helperText={formErrors.environmentDescription}
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
                    Name: <strong>{environmentName.toUpperCase()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Description: <strong>{environmentDescription.toUpperCase()}</strong>
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
          <Typography>Environment details have been submitted.</Typography>
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
                  Name: <strong>{environmentName.toUpperCase()}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  Description: <strong>{environmentDescription.toUpperCase()}</strong>
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

export default UpdateEnvironmentWizard
