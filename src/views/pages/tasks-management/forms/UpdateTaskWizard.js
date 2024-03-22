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
import { Cron } from 'react-js-cron'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import StepperCustomDot from 'src/views/pages/misc/forms/StepperCustomDot'
import { useTheme, styled } from '@mui/material/styles'
import { refetchTaskTriggerAtom } from 'src/lib/atoms'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Styled Component
import StepperWrapper from 'src/@core/styles/mui/stepper'

// ** Import yup for form validation
import * as yup from 'yup'
import { current } from '@reduxjs/toolkit'

// Define initial state for the server form
const initialTaskFormState = {
  name: '',
  type: '',
  status: 'enabled',
  owner: '',
  organization: '',
  description: '',
  schedule: {
    year: '',
    month: '',
    day: '',
    day_of_week: '',
    hour: '',
    minute: '',
    second: '',
    start_date: '',
    end_date: '',
    timezone: '',
    jitter: 0
  },
  args: [{ value: '' }],
  kwargs: [{ key: '', value: '' }],
  metadata: [{ key: '', value: '' }],
  prompts: [{ prompt: '', default_value: '', value: '' }],
  hosts: [{ ip_address: '' }],
  datacenter: '',
  environments: [],
  components: []
}

const steps = [
  {
    title: 'General',
    subtitle: 'Information',
    description: 'Edit the Task details.'
  },
  {
    title: 'Schedule',
    subtitle: 'Details',
    description: 'Edit the Schedule details.'
  },
  {
    title: 'Arguments',
    subtitle: 'Positional',
    description: 'Edit the Task Positional and Keyword Argument details.'
  },
  {
    title: 'Metadata',
    subtitle: 'Information',
    description: 'Edit the Task Metadata Arguments details.'
  },
  {
    title: 'Prompts',
    subtitle: 'Details',
    description: 'Edit the Prompts details.'
  },
  {
    title: 'Targets',
    subtitle: 'Remote Host Information',
    description: 'Provide the Host target details.'
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

const ReviewAndSubmitSection = ({ taskForm }) => {
  const renderGeneralSection = taskForm => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
          General Information
        </Typography>
      </Grid>
      {/* List all general fields here */}
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Task Name'
          value={taskForm.name || 'N/A'}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Task Type'
          value={taskForm.type || 'N/A'}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Owner'
          value={taskForm.owner || 'N/A'}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Organization'
          value={taskForm.organization || 'N/A'}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12}>
        <TextfieldStyled
          fullWidth
          label='Description'
          value={taskForm.description || 'N/A'}
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

  const renderArgsSection = args => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
          Positional Arguments
        </Typography>
      </Grid>
      {args.map((arg, index) => (
        <Grid item xs={6} key={`arg-${index}`}>
          <TextfieldStyled
            fullWidth
            label={`Arg ${index + 1}`}
            value={arg.value ? arg.value.toString() : 'N/A'}
            InputProps={{ readOnly: true }}
            variant='outlined'
            margin='normal'
          />
        </Grid>
      ))}
    </Grid>
  )

  const renderPromptsSection = prompts => (
    <Fragment>
      <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
        Prompts
      </Typography>
      {prompts.map((prompt, index) => (
        <Grid container spacing={2} key={`prompt-${index}`}>
          <Grid item xs={12} sm={6}>
            <TextfieldStyled
              fullWidth
              label='Prompt'
              value={prompt.prompt || 'N/A'}
              InputProps={{ readOnly: true }}
              variant='outlined'
              margin='normal'
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextfieldStyled
              fullWidth
              label='Default Value'
              value={prompt.default_value || 'N/A'}
              InputProps={{ readOnly: true }}
              variant='outlined'
              margin='normal'
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextfieldStyled
              fullWidth
              label='Value'
              value={prompt.value || 'N/A'}
              InputProps={{ readOnly: true }}
              variant='outlined'
              margin='normal'
            />
          </Grid>
        </Grid>
      ))}
    </Fragment>
  )

  const renderHostSection = hosts => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
          Hosts
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Datacenter'
          value={taskForm.datacenter || 'N/A'}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Environments'
          value={taskForm.environments.join(', ') || 'N/A'} // Join the array values into a string
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Components'
          value={taskForm.components.join(', ') || 'N/A'} // Join the array values into a string
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      {hosts.map((host, index) => (
        <Grid item xs={6} key={`arg-${index}`}>
          <TextfieldStyled
            fullWidth
            label={`Host ${index + 1}`}
            value={host.ip_address ? host.ip_address.toString() : 'N/A'}
            InputProps={{ readOnly: true }}
            variant='outlined'
            margin='normal'
          />
        </Grid>
      ))}
    </Grid>
  )

  return (
    <Fragment>
      {renderGeneralSection(taskForm)}
      {taskForm.args && renderArgsSection(taskForm.args)}
      {taskForm.kwargs && <Section title='Keyword Arguments' data={taskForm.kwargs} />}
      {taskForm.prompts && renderPromptsSection(taskForm.prompts)}
      {taskForm.metadata && <Section title='Metadata' data={taskForm.metadata} />}
      {taskForm.hosts && renderHostSection(taskForm.hosts)}
    </Fragment>
  )
}

// Replace 'defaultBorderColor' and 'hoverBorderColor' with actual color values
// FIXME: Need to fix the Schedule section, so user can enter in schedule details
// FIXME: Need to first update the config [DONE], then if successful, re-register the task [DONE], and schedule

const UpdateTaskWizard = ({ onClose, ...props }) => {
  // Destructure all props here
  const { currentTask, rows, setRows } = props

  // ** States
  const [taskForm, setTaskForm] = useState(initialTaskFormState)
  const [activeStep, setActiveStep] = useState(0)
  const [resetFormFields, setResetFormFields] = useState(false)
  const [components, setComponents] = useState([])
  const [datacenters, setDatacenters] = useState([])
  const [environments, setEnvironments] = useState([])
  const [selectedDatacenter, setSelectedDatacenter] = useState('')
  const [selectedEnvironments, setSelectedEnvironments] = useState([])
  const [selectedComponents, setSelectedComponents] = useState([])
  const [cronValue, setCronValue] = useState('')
  const [cronError, setCronError] = useState()
  const [, setRefetchTrigger] = useAtom(refetchTaskTriggerAtom)

  const theme = useTheme()
  const session = useSession()

  // Use useEffect to initialize the form with currentServer data
  useEffect(() => {
    // Check if currentTask exists and is not empty
    if (currentTask && Object.keys(currentTask).length > 0) {
      const { schedule = {} } = currentTask

      // Destructuring to exclude fields you don't need, rest will contain only needed fields
      const { id, task_id, created_at, modified_at, ...scheduleFields } = schedule

      // Dynamically filter out undefined, null, or empty string values from scheduleFields
      const filteredScheduleFields = Object.entries(scheduleFields).reduce((acc, [key, value]) => {
        if (value || typeof value === 'number') {
          // Including '0' as a valid value
          acc[key] = value
        }

        return acc
      }, {})

      const updatedTaskForm = {
        ...initialTaskFormState,
        name: currentTask.name || '',
        type: currentTask.type || '',
        status: currentTask.status || 'enabled',
        owner: currentTask.owner || '',
        organization: currentTask.organization || '',
        description: currentTask.description || '',
        schedule: filteredScheduleFields,
        args: currentTask.args?.map(arg => ({ value: arg })) || [],
        kwargs: Object.entries(currentTask.kwargs || {}).map(([key, value]) => ({ key, value })),
        prompts: currentTask.prompts || [{ prompt: '', default_value: '', value: '' }],
        metadata: Object.entries(currentTask.metadata || {}).map(([key, value]) => ({ key, value })),
        hosts: currentTask.hosts?.map(host => ({ ip_address: host })) || [],
        datacenter: currentTask.datacenter || '',
        environments: currentTask.environments?.map(environment => ({ value: environment })) || [],
        components: currentTask.components?.map(component => ({ value: component })) || []
      }
      setTaskForm(updatedTaskForm)
    }
  }, [currentTask])

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

    // fetchEnviroments()
    // fetchComponents()
  }, []) // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    // Fetch environments based on selected datacenter
    const fetchEnvironments = async () => {
      if (taskForm.datacenter) {
        const response = await axios.get(`/api/inventory/environments?datacenter_name=${taskForm.datacenter}`)
        const data = response.data.rows
        const environmentNames = data.map(env => env.name.toUpperCase())
        setEnvironments(environmentNames)
      }
    }
    fetchEnvironments()
  }, [taskForm.datacenter])

  useEffect(() => {
    // Fetch components based on selected environment
    const fetchComponents = async () => {
      if (taskForm.environments.length > 0) {
        const response = await axios.get('/api/inventory/components')
        const data = response.data.rows

        // Iterate over the data array and extract the name value from each object
        const componentNames = data.map(component => component.name.toUpperCase())
        setComponents(componentNames)
      }
    }
    fetchComponents()
  }, [taskForm.environments])

  // Function to handle form field changes
  // Function to handle form field changes for dynamic sections

  const handleFormChange = (event, index, section) => {
    // Handling both synthetic events and direct value assignments from Autocomplete
    const target = event.target || event
    const name = target.name
    let value = target.value

    setTaskForm(prevForm => {
      const newForm = { ...prevForm }

      if (section) {
        // Clone the array to avoid direct state mutation
        const updatedSection = [...newForm[section]]

        // Determine how to update based on the section type
        if (['args', 'hosts'].includes(section)) {
          // Sections with single value entries
          updatedSection[index] = { ...updatedSection[index], [name]: value }
        } else if (['kwargs', 'metadata', 'prompts'].includes(section)) {
          // Sections with key-value pairs (or additional fields for 'prompts')
          updatedSection[index] = { ...updatedSection[index], [name]: value }
        }

        newForm[section] = updatedSection
      } else {
        // Directly update top-level fields or handle nested updates
        if (name.includes('.')) {
          // Nested object updates, e.g., "schedule.year"
          const keys = name.split('.')
          newForm[keys[0]] = {
            ...newForm[keys[0]],
            [keys[1]]: value
          }
        } else {
          // Top-level field updates
          newForm[name] = value
        }
      }

      return newForm
    })
  }

  // Function to add a new entry to a dynamic section
  // Function to add a new entry to a dynamic section
  const addSectionEntry = section => {
    let newEntry
    switch (section) {
      case 'kwargs':
      case 'metadata':
        newEntry = { key: '', value: '' }
        break
      case 'args':
        newEntry = { value: '' }
      case 'hosts':
        newEntry = { ip_address: '' } // Adjust if your hosts have a different structure
        break
      case 'prompts':
        newEntry = { prompt: '', default_value: '', value: '' }
        break
      default:
        newEntry = {} // Default case, should not be reached
    }

    const updatedSection = [...taskForm[section], newEntry]
    setTaskForm({ ...taskForm, [section]: updatedSection })
  }

  // Function to remove an entry from a dynamic section
  // Function to remove an entry from a dynamic section
  const removeSectionEntry = (section, index) => {
    const updatedSection = [...taskForm[section]]
    updatedSection.splice(index, 1)
    setTaskForm({ ...taskForm, [section]: updatedSection })
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
          ...taskForm,
          args: taskForm.args.map(arg => arg.value),
          hosts: taskForm.hosts.map(host => host.ip_address),
          kwargs: Object.fromEntries(taskForm.kwargs.map(({ key, value }) => [key, value])),
          metadata: Object.fromEntries(taskForm.metadata.map(({ key, value }) => [key, value]))
        }

        // console.log('Payload:', payload)

        // Update the endpoint to point to your Next.js API route
        const endpoint = `/api/tasks/config/${currentTask.name}`
        const response = await axios.post(endpoint, payload, { headers })

        if (response.data) {
          const { task_name } = response.data

          if (task_name) {
            console.log('Task configuration successfully updated for ', task_name)

            // Register Task
            const registerTaskEndpoint = `/api/tasks/register/${task_name}`
            const registerTaskResponse = await axios.post(registerTaskEndpoint, {}, { headers })

            if (registerTaskResponse.data) {
              // Trigger a refetch of the tasks list

              console.log('Task successfully configured and registered')
              toast.success('Task successfully configured and registered')

              setRefetchTrigger(Date.now())
            } else {
              console.error('Failed to register task, configuration updated successfully')
              toast.error('Failed to register task, configuration updated successfully')
            }
          } else {
            console.error('Failed to update task configuration')
            toast.error('Failed to update task configuration')
          }

          // Call onClose to close the modal
          onClose && onClose()
        }
      } catch (error) {
        console.error('Error updating task details', error)
        toast.error('Error updating task details')
      }
    }
  }

  const handleReset = () => {
    if (currentTask && Object.keys(currentTask).length > 0) {
      const resetTaskForm = {
        ...initialTaskFormState,
        name: currentTask.name || '',
        type: currentTask.type || '',
        status: currentTask.status || 'enabled',
        owner: currentTask.owner || '',
        organization: currentTask.organization || '',
        description: currentTask.description || '',
        schedule: currentTask.schedule || initialTaskFormState.schedule,
        args: currentTask.args.map(arg => ({ value: arg })) || [],
        kwargs: Object.entries(currentTask.kwargs || {}).map(([key, value]) => ({ key, value })),
        prompts: currentTask.prompts || [{ prompt: '', default_value: '', value: '' }],
        metadata: Object.entries(currentTask.metadata || {}).map(([key, value]) => ({ key, value })),
        hosts: currentTask.hosts.map(host => ({ ip_address: host })) || [],
        datacenter: currentTask.datacenter || '',
        environments: currentTask.environments.map(environment => ({ value: environment })) || [],
        components: currentTask.components.map(component => ({ value: component })) || []
      }
      setTaskForm(resetTaskForm)
    } else {
      setTaskForm(initialTaskFormState) // Fallback to initial state if currentServer is not available
    }
    setResetFormFields(false)
    setActiveStep(0)
  }

  const renderDynamicFormSection = section => {
    // Determine field labels based on section type
    const getFieldLabels = section => {
      switch (section) {
        case 'kwargs':
        case 'metadata':
          return { keyLabel: 'Key', valueLabel: 'Value' }
        case 'args':
          return { valueLabel: 'Value' }
        case 'hosts':
          return { valueLabel: 'IP Address' }
        case 'prompts':
          return { keyLabel: 'Prompt', valueLabel: 'Value', defaultValueLabel: 'Default Value' }
        default:
          return { keyLabel: 'Key', valueLabel: 'Value' }
      }
    }

    const { keyLabel, valueLabel, defaultValueLabel } = getFieldLabels(section)

    // console.log('taskForm:', taskForm)
    // console.log('section:', section)
    // console.log('keyLabel:', keyLabel)
    // console.log('valueLabel:', valueLabel)
    // console.log('defaultValueLabel:', defaultValueLabel)

    return taskForm[section].map((entry, index) => (
      <Box key={`${index}-${resetFormFields}`} sx={{ marginBottom: 1 }}>
        <Grid container spacing={3} alignItems='center'>
          {['kwargs', 'metadata'].includes(section) && (
            <Grid item xs={4}>
              <TextfieldStyled
                key={`key-${section}-${index}`}
                fullWidth
                label={keyLabel}
                name='key'
                value={entry.key?.toUpperCase() || ''}
                onChange={e => handleFormChange(e, index, section)}
                variant='outlined'
                margin='normal'
              />
            </Grid>
          )}
          {['kwargs', 'metadata', 'args'].includes(section) && (
            <Grid item xs={['kwargs', 'metadata'].includes(section) ? 4 : 6}>
              <TextfieldStyled
                key={`value-${section}-${index}`}
                fullWidth
                label={valueLabel}
                name='value'
                value={entry.value?.toUpperCase() || ''}
                onChange={e => handleFormChange(e, index, section)}
                variant='outlined'
                margin='normal'
              />
            </Grid>
          )}
          {section === 'prompts' && (
            <Fragment>
              <Grid item xs={4}>
                <TextfieldStyled
                  key={`key-${section}-${index}`}
                  fullWidth
                  label={keyLabel}
                  name='prompt'
                  value={entry.prompt?.toUpperCase() || ''}
                  onChange={e => handleFormChange(e, index, section)}
                  variant='outlined'
                  margin='normal'
                />
              </Grid>
              <Grid item xs={3}>
                <TextfieldStyled
                  key={`value-${section}-${index}`}
                  fullWidth
                  label={valueLabel}
                  name='value'
                  value={entry.value?.toUpperCase() || ''}
                  onChange={e => handleFormChange(e, index, section)}
                  variant='outlined'
                  margin='normal'
                />
              </Grid>
              <Grid item xs={3}>
                <TextfieldStyled
                  key={`defaultValue-${section}-${index}`}
                  fullWidth
                  label={defaultValueLabel}
                  name='default_value'
                  value={entry.default_value?.toUpperCase() || ''}
                  onChange={e => handleFormChange(e, index, section)}
                  variant='outlined'
                  margin='normal'
                />
              </Grid>
            </Fragment>
          )}
          {section === 'hosts' && (
            <Grid item xs={8}>
              <TextfieldStyled
                key={`ipAddress-${section}-${index}`}
                fullWidth
                label={valueLabel}
                name='ip_address'
                value={entry.ip_address || ''} // Ensure you're using the correct property name here
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
            {taskForm[section].length > 1 && (
              <IconButton onClick={() => removeSectionEntry(section, index)} color='secondary'>
                <Icon icon='mdi:minus-circle-outline' />
              </IconButton>
            )}
          </Grid>
        </Grid>
      </Box>
    ))
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
              Task Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextfieldStyled
                  required
                  id='name'
                  name='name'
                  label='Task Name'
                  fullWidth
                  autoComplete='off'
                  value={taskForm.name.toUpperCase()}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='tasktype-autocomplete'
                  options={['INVOKE', 'FABRIC', 'RUNBOOK', 'SCRIPT']}
                  value={taskForm.type.toUpperCase()}
                  onChange={(event, newValue) => {
                    // Directly calling handleFormChange with a synthetic event object
                    handleFormChange({ target: { name: 'type', value: newValue } }, null, null)
                  }}
                  onInputChange={(event, newInputValue) => {
                    if (event) {
                      handleFormChange({ target: { name: 'type', value: newInputValue } }, null, null)
                    }
                  }}
                  renderInput={params => (
                    <TextfieldStyled {...params} label='Task Type' fullWidth required autoComplete='off' />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextfieldStyled
                  required
                  id='owner'
                  name='owner'
                  label='Task Owner'
                  fullWidth
                  autoComplete='off'
                  value={taskForm.owner}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextfieldStyled
                  required
                  id='organization'
                  name='organization'
                  label='Organization'
                  fullWidth
                  autoComplete='off'
                  value={taskForm.organization}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextfieldStyled
                  fullWidth
                  label='Description'
                  name='description'
                  autocomplete='off'
                  value={taskForm.description || 'N/A'}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={6}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='taskstatus-autocomplete'
                  options={['ENABLED', 'DISABLED']}
                  value={taskForm.status.toUpperCase()}
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
                    <TextfieldStyled {...params} label='Task Status' fullWidth required autoComplete='off' />
                  )}
                />
              </Grid>
            </Grid>
          </Fragment>
        )
      case 1:
        return (
          <Fragment>
            <Typography variant='h6' gutterBottom>
              Schedule Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <div>
                  <Cron
                    value={cronValue}
                    onChange={setCronValue}
                    onError={cronError}
                    className='oscar-cron'
                    clearButtonProps={{
                      type: 'default'
                    }}
                  />
                </div>
              </Grid>
            </Grid>
          </Fragment>
        )
      case 2:
        return (
          <Fragment>
            <Grid container spacing={3} alignItems='flex-start'>
              <Grid item xs={12} sm={6}>
                <Typography variant='subtitle1' gutterBottom>
                  Positional Arguments
                </Typography>
                {renderDynamicFormSection('args')}
                <Box mt={2}>
                  <Button
                    startIcon={
                      <Icon
                        icon='mdi:plus-circle-outline'
                        style={{
                          color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : 'black'
                        }}
                      />
                    }
                    onClick={() => addSectionEntry('args')}
                    style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
                  >
                    Add Argument
                  </Button>
                </Box>
              </Grid>
              <Grid item>
                <Divider orientation='vertical' flexItem />
              </Grid>
              <Grid item xs={12} sm={5}>
                <Typography variant='subtitle1' gutterBottom>
                  Keyword Arguments
                </Typography>
                {renderDynamicFormSection('kwargs')}
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
                    onClick={() => addSectionEntry('kwargs')}
                    style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
                  >
                    Add Keyword Arguments
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Fragment>
        )
      case 3:
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
                  style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
                >
                  Add Metadata
                </Button>
              </Box>
            </Stack>
          </Fragment>
        )
      case 4:
        return (
          <Fragment>
            <Stack direction='column' spacing={1}>
              {renderDynamicFormSection('prompts')}
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
                  onClick={() => addSectionEntry('prompts')}
                  style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
                >
                  Add Prompts
                </Button>
              </Box>
            </Stack>
          </Fragment>
        )
      case 5:
        return (
          <Fragment>
            <Grid container spacing={3} alignItems='center'>
              {/* Datacenter */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabelStyled>Datacenter</InputLabelStyled>
                  <SelectStyled
                    value={taskForm.datacenter.toUpperCase()}
                    onChange={e =>
                      handleFormChange({
                        target: {
                          name: 'datacenter',
                          value: e.target.value
                        }
                      })
                    }
                    label='Datacenter'
                  >
                    <MenuItem value=''>
                      <em>None</em>
                    </MenuItem>
                    {datacenters.map(datacenter => (
                      <MenuItem key={datacenter} value={datacenter}>
                        {datacenter}
                      </MenuItem>
                    ))}
                  </SelectStyled>
                </FormControl>
              </Grid>

              {/* Environments */}
              <Grid item xs={12} sm={4}>
                <AutocompleteStyled
                  multiple
                  id='environments-autocomplete'
                  options={environments}
                  getOptionLabel={option => option}
                  value={taskForm.environments}
                  onChange={(event, newValue) => {
                    handleFormChange({ target: { name: 'environments', value: newValue } })
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant='outlined'
                      label='Environments'
                      placeholder='Select multiple environments'
                      fullWidth
                    />
                  )}
                  disabled={!taskForm.datacenter}
                />
              </Grid>

              {/* Components */}
              <Grid item xs={12} sm={4}>
                <AutocompleteStyled
                  multiple
                  id='components-autocomplete'
                  options={components}
                  getOptionLabel={option => option}
                  value={taskForm.components}
                  onChange={(event, newValue) => {
                    handleFormChange({ target: { name: 'components', value: newValue } })
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant='outlined'
                      label='Components'
                      placeholder='Select multiple components'
                      fullWidth
                    />
                  )}
                  disabled={!taskForm.environments.length}
                />
              </Grid>
            </Grid>
            {/* Hosts section */}
            {renderDynamicFormSection('hosts')}
            <Box mt={2} display='flex' justifyContent='flex-end'>
              <Button
                startIcon={
                  <Icon
                    icon='mdi:plus-circle-outline'
                    style={{ color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : 'black' }}
                  />
                }
                onClick={() => addSectionEntry('hosts')}
                style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
              >
                Add Host/Targets
              </Button>
            </Box>
          </Fragment>
        )
      case 6:
        return <ReviewAndSubmitSection taskForm={taskForm} />
      default:
        return 'Unknown Step'
    }
  }

  const renderContent = () => {
    if (activeStep === steps.length) {
      return (
        <Fragment>
          <Typography>Task details have been submitted.</Typography>
          <ReviewAndSubmitSection taskForm={taskForm} />
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

export default UpdateTaskWizard
