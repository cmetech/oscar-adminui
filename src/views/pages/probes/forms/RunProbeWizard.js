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
import { useTranslation } from 'react-i18next'

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
    title: 'Prompt Information',
    subtitle: 'Enter User Inputs',
    description: 'Task requires user inputs.'
  },
  {
    title: 'Review and Submit',
    subtitle: 'Confirm the details',
    description: 'Review and submit the task.'
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
  '& .MuiOutlinedInput-root': {
    fieldset: {
      borderColor: 'inherit' // default border color
    },
    '&.Mui-focused': {
      fieldset: {
        borderColor: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main // border color when focused
      }
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

const generatePromptsValidationSchema = prompts => {
  return yup.array().of(promptSchema).min(prompts.length, 'All prompts must be provided')
}

const promptSchema = yup.object().shape({
  prompt: yup.string().required(), // Technically not validated but included for completeness
  default_value: yup.string(), // Included for completeness; validation not needed
  value: yup.string().required('Value is required') // User must provide a value or accept the default
})

const getInitialUserPromptValues = prompts => {
  return prompts.reduce((acc, prompt, index) => {
    acc[index] = prompt.default_value || ''

    return acc
  }, {})
}

const RunTaskWizard = ({ onClose, ...props }) => {
  // Destructure all props here
  const { currentTask, rows, setRows } = props
  const [activeStep, setActiveStep] = useState(0)
  const [validationErrors, setValidationErrors] = useState({})

  // ** States
  const [userPromptValues, setUserPromptValues] = useState(getInitialUserPromptValues(currentTask.prompts))

  const theme = useTheme()
  const session = useSession()
  const { t } = useTranslation()

  const validateField = async (fieldName, value) => {
    // Create a temporary object to hold the value being validated
    const tempUserPromptValues = { ...userPromptValues, [fieldName]: value }

    console.log('tempUserPromptValues', tempUserPromptValues)
    console.log('Validating Field', fieldName, value)

    // Attempt to validate the entire object with the updated field value
    try {
      await promptSchema.validateAt(fieldName, tempUserPromptValues)

      console.log(`Validation succeeded for ${fieldName}  with value ${value}`)

      // If validation succeeds, remove any existing error for this field
      setValidationErrors(prevErrors => {
        const updatedErrors = { ...prevErrors }
        delete updatedErrors[fieldName]

        return updatedErrors
      })
    } catch (error) {
      // If validation fails, update the state with the new error message for this field
      if (error instanceof yup.ValidationError) {
        setValidationErrors(prevErrors => ({
          ...prevErrors,
          [fieldName]: error.message
        }))
      }
    }
  }

  const handlePromptInputChange = (e, index) => {
    const newValues = { ...userPromptValues, [index]: e.target.value }
    setUserPromptValues(newValues)
  }

  const handleReset = () => {
    // Reset active step to the first step
    setActiveStep(0)

    // Reset user prompt values to initial state
    const initialUserPromptValues = getInitialUserPromptValues(currentTask.prompts)
    setUserPromptValues(initialUserPromptValues)

    // Optionally reset validation errors if you're tracking them
    setValidationErrors({})

    // Any other state reset you might need
  }

  // Handle Stepper
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = async () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
    if (activeStep === steps.length - 1) {
      // Assuming userPromptValues is an array of prompt values matching the structure expected by promptSchema
      const validationSchema = generatePromptsValidationSchema(currentTask.prompts)

      // Then, construct your payload as an array of objects:
      const prompts = Object.keys(userPromptValues).map(index => ({
        prompt: currentTask.prompts[index].prompt,
        default_value: currentTask.prompts[index].default_value,
        value: userPromptValues[index] // Assuming this directly holds the prompt value entered by the user
      }))

      try {
        await validationSchema.validate(prompts, { abortEarly: false })

        // Clear any previous validation errors
        setValidationErrors({})

        const apiToken = session?.data?.user?.apiToken // Assuming this is how you get the apiToken

        const headers = {
          Accept: 'application/json',
          Authorization: `Bearer ${apiToken}` // Include the bearer token in the Authorization header
        }

        // TODO: Allow for Hosts to be provided to override the default host

        // Build the payload
        const payload = currentTask.prompts.map((prompt, index) => ({
          prompt: prompt.prompt,
          default_value: prompt.default_value,
          value: userPromptValues[index] || prompt.default_value // Use the user-provided value or fallback to the default value
        }))

        console.log('Payload', payload)

        // Update the endpoint to point to your Next.js API route
        const endpoint = `/api/tasks/run/${currentTask.id}`
        const response = await axios.post(endpoint, payload, { headers })

        if (response.data) {
          toast.success('Task successfully executed')

          // Call onClose to close the modal
          onClose && onClose()
        }
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          const formattedErrors = error.inner.reduce((acc, curr) => {
            acc[curr.path] = curr.message

            return acc
          }, {})
          setValidationErrors(formattedErrors)
          console.error('Validation errors', error.inner)
        } else {
          console.error('Task failed to execute', error)
          toast.error('Error executing task')
        }
      }
    }
  }

  const handleMouseDownConfirmPassword = event => {
    event.preventDefault()
  }

  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Fragment>
            <Grid container spacing={3}>
              {currentTask.prompts.map((prompt, index) => (
                <Grid item xs={12} key={index}>
                  <Typography variant='body1' gutterBottom>
                    {prompt.prompt}
                  </Typography>
                  <TextfieldStyled
                    error={!!validationErrors[`prompts[${index}].value`]}
                    helperText={validationErrors[`prompts[${index}].value`] || ''}
                    required
                    id={`prompt-${index}`}
                    label='Value'
                    fullWidth
                    autoComplete='off'
                    defaultValue={prompt.default_value}
                    onChange={e => handlePromptInputChange(e, index)}
                    onBlur={() => validateField(`prompts[${index}].value`, userPromptValues[index] || '')}
                  />
                </Grid>
              ))}
            </Grid>
          </Fragment>
        )
      case 1:
        return (
          <Fragment>
            <Grid container spacing={3}>
              {currentTask.prompts.map((prompt, index) => (
                <Grid item xs={12} key={index}>
                  <Typography variant='body1' gutterBottom>
                    {prompt.prompt}
                  </Typography>
                  <TextfieldStyled
                    fullWidth
                    id={`prompt-review-${index}`}
                    label='Entered Value'
                    variant='outlined'
                    margin='dense'
                    InputProps={{ readOnly: true }}
                    value={userPromptValues[index] || prompt.default_value}
                  />
                </Grid>
              ))}
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
          <Typography>Task has been executed.</Typography>
          <Grid container spacing={3}>
            {currentTask.prompts.map((prompt, index) => (
              <Grid item xs={12} key={index}>
                <Typography variant='body1' gutterBottom>
                  {prompt.prompt}
                </Typography>
                <TextField
                  fullWidth
                  id={`prompt-review-${index}`}
                  label='Entered Value'
                  InputProps={{ readOnly: true }}
                  value={userPromptValues[index] || prompt.default_value}
                />
              </Grid>
            ))}
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
                {activeStep === steps.length - 1 ? 'Run' : 'Next'}
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

export default RunTaskWizard
