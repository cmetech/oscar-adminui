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
import Tooltip from '@mui/material/Tooltip'

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
    title: 'SLO Description',
    subtitle: 'Add SLO Description Information',
    description: 'Add the Name, Description, SLI Target Type for the SLO.'
  },
  {
    title: 'Define SLI Details',
    subtitle: 'Add SLI Details',
    description: 'Add the SLI Source Index, SLI Filters and Query details.'
  },
  {
    title: 'Define the Objective',
    subtitle: 'Add the Objective Details',
    description: 'Add the Time Window, Period, Budgeting Method, and Target Value for the SLO.'
  },
  {
    title: 'Review',
    subtitle: 'Review and Submit',
    description: 'Review the SLO details and submit.'
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
const stepValidationSchemas = [
  yup.object({
    sloName: yup
      .string()
      .required('SLO Name is required')
      .matches(/^[A-Za-z0-9-_]+$/, 'Only alphanumeric characters, hyphens, and underscores are allowed')
      .min(3, 'Name must be at least 3 characters')
      .trim(),
    sloDescription: yup.string().trim()
  }),
  yup.object({
    sloTargetPromql: yup
      .string()
      .required('SLO Target Prometheus Query is required')
      .matches(/^([a-zA-Z_][a-zA-Z0-9_]*)({[^}]*})?$/, 'Basic Promethues query should match following syntax metric_name{label1=val1, label2=val2, ...} or metric_name')
      .min(4, 'Prometheus Base Query must be at least 4 characters')
      .trim(),
    
  }),
  yup.object({
    sloTargetValue: yup.number().required('Target Value is required').positive('Target Value must be positive')
  }),
  yup.object() // No validation for the review step
]

const periodOptions = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 }
]

const AddSLOWizard = ({ onSuccess, ...props }) => {
  // ** States
  const [sloName, setSloName] = useState('')
  const [sloDescription, setSloDescription] = useState('')
  const [sloTargetValue, setSloTargetValue] = useState(95)
  const [sloTargetPeriod, setSloTargetPeriod] = useState(periodOptions[1])
  const [sloTimeWindow, setSloTimeWindow] = useState('rolling')
  const [sloTargetCalculationMethod, setSloTargetCalculationMethod] = useState('occurrences')
  
  const [sloTargetType, setSloTargetType] = useState('internal')
  const [sloTargetIndex, setSloTargetIndex] = useState('')
  const [sloTargetPromql, setSloTargetPromql] = useState('')
  const [sloTargetPromQlRel, setSloTargetPromQlRel] = useState('')

  const [sloFilterQuery, setSloFilterQuery] = useState('')
  const [sloGoodQuery, setSloGoodQuery] = useState('')
  const [sloTotalQuery, setSloTotalQuery] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [formErrors, setFormErrors] = useState({})
  const [, setSlos] = useAtom(slosAtom)
  const [, setRefetchTrigger] = useAtom(refetchSloTriggerAtom)

  const theme = useTheme()
  const session = useSession()

  
  // Validate form based on the active step
  const validateForm = async () => {
    try {
      // Validate based on the current step
      const currentSchema = stepValidationSchemas[activeStep]
      await currentSchema.validate(
        {
          sloName,
          sloDescription,
          sloTargetValue,
          sloTargetPeriod,
          sloTargetPromql,
          sloTargetPromQlRel
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

        var payload = null

        if (sloTargetType.toLowerCase() === 'prometheus') {
          payload = {
            name: sloName,
            description: sloDescription,
            target: {
              target_value: parseFloat(sloTargetValue),
              period: parseInt(sloTargetPeriod.value),
              calculation_method: sloTargetCalculationMethod.toLowerCase(),
              time_window: sloTimeWindow.toLowerCase(),
              target_type: sloTargetType.toLowerCase(),
              target_index: sloTargetIndex,
              filter_query: sloTargetPromQlRel,//send the promql relationship to threshhold value in filter_query field so new data model is not required
              good_query: sloTargetPromql, //send the target query in good_query field so new data model is not required
              total_query: sloTotalQuery
            }
          }

        } else {
          payload = {
            name: sloName,
            description: sloDescription,
            target: {
              target_value: parseFloat(sloTargetValue),
              period: parseInt(sloTargetPeriod.value),
              calculation_method: sloTargetCalculationMethod.toLowerCase(),
              time_window: sloTimeWindow.toLowerCase(),
              target_type: sloTargetType.toLowerCase(),
              target_index: sloTargetIndex,
              filter_query: sloFilterQuery,
              good_query: sloGoodQuery,
              total_query: sloTotalQuery
            }
          }
        }

        console.log('Payload', payload)

        // Update the endpoint to point to your Next.js API route
        const endpoint = '/api/sli'
        const response = await axios.post(endpoint, payload, { headers })

        if (response.status === 201 && response.data) {
          toast.success('SLO added successfully')
          setRefetchTrigger(Date.now())

          // Call the onSuccess callback after successful submission
          onSuccess()
        }
      } catch (error) {
        console.error('Error adding SLO', error)
        toast.error('Error adding SLO')
      }
    }
  }

  const handleReset = () => {
    setSloName('')
    setSloDescription('')
    setSloTargetValue(95)
    setSloTargetPeriod(periodOptions[1])
    setSloTargetCalculationMethod('occurrences')


    setSloTargetType('internal')
    setSloTargetIndex('')
    setSloFilterQuery('')
    setSloGoodQuery('')
    setSloTotalQuery('')
    setSloTargetPromql('')
    setSloTargetPromQlRel('')
    setSloTimeWindow('rolling')
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

  const handleTargetPeriodChange = (event, newValue) => {
    if (newValue) {
      setSloTargetPeriod(newValue)
    } else {
      // Handle case when newValue is null (clearing selection)
      setSloTargetPeriod(null)
    }
  }

  const handleTargetCalculationMethodChange = event => {
    setSloTargetCalculationMethod(event.target.value)
  }


  const handleTargetTypeChange = event => {
    setSloTargetType(event.target.value)
  }

  const handleFilterQueryChange = event => {
    setSloFilterQuery(event.target.value)
  }

  const handleTargetIndexChange = event => {
    setSloTargetIndex(event.target.value)
  }

  const handleGoodQueryChange = event => {
    setSloGoodQuery(event.target.value)
  }

  const handleSloTargetPromqlChange = event => {
    setSloTargetPromql(event.target.value)
  }

  const handleSloTargetPromQlRelChange = event => {

    setSloTargetPromQlRel(eventValue => {
      const value = event.target.value
      return getSloTargetPromQlRelSymbol(value)
    })
  }

  const handleTotalQueryChange = event => {
    setSloTotalQuery(event.target.value)
  }

  const handleTimeWindowChange = event => {
    setSloTimeWindow(event.target.value)
  }

  // Handle Confirm Password
  const handleConfirmChange = prop => event => {
    setState({ ...state, [prop]: event.target.value })
  }

  const getSloTargetPromQlRelSymbol = value => {
    switch (value) {
      case 'More than Or Equal':
        return '>=';
      case 'More Than':
        return '>';
      case 'Less Than':
        return '<';
      case 'Less Than Or Equal':
        return '<=';
      default:
        return value;
    }
  }

  const getSloTargetPromQlRelLabel = value => {
    switch (value) {
      case '>=':
        return 'More than Or Equal';
      case '>':
        return 'More Than';
      case '<':
        return 'Less Than';
      case '<=':
        return 'Less Than Or Equal';
      default:
        return value;
    }
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
              <Grid item xs={6}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='slotargettype-autocomplete'
                  options={['INTERNAL', 'ELASTIC', 'PROMETHEUS', 'GRAFANA']}
                  value={sloTargetType.toUpperCase()}
                  onChange={(event, newValue) => {
                    // Directly calling handleFormChange with a synthetic event object
                    handleTargetTypeChange({ target: { name: 'target_type', value: newValue } }, null, null)
                  }}
                  onInputChange={(event, newInputValue) => {
                    if (event) {
                      handleTargetTypeChange({ target: { name: 'target_type', value: newInputValue } }, null, null)
                    }
                  }}
                  renderInput={params => (
                    <TextfieldStyled {...params} label='Target Type' fullWidth required autoComplete='off' />
                  )}
                />
              </Grid>
            </Grid>
          </Fragment>
        )
      case 1:
        return (
          <Fragment>
            {console.log("Type SLO selected--------------> "+sloTargetType.toUpperCase()) }
            {sloTargetType.toUpperCase() == 'PROMETHEUS' ? (

            <Fragment>
              <Grid container spacing={6}>
                <Grid item sm={20} xs={30}>
                  <TextfieldStyled
                    fullWidth
                    multiline  
                    value={sloTargetPromql}
                    onChange={handleSloTargetPromqlChange}
                    label='Prometheus Query'
                    error={Boolean(formErrors.sloTargetPromql)}
                    helperText={formErrors.sloTargetPromql}
                  />
                </Grid>
                <Grid item xs={12}>
                  <AutocompleteStyled
                    freeSolo={false}
                    clearOnBlur
                    selectOnFocus
                    handleHomeEndKeys
                    id='slotargettype-autocomplete'
                    options={['More than Or Equal', 'More Than', 'Less Than', 'Less Than Or Equal']}
                    value={getSloTargetPromQlRelLabel(sloTargetPromQlRel)}
                    onChange={(event, newValue) => {
                    // Directly calling handleFormChange with a synthetic event object
                      handleSloTargetPromQlRelChange(
                        { target: { name: 'target_promql_rel', value: newValue} },
                        null,
                        null
                      )
                    }}
                    onInputChange={(event, newInputValue) => {
                      if (event) {
                        handleSloTargetPromQlRelChange({ target: { name: 'target_promql_rel', value: newInputValue } }, null, null)
                      }
                    }}
                    renderInput={params => (
                      <TextfieldStyled {...params} label='Acceptable Service Relation with Threshold' fullWidth required autoComplete='off' />
                    )}
                    />
                    
                </Grid>
                  
              </Grid>
            </Fragment>): (
              
            <Fragment>
              <Grid container spacing={6}>
                <Grid item sm={6} xs={12}>
                  <TextfieldStyled
                    fullWidth
                    value={sloTargetIndex}
                    onChange={handleTargetIndexChange}
                    label='Source Index'
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextfieldStyled
                    fullWidth
                    value={sloFilterQuery}
                    onChange={handleFilterQueryChange}
                    label='Filter Query'
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextfieldStyled fullWidth value={sloGoodQuery} onChange={handleGoodQueryChange} label='Good Query' />
                </Grid>
                <Grid item xs={12}>
                  <TextfieldStyled
                    fullWidth
                    value={sloTotalQuery}
                    onChange={handleTotalQueryChange}
                    label='Total Query'
                  />
                </Grid>
              </Grid>
            </Fragment>
            )}
          </Fragment>
        )
      case 2:
        return (
          <Fragment>
            <Grid container spacing={6}>
              <Grid item sm={6} xs={12}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='slo-timewindow'
                  options={['ROLLING', 'CALENDAR']}
                  value={sloTimeWindow.toUpperCase()}
                  onChange={(event, newValue) => {
                    // Directly calling handleFormChange with a synthetic event object
                    handleTimeWindowChange({ target: { name: 'time_window', value: newValue } }, null, null)
                  }}
                  onInputChange={(event, newInputValue) => {
                    if (event) {
                      handleTimeWindowChange({ target: { name: 'time_window', value: newInputValue } }, null, null)
                    }
                  }}
                  renderInput={params => (
                    <TextfieldStyled {...params} label='Time Window' fullWidth required autoComplete='off' />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='sloTargetPeriod-autocomplete'
                  options={periodOptions}
                  getOptionLabel={option => option.label}
                  value={sloTargetPeriod}
                  onChange={handleTargetPeriodChange}
                  renderInput={params => (
                    <TextfieldStyled {...params} label='Target Period' fullWidth required autoComplete='off' />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <TextfieldStyled
                    fullWidth
                    value={sloTargetValue}
                    onChange={handleTargetValueChange}
                    label='Target / SLO (%)'
                    error={Boolean(formErrors.sloTargetValue)}
                    helperText={formErrors.sloTargetValue}
                  />
                </FormControl>
              </Grid>
              <Grid item sm={6} xs={12}>
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
      case 3:
        return (
          <Fragment>
            {sloTargetType.toUpperCase() == 'PROMETHEUS' ? (
            <Fragment>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Review and Confirm
                </Typography>
                <Divider sx={{ my: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Name:</strong> {sloName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Description:</strong> {sloDescription}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Prometheus Base Query:</strong> {sloTargetPromql}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Acceptable Service Relationship with Threshold:</strong> {getSloTargetPromQlRelLabel(sloTargetPromQlRel)}
                </Typography>
              </Grid>   
              <Grid item xs={12}>
                <Typography>
                  <strong>Time Window:</strong> {sloTimeWindow}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Target Period:</strong> {sloTargetPeriod.label}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Target Value:</strong> {sloTargetValue}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Calculation Method:</strong> {sloTargetCalculationMethod}
                </Typography>
              </Grid>
            </Grid>
          </Fragment>

            ) : (
            <Fragment>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Review and Confirm
                </Typography>
                <Divider sx={{ my: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Name:</strong> {sloName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Description:</strong> {sloDescription}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Target Index:</strong> {sloTargetIndex}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Filter Query:</strong> {sloFilterQuery}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Good Query:</strong> {sloGoodQuery}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Total Query:</strong> {sloTotalQuery}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Time Window:</strong> {sloTimeWindow}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Target Period:</strong> {sloTargetPeriod.label}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Target Value:</strong> {sloTargetValue}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Calculation Method:</strong> {sloTargetCalculationMethod}
                </Typography>
              </Grid>
            </Grid>
          </Fragment>
            )}
          
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
                  <strong>Name:</strong> {sloName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Description:</strong> {sloDescription}
                </Typography>
              </Grid>
              {sloTargetType.toUpperCase() == 'PROMETHEUS' ? (<Grid>
                <Grid item xs={12}>
                  <Typography>
                    <strong>Prometheus Base Query:</strong> {sloTargetPromql}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    <strong>Acceptable Service Relationship with Threshold:</strong> {getSloTargetPromQlRelLabel(sloTargetPromQlRel)}
                  </Typography>
                </Grid>
              </Grid>) : (
                  <Grid>
                <Grid item xs={12}>
                  <Typography>
                    <strong>Target Index:</strong> {sloTargetIndex}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    <strong>Filter Query:</strong> {sloFilterQuery}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    <strong>Good Query:</strong> {sloGoodQuery}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    <strong>Total Query:</strong> {sloTotalQuery}
                  </Typography>
                </Grid>
              </Grid>
              )}
              
              <Grid item xs={12}>
                <Typography>
                  <strong>Time Window:</strong> {sloTimeWindow}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Target Period:</strong> {sloTargetPeriod.label}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Target Value:</strong> {sloTargetValue}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Calculation Method:</strong> {sloTargetCalculationMethod}
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
