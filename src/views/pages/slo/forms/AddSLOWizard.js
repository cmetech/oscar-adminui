// ** React Imports
import { Fragment, useEffect, useState, useRef } from 'react'
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

// ** Translation
import { useTranslation } from 'react-i18next'

import { slosAtom, refetchSloTriggerAtom } from 'src/lib/atoms'

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
  yup.object(),
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
  const [sloTargetPeriodNumber, setSloTargetPeriodNumber] = useState('30')
  const [sloTimeWindow, setSloTimeWindow] = useState('rolling')
  const [sloTargetCalculationMethod, setSloTargetCalculationMethod] = useState('occurrences')
  const [sloTargetType, setSloTargetType] = useState('internal')
  const [prevSloTargetType, setPrevSloTargetType] = useState('internal')
  const [sloTargetIndex, setSloTargetIndex] = useState('')
  const { t } = useTranslation()
  const [sloFilterQuery, setSloFilterQuery] = useState('')
  const [sloTargetConnectionID, setSloTargetConnectionID] = useState('')
  const [sloPrevTargetConnectionID, setSloPrevTargetConnectionID] = useState('')
  const [sloConnections, setSloConnections] = useState([])
  const [connectionsLoading, setConnectionsLoading] = useState(false)
  const [specificConnectionsLoading, setSpecificConnectionsLoading] = useState(false)
  const [selectedConnectionType, setSelectedConnectionType] = useState('')
  const [sloTargetConnectionType, setSloTargetConnectionType] = useState('')
  const [sloGoodQuery, setSloGoodQuery] = useState('')
  const [goodQueryValidationMassage, setGoodQueryValidationMessage] = useState('')
  const [sloTotalQuery, setSloTotalQuery] = useState('')
  const [totalQueryValidationMassage, setTotalQueryValidationMessage] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [formErrors, setFormErrors] = useState({})
  const [, setSlos] = useAtom(slosAtom)
  const [, setRefetchTrigger] = useAtom(refetchSloTriggerAtom)
  const [isSloTargetTypeInternal, setIsSloTargetTypeInternal] = useState(false)
  const [alphahex, setAlphahex] = useState('33')

  const theme = useTheme()
  const session = useSession()

  //putting stpes as a state varible
  const [steps, setSteps] = useState([
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
  ])

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
          sloTargetPeriod
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

        if (sloTargetType.toLowerCase() === 'internal') {
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
              filter_query: sloTargetConnectionID,
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
    setSloTargetConnectionID('')
    setSloTargetConnectionType('')
    setSloGoodQuery('')
    setSloTotalQuery('')
    setGoodQueryColor('')
    setTotalQueryColor('')
    setGoodQueryValidationMessage('')
    setTotalQueryValidationMessage('')
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

  const handleTargetPeriodNumberChange = event => {
    setSloTargetPeriodNumber(event.target.value)
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

  const handleTargetConnectionIDChange = event => {
    setSloTargetConnectionID(event.target.value.toLowerCase())
  }

  const handleTargetConnectionTypeChange = event => {
    setSloTargetConnectionType(event.target.value)
  }

  const handleTargetIndexChange = event => {
    setSloTargetIndex(event.target.value)
  }

  const handleGoodQueryChange = event => {
    setSloGoodQuery(event.target.value)
  }

  const handleGoodQueryChangeSQL = event => {
    const query = event.target.value
    const singleLineQuery = query.replace(/[\n\t]/g, ' ')
    setSloGoodQuery(singleLineQuery)
  }

  const handleTotalQueryChange = event => {
    setSloTotalQuery(event.target.value)
  }

  const handleTotalQueryChangeSQL = event => {
    const query = event.target.value
    const singleLineQuery = query.replace(/[\n\t]/g, ' ')
    setSloTotalQuery(singleLineQuery)
  }

  const handleTimeWindowChange = event => {
    setSloTimeWindow(event.target.value)
  }

  const timeoutGoodQueryId = useRef(null)
  const timeoutTotalQueryId = useRef(null)

  const [goodQueryColor, setGoodQueryColor] = useState('')
  const [totalQueryColor, setTotalQueryColor] = useState('')

  const handleValidatePrometheusGoodQuery = async query => {
    try {
      if (!query.trim()) {
        setGoodQueryColor('')
        setGoodQueryValidationMessage('')

        return
      }

      const payload = {
        query: query,
        querytype: 'prometheus'
      }

      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json' // Include this if the API expects JSON
      }

      if (sloTargetConnectionID) {
        payload.connectionId = sloTargetConnectionID
      }
      if (sloTargetConnectionType) {
        payload.connectionType = sloTargetConnectionType
      }

      const response = await axios.post('/api/query', payload, { headers })

      // Validate the response structure
      if (response.data && response.data.status === 'success' && Array.isArray(response.data.data.result)) {
        if (response.data.data.result.length > 0) {
          setGoodQueryColor({
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.success.dark+alphahex: theme.palette.success.light+alphahex,
            textColor: theme.palette.text.primary // Dynamic text color based on theme
          })
          setGoodQueryValidationMessage('Query validated with results')
        } else {
          setGoodQueryColor({
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.warning.dark+alphahex: theme.palette.warning.light+alphahex,
            textColor: theme.palette.text.primary // Dynamic text color based on theme
          })
          setGoodQueryValidationMessage('Query validated with no results')
        }
      } else {
        setGoodQueryColor({
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.error.dark+alphahex: theme.palette.error.light+alphahex,
          textColor: theme.palette.text.primary // Dynamic text color based on theme
        })
        setGoodQueryValidationMessage('Unexpected response structure or response status is errored')
      }
    } catch (error) {
      setGoodQueryColor({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.error.dark+alphahex: theme.palette.error.light+alphahex,
        textColor: theme.palette.text.primary // Dynamic text color based on theme
      })
      console.error('Error sending PromQL:', error.response?.data || error.message)
      setGoodQueryValidationMessage(
        'Query validation failed with error: ' + (error.response?.data?.message || error.message)
      )
    }
  }

  const handleValidatePrometheusTotalQuery = async query => {
    try {
      if (!query.trim()) {
        setTotalQueryColor('')
        setTotalQueryValidationMessage('')

        return
      }

      const payload = {
        query: query,
        querytype: 'prometheus'
      }

      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json' // Include this if the API expects JSON
      }

      if (sloTargetConnectionID) {
        payload.connectionId = sloTargetConnectionID
      }
      if (sloTargetConnectionType) {
        payload.connectionType = sloTargetConnectionType
      }

      const response = await axios.post('/api/query', payload, { headers })

      // Validate the response structure
      if (response.data && response.data.status === 'success' && Array.isArray(response.data.data.result)) {
        if (response.data.data.result.length > 0) {
          setTotalQueryColor({
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.success.dark+alphahex: theme.palette.success.light+alphahex,
            textColor: theme.palette.text.primary // Dynamic text color based on theme
          })
          setTotalQueryValidationMessage('Query validated with results')
        } else {
          setTotalQueryColor({
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.warning.dark+alphahex: theme.palette.warning.light+alphahex,
            textColor: theme.palette.text.primary // Dynamic text color based on theme
          })
          setTotalQueryValidationMessage('Query validated with no results')
        }
      } else {
        setTotalQueryColor({
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.error.dark+alphahex: theme.palette.error.light+alphahex,
          textColor: theme.palette.text.primary // Dynamic text color based on theme
        })
        setTotalQueryValidationMessage('Unexpected response structure or response status is errored')
      }
    } catch (error) {
      setTotalQueryColor({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.error.dark+alphahex: theme.palette.error.light+alphahex,
        textColor: theme.palette.text.primary // Dynamic text color based on theme
      })
      console.error('Error sending PromQL:', error.response?.data || error.message)
      setTotalQueryValidationMessage(
        'Query validation failed with error: ' + (error.response?.data?.message || error.message)
      )
    }
  }

  const handleValidatePrometheusTotalQueryChange = async query => {}

  const handleValidateSQLGoodQuery = async query => {
    try {
      if (!query.trim()) {
        setTotalQueryColor('')
        setTotalQueryValidationMessage('')

        return
      }

      const payload = {
        query: query,
        querytype: 'sql'
      }

      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }

      if (sloTargetConnectionID) {
        payload.connectionId = sloTargetConnectionID
      }
      if (sloTargetConnectionType) {
        payload.connectionType = sloTargetConnectionType
      }

      const response = await axios.post('/api/query', payload, { headers })

      // Validate the response structure
      if (response.data && response.data.status === 'success') {
        const resultCount = response.data.data.result_count
        if (resultCount > 0) {
          setGoodQueryColor({
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.success.dark + alphahex : theme.palette.success.light + alphahex,
            textColor: theme.palette.text.primary // Dynamic text color based on theme
          })
          setGoodQueryValidationMessage('Query validated with results')
        } else if (resultCount === 0) {
            setGoodQueryColor({
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.warning.dark+alphahex: theme.palette.warning.light+alphahex,
              textColor: theme.palette.text.primary // Dynamic text color based on theme
            })
            setGoodQueryValidationMessage('Query validated with no results')
        } else {
            setGoodQueryColor({
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.error.dark+alphahex: theme.palette.error.light+alphahex,
              textColor: theme.palette.text.primary // Dynamic text color based on theme
            })
            setGoodQueryValidationMessage('Query validated with no results')
        }
      } else {
          setGoodQueryColor({
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.error.dark+alphahex: theme.palette.error.light+alphahex,
            textColor: theme.palette.text.primary // Dynamic text color based on theme
          })
          setGoodQueryValidationMessage('Unexpected response structure or response status is errored')
      }
    } catch (error) {
      setGoodQueryColor({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.error.dark+alphahex: theme.palette.error.light+alphahex,
        textColor: theme.palette.text.primary // Dynamic text color based on theme
      })
      console.error('Error sending PromQL:', error.response?.data || error.message)
      setGoodQueryValidationMessage(
        'Query validation failed with error: ' + (error.response?.data?.message || error.message)
      )
    }
  }

  const handleValidateSQLGoodQueryChange = async query => {}

  const handleValidateSQLTotalQuery = async query => {
    try {
      if (!query.trim()) {
        setTotalQueryColor('')
        setTotalQueryValidationMessage('')

        return
      }

      const payload = {
        query: query,
        querytype: 'sql'
      }

      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json' // Include this if the API expects JSON
      }

      if (sloTargetConnectionID) {
        payload.connectionId = sloTargetConnectionID
      }
      if (sloTargetConnectionType) {
        payload.connectionType = sloTargetConnectionType
      }

      const response = await axios.post('/api/query', payload, { headers })

      // Validate the response structure
      if (response.data && response.data.status === 'success') {
        const resultCount = response.data.data.result_count

        if (resultCount > 0) {
          setTotalQueryColor({
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.success.dark+alphahex: theme.palette.success.light+alphahex,
            textColor: theme.palette.text.primary // Dynamic text color based on theme
          })
          setTotalQueryValidationMessage('Query validated with results')
        } else if (resultCount === 0) {
          setTotalQueryColor({
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.warning.dark+alphahex: theme.palette.warning.light+alphahex,
            textColor: theme.palette.text.primary // Dynamic text color based on theme
          })
          setTotalQueryValidationMessage('Query validated with no results')
        } else {
          setTotalQueryColor({
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.error.dark+alphahex: theme.palette.error.light+alphahex,
            textColor: theme.palette.text.primary // Dynamic text color based on theme
          })
          setTotalQueryValidationMessage('Unexpected result count')
        }
      } else {
        setTotalQueryColor({
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.error.dark+alphahex: theme.palette.error.light+alphahex,
          textColor: theme.palette.text.primary // Dynamic text color based on theme
        })
        setTotalQueryValidationMessage('Unexpected response structure or response status is errored')
      }
    } catch (error) {
      setTotalQueryColor({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.error.dark+alphahex: theme.palette.error.light+alphahex,
        textColor: theme.palette.text.primary // Dynamic text color based on theme
      })
      console.error('Error sending PromQL:', error.response?.data || error.message)
      setTotalQueryValidationMessage(
        'Query validation failed with error: ' + (error.response?.data?.message || error.message)
      )
    }
  }

  const connectionTypeSloTargetType = {
    prometheus: ['http', 'https'],
    sql: ['mysql', 'oracle', 'postgresql', 'sqlite'],
    elasticsearch: ['elasticsearch']
  }

  const filteredConnectionIds = sloConnections
    .filter(connection => connectionTypeSloTargetType[sloTargetType.toLowerCase()]?.includes(connection.conn_type))
    .map(connection => connection.connection_id)

  console.log(filteredConnectionIds)

  // Handle Confirm Password
  const handleConfirmChange = prop => event => {
    setState({ ...state, [prop]: event.target.value })
  }

  //efect to reset all query field properties if slo-target-type is changed
  useEffect(() => {
    if (prevSloTargetType !== sloTargetType) {
      setSloGoodQuery('')
      setSloTargetConnectionID('')
      setSloTargetConnectionType('')
      setSloFilterQuery('')
      setSloTotalQuery('')
      setSloTargetIndex('')
      setGoodQueryColor('')
      setTotalQueryColor('')
      setGoodQueryValidationMessage('')
      setTotalQueryValidationMessage('')
    }

    setPrevSloTargetType(sloTargetType)
  }, [sloTargetType, prevSloTargetType])

  //effect to update step with change of SLO-Target-Type
  useEffect(() => {
    setSteps(prevSteps => {
      const updatedSteps = [...prevSteps]

      if (sloTargetType.toUpperCase() !== 'INTERNAL') {
        updatedSteps[1] = {
          title: 'Define SLI Details',
          subtitle: 'Add SLI Details with Custom Query based on Target Type',
          description:
            'Add Good Query and Total Query with Target Period in intended query language along with Optional Connection ID and Connection Type'
        }
      }

      return updatedSteps
    })
  }, [sloTargetType])

  //effect to put out color if query fileed has no text
  useEffect(() => {
    if (!sloGoodQuery.trim()) {
      setGoodQueryColor('')
      setGoodQueryValidationMessage('')

      return
    }

    if (!sloTotalQuery.trim()) {
      setTotalQueryColor('')
      setTotalQueryValidationMessage('')

      return
    }
  })

  //effect to trigger validation if query field is on focus for more than 6 seconds with no inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      if (sloTargetType.toLowerCase() === 'prometheus') {
        handleValidatePrometheusGoodQuery(sloGoodQuery)
        handleValidatePrometheusTotalQuery(sloTotalQuery)
      }

      if (sloTargetType.toLowerCase() === 'sql') {
        handleValidateSQLGoodQuery(sloGoodQuery)
        handleValidateSQLTotalQuery(sloTotalQuery)
      }
      //TO DO - ELASTICSEARCH timeout effect
      if (sloTargetType.toLowerCase() === 'elasticsearch') {
      }
    }, 6000)

    return () => {
      clearTimeout(handler) // Clear timeout if inputs change
    }
  }, [sloGoodQuery, sloTotalQuery])

  //effect to load all connectionsin order to populate target connection dropdown
  useEffect(() => {
    const fetchConnections = async () => {
      setConnectionsLoading(true)
      try {
        const response = await axios.get('/api/connections')
        setSloConnections(response.data.connections)
        console.log('Fetched connections:', response.data.connections)
      } catch (error) {
        console.error('Failed to fetch connections:', error)
        toast.error('Failed load target connections')
      } finally {
        setConnectionsLoading(false)
      }
    }
    fetchConnections()
  }, [])

  //Effect to fetch slected connection details
  useEffect(() => {
    const fetchSpecificConnections = async () => {
      console.log('Specifc Connections: ' + sloTargetConnectionID)
      if (
        !sloTargetConnectionID &&
        (sloTargetType.toLowerCase() === 'prometheus' || sloTargetType.toLowerCase() === 'sql')
      )
        return

      if (sloTargetType.toLowerCase() === 'internal') return

      setSpecificConnectionsLoading(true)
      try {
        const response = await axios.get(`/api/connections/${sloTargetConnectionID}?include_credentials=false`)
        setSelectedConnectionType(response.data.conn_type)
        console.log('Fetched connection:', response.data.conn_type)
      } catch (error) {
        console.error('Failed to fetch selectd connection details', error)
        toast.error('Failed load selected connection details')
      } finally {
        setSpecificConnectionsLoading(false)
      }
    }
    fetchSpecificConnections()
  }, [sloTargetConnectionID])

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
                  options={['INTERNAL', 'ELASTIC', 'PROMETHEUS', 'SQL']}
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
            {console.log('Type SLO selected--------------> ' + sloTargetType.toUpperCase())}
            {sloTargetType.toUpperCase() === 'PROMETHEUS' ? (
              <Fragment>
                <Grid container spacing={6}>
                  <Grid item xs={12}>
                    <AutocompleteStyled
                      freeSolo
                      clearOnBlur
                      selectOnFocus
                      handleHomeEndKeys
                      options={filteredConnectionIds.map(id => id.toUpperCase())}
                      value={sloTargetConnectionID ? sloTargetConnectionID.toUpperCase() : ' '}
                      onChange={(event, newValue) => {
                        handleTargetConnectionIDChange(
                          { target: { name: 'target_conection', value: newValue } },
                          null,
                          null
                        )
                      }}
                      onInputChange={(event, newInputValue) => {
                        if (event) {
                          handleTargetConnectionIDChange(
                            { target: { name: 'target_conection', value: newInputValue } },
                            null,
                            null
                          )
                        }
                      }}
                      renderInput={params => (
                        <TextfieldStyled {...params} label='Connection' fullWidth autoComplete='off' />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <AutocompleteStyled
                      freeSolo
                      clearOnBlur
                      selectOnFocus
                      handleHomeEndKeys
                      options={sloTargetConnectionID ? [selectedConnectionType] : []}
                      value={sloTargetConnectionType ? sloTargetConnectionType : ''}
                      onChange={(event, newValue) => {
                        handleTargetConnectionTypeChange(
                          { target: { name: 'target_type', value: newValue } },
                          null,
                          null
                        )
                      }}
                      onInputChange={(event, newInputValue) => {
                        if (event) {
                          handleTargetConnectionTypeChange(
                            { target: { name: 'target_type', value: newInputValue } },
                            null,
                            null
                          )
                        }
                      }}
                      renderInput={params => (
                        <TextfieldStyled {...params} label='Connection Type' fullWidth autoComplete='off' />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextfieldStyled
                      fullWidth
                      value={sloGoodQuery}
                      onChange={handleGoodQueryChange}
                      onBlur={() => handleValidatePrometheusGoodQuery(sloGoodQuery)}
                      label='Good Query Prometheus'
                      sx={{
                        backgroundColor: goodQueryColor?.backgroundColor || 'inherit',
                        color: goodQueryColor?.textColor || 'inherit',
                        borderRadius: '8px', // Ensure rounded corners
                        boxShadow: theme.shadows[1],
                        '&:focus': {
                          outline: 'none',
                          boxShadow: theme.shadows[3]
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextfieldStyled
                      fullWidth
                      value={sloTotalQuery}
                      onChange={handleTotalQueryChange}
                      onBlur={() => handleValidatePrometheusTotalQuery(sloTotalQuery)}
                      label='Total Query Prometheus'
                      sx={{
                        backgroundColor: totalQueryColor?.backgroundColor || 'inherit',
                        color: totalQueryColor?.textColor || 'inherit',
                        borderRadius: '8px',
                        boxShadow: theme.shadows[1],
                        '&:focus': {
                          outline: 'none',
                          boxShadow: theme.shadows[3]
                        }
                      }}
                    />
                  </Grid>
                  {/*<Grid item sm={6} xs={12}>
                  <TextfieldStyled
                    fullWidth
                    value={sloTargetPeriodNumber}
                    onChange={handleTargetPeriodNumberChange}
                    label='Target Period in Days From Provided Query for Calculation'
                  />
                </Grid>*/}
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
                </Grid>
              </Fragment>
            ) : sloTargetType.toUpperCase() === 'ELASTICSEARCH' ? (
              <Fragment>
                <Grid container spacing={6}>
                  <Grid item sm={6} xs={12}>
                    <TextfieldStyled
                      fullWidth
                      value={sloTargetIndex}
                      onChange={e => {
                        handleTargetIndexChange(e)
                        handleTargetConnectionIDChange(e)
                      }}
                      label='Source Index Elastic Search'
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <AutocompleteStyled
                      freeSolo
                      clearOnBlur
                      selectOnFocus
                      handleHomeEndKeys
                      options={sloTargetConnectionID ? ['ELASTICSEARCH'] : []}
                      value={sloTargetConnectionType ? sloTargetConnectionType : ''}
                      onChange={(event, newValue) => {
                        handleTargetConnectionTypeChange(
                          { target: { name: 'target_type', value: newValue } },
                          null,
                          null
                        )
                      }}
                      onInputChange={(event, newInputValue) => {
                        if (event) {
                          handleTargetConnectionTypeChange(
                            { target: { name: 'target_type', value: newInputValue } },
                            null,
                            null
                          )
                        }
                      }}
                      renderInput={params => (
                        <TextfieldStyled {...params} label='Source Type' fullWidth autoComplete='off' />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextfieldStyled
                      fullWidth
                      value={sloFilterQuery}
                      onChange={handleFilterQueryChange}
                      label='Filter Query Elastic Search'
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextfieldStyled
                      fullWidth
                      value={sloGoodQuery}
                      onChange={handleGoodQueryChange}
                      label='Good Query'
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextfieldStyled
                      fullWidth
                      value={sloTotalQuery}
                      onChange={handleTotalQueryChange}
                      label='Total Query Elastic Search'
                    />
                  </Grid>
                  {/*<Grid item sm={6} xs={12}>
                  <TextfieldStyled
                    fullWidth
                    value={sloTargetPeriodNumber}
                    onChange={handleTargetPeriodNumberChange}
                    label='Target Period in Days From Provided Query for Calculation'
                  />
                </Grid>*/}
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
                </Grid>
              </Fragment>
            ) : sloTargetType.toUpperCase() === 'SQL' ? (
              <Fragment>
                <Grid container spacing={6}>
                  <Grid item xs={12}>
                    <AutocompleteStyled
                      freeSolo
                      clearOnBlur
                      selectOnFocus
                      handleHomeEndKeys
                      options={filteredConnectionIds.map(id => id.toUpperCase())}
                      value={sloTargetConnectionID ? sloTargetConnectionID.toUpperCase() : ' '}
                      onChange={(event, newValue) => {
                        handleTargetConnectionIDChange(
                          { target: { name: 'target_conection', value: newValue } },
                          null,
                          null
                        )
                      }}
                      onInputChange={(event, newInputValue) => {
                        if (event) {
                          handleTargetConnectionIDChange(
                            { target: { name: 'target_conection', value: newInputValue } },
                            null,
                            null
                          )
                        }
                      }}
                      renderInput={params => (
                        <TextfieldStyled {...params} label='Connection' fullWidth autoComplete='off' />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <AutocompleteStyled
                      freeSolo
                      clearOnBlur
                      selectOnFocus
                      handleHomeEndKeys
                      options={sloTargetConnectionID ? [selectedConnectionType] : []}
                      value={sloTargetConnectionType ? sloTargetConnectionType : ''}
                      onChange={(event, newValue) => {
                        handleTargetConnectionTypeChange(
                          { target: { name: 'target_type', value: newValue } },
                          null,
                          null
                        )
                      }}
                      onInputChange={(event, newInputValue) => {
                        if (event) {
                          handleTargetConnectionTypeChange(
                            { target: { name: 'target_type', value: newInputValue } },
                            null,
                            null
                          )
                        }
                      }}
                      renderInput={params => (
                        <TextfieldStyled {...params} label='Connection Type' fullWidth autoComplete='off' />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextfieldStyled
                      fullWidth
                      value={sloGoodQuery}
                      onChange={handleGoodQueryChange}
                      onBlur={() => handleValidateSQLGoodQuery(sloGoodQuery)}
                      label='Good Query SQL'
                      margin='normal'
                      multiline
                      rows={4}
                      sx={{
                        backgroundColor: goodQueryColor?.backgroundColor || 'inherit',
                        color: goodQueryColor?.textColor || 'inherit',
                        borderRadius: '8px', // Ensure rounded corners
                        boxShadow: theme.shadows[1],
                        '&:focus': {
                          outline: 'none',
                          boxShadow: theme.shadows[3]
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextfieldStyled
                      fullWidth
                      value={sloTotalQuery}
                      onChange={handleTotalQueryChange}
                      onBlur={() => handleValidateSQLTotalQuery(sloTotalQuery)}
                      label='Total Query SQL'
                      margin='normal'
                      multiline
                      rows={4}
                      sx={{
                        backgroundColor: totalQueryColor?.backgroundColor || 'inherit',
                        color: totalQueryColor?.textColor || 'inherit',
                        borderRadius: '8px',
                        boxShadow: theme.shadows[1],
                        '&:focus': {
                          outline: 'none',
                          boxShadow: theme.shadows[3]
                        }
                      }}
                    />
                  </Grid>
                  {/*<Grid item sm={6} xs={12}>
                  <TextfieldStyled
                    fullWidth
                    value={sloTargetPeriodNumber}
                    onChange={handleTargetPeriodNumberChange}
                    label='Target Period in Days From Provided Query for Calculation'
                  />
                </Grid>*/}
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
                </Grid>
              </Fragment>
            ) : (
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
                    <TextfieldStyled
                      fullWidth
                      value={sloGoodQuery}
                      onChange={handleGoodQueryChange}
                      label='Good Query'
                    />
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

              {sloTargetType.toUpperCase() === 'INTERNAL' ? (
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
              ) : (
                <></>
              )}

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
              {sloTargetType.toUpperCase() === 'PROMETHEUS' ? (
                <Fragment>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>Selected Connection:</strong> {sloTargetConnectionID}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>Prometheus Good Query:</strong> {sloGoodQuery}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>Prometheus Total Query:</strong> {sloTotalQuery}
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
                </Fragment>
              ) : sloTargetType.toUpperCase() === 'SQL' ? (
                <Fragment>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>Selected Connection:</strong> {sloTargetConnectionID}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>SQL Good Query:</strong> {sloGoodQuery}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>SQL Total Query:</strong> {sloTotalQuery}
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
                </Fragment>
              ) : (
                <Fragment>
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
                </Fragment>
              )}

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
