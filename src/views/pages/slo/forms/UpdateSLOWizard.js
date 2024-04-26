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

import { slosAtom, refetchSloTriggerAtom } from 'src/lib/atoms'

const steps = [
  {
    title: 'SLO Information',
    subtitle: 'Add SLO Information',
    description: 'Add the Name, Description, and Target Details for the SLO.'
  },
  {
    title: 'Review',
    subtitle: 'Review and Submit',
    description: 'Review the SLO details and submit.'
  }
]

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
  sloName: yup
    .string()
    .required('SLO Name is required')
    .matches(/^[A-Za-z0-9-_]+$/, 'Only alphanumeric characters, hyphens, underscores are allowed')
    .min(3, 'Name must be at least 3 characters')
    .trim(),
  sloDescription: yup.string().trim(),
  sloTargetValue: yup.number().required('Target Value is required').positive('Target Value must be positive'),
  sloTargetPeriod: yup
    .number()
    .required('Target Period is required')
    .positive('Target Period must be positive')
    .integer('Target Period must be an integer')
})

const AddSLOWizard = ({ onClose, ...props }) => {
  // ** States
  const [sloName, setSloName] = useState(props?.currentSlo?.name || '')
  const [sloDescription, setSloDescription] = useState(props?.currentSlo?.description || '')
  const [sloTargetValue, setSloTargetValue] = useState(props?.currentSlo?.target?.target_value || 0)
  const [sloTargetPeriod, setSloTargetPeriod] = useState(props?.currentSlo?.target?.period || 0)
  const [sloTargetCalculationMethod, setSloTargetCalculationMethod] = useState(
    props?.currentSlo?.target?.calculation_method || 'occurrences'
  )
  const [activeStep, setActiveStep] = useState(0)
  const [formErrors, setFormErrors] = useState({})
  const [, setSlos] = useAtom(slosAtom)
  const [, setRefetchTrigger] = useAtom(refetchSloTriggerAtom)

  const theme = useTheme()
  const session = useSession()

  // Validate Form
  const validateForm = async () => {
    try {
      // Validate the form values
      await validationSchema.validate(
        { sloName, sloDescription, sloTargetValue, sloTargetPeriod },
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
        const headers = {
          Accept: 'application/json'
        }

        const payload = {
          name: sloName,
          description: sloDescription,
          target: {
            target_value: parseFloat(sloTargetValue),
            period: parseInt(sloTargetPeriod),
            calculation_method: sloTargetCalculationMethod.toLowerCase()
          }
        }

        // Update the endpoint to point to your Next.js API route
        const endpoint = `/api/sli/${props.currentSlo.id}`
        const response = await axios.put(endpoint, payload, { headers })

        if (response.status === 200 && response.data) {
          const updatedSlo = response.data

          const updatedSlos = props.rows.map(slo => {
            if (slo.id === updatedSlo.id) {
              return updatedSlo
            }

            return slo
          })

          props.setRows(updatedSlos)

          toast.success('SLO details updated successfully')

          // Call onClose to close the modal
          onClose && onClose()
        }
      } catch (error) {
        console.error('Error updating SLO details', error)
        toast.error('Error updating SLO details')
      }
    }
  }

  const handleReset = () => {
    setSloName(props?.currentSlo?.name || '')
    setSloDescription(props?.currentSlo?.description || '')
    setSloTargetValue(props?.currentSlo?.target?.target_value || 0)
    setSloTargetPeriod(props?.currentSlo?.target?.period || 0)
    setSloTargetCalculationMethod(props?.currentSlo?.target?.calculation_method || 'occurrences')
    setActiveStep(0)
  }

  // Handle changes to the form fields
  const handleSloNameChange = event => {
    setSloName(event.target.value)
  }

  const handleSloDescriptionChange = event => {
    setSloDescription(event.target.value)
  }

  const handleTargetValueChange = event => {
    setSloTargetValue(event.target.value)
  }

  const handleTargetPeriodChange = event => {
    setSloTargetPeriod(event.target.value)
  }

  const handleTargetCalculationMethodChange = event => {
    setSloTargetCalculationMethod(event.target.value)
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
                    value={sloName.toUpperCase()}
                    onChange={handleSloNameChange}
                    label='Name'
                    error={Boolean(formErrors.sloName)}
                    helperText={formErrors.sloName}
                  />
                </FormControl>
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <TextfieldStyled
                    fullWidth
                    value={sloDescription.toUpperCase()}
                    onChange={handleSloDescriptionChange}
                    label='Description'
                    error={Boolean(formErrors.sloDescription)}
                    helperText={formErrors.sloDescription}
                  />
                </FormControl>
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <TextfieldStyled
                    fullWidth
                    value={sloTargetValue}
                    onChange={handleTargetValueChange}
                    label='Target Value'
                    error={Boolean(formErrors.sloTargetValue)}
                    helperText={formErrors.sloTargetValue}
                  />
                </FormControl>
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <TextfieldStyled
                    fullWidth
                    value={sloTargetPeriod}
                    onChange={handleTargetPeriodChange}
                    label='Target Period'
                    error={Boolean(formErrors.sloTargetPeriod)}
                    helperText={formErrors.sloTargetPeriod}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='slo-autocomplete'
                  options={['OCCURRENCES', 'TIMESLICE']}
                  value={sloTargetCalculationMethod.toUpperCase()}
                  onChange={(event, newValue) => {
                    // Directly calling handleFormChange with a synthetic event object
                    handleTargetCalculationMethodChange(
                      { target: { name: 'target_method', value: newValue } },
                      null,
                      null
                    )
                  }}
                  onInputChange={(event, newInputValue) => {
                    if (event) {
                      handleTargetCalculationMethodChange(
                        { target: { name: 'target_method', value: newInputValue } },
                        null,
                        null
                      )
                    }
                  }}
                  renderInput={params => (
                    <TextfieldStyled {...params} label='Target Method' fullWidth required autoComplete='off' />
                  )}
                />
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
                    Name: <strong>{sloName.toUpperCase()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Description: <strong>{sloDescription.toUpperCase()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Target Value: <strong>{sloTargetValue.toString()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Target Period: <strong>{sloTargetPeriod.toString()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Target Method: <strong>{sloTargetCalculationMethod.toUpperCase()}</strong>
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
          <Typography>SLO details have been submitted.</Typography>
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
                  Name: <strong>{sloName.toUpperCase()}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  Description: <strong>{sloDescription.toUpperCase()}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  Target Value: <strong>{sloTargetValue.toString()}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  Target Period: <strong>{sloTargetPeriod.toString()}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  Target Method: <strong>{sloTargetCalculationMethod.toUpperCase()}</strong>
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

export default AddSLOWizard
