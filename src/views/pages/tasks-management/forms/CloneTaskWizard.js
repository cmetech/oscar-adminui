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
  promptForCredentials: false,
  promptForAPIKey: false,
  promptForSudoCredentials: false,
  environments: [],
  components: [],
  subcomponents: []
}

const steps = [
  {
    title: 'General',
    subtitle: 'Information',
    description: 'Clone the Task details.'
  },
  {
    title: 'Schedule',
    subtitle: 'Details',
    description: 'Clone the Schedule details. Click on Show Schedule Instructions below for more information.'
  },
  {
    title: 'Arguments',
    subtitle: 'Positional',
    description: 'Clone the Task Positional and Keyword Argument details.'
  },
  {
    title: 'Metadata',
    subtitle: 'Information',
    description: 'Clone the Task Metadata Arguments details.'
  },
  {
    title: 'Prompts',
    subtitle: 'Details',
    description: 'Clone the Prompts details.'
  },
  {
    title: 'Targets',
    subtitle: 'Remote Host Information',
    description: 'Provide the Host target details.'
  },
  {
    title: 'Review',
    subtitle: 'Summary',
    description: 'Review the Task details and submit.'
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
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.customColors.accent // border color when focused
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

const ScheduleSection = ({ taskForm, handleFormChange, dateRange, setDateRange }) => {
  const [showDocumentation, setShowDocumentation] = useState(false)
  const toggleDocumentation = () => setShowDocumentation(!showDocumentation)

  // Get list of timezones from moment-timezone
  const timezones = moment.tz.names()

  // Handler for timezone change in Autocomplete
  const handleTimezoneChange = (event, newValue) => {
    handleFormChange({ target: { name: 'schedule.timezone', value: newValue } }, null, 'schedule')
  }

  return (
    <Fragment>
      <Grid container direction='column' spacing={2}>
        {/* Clickable Text to Toggle Visibility */}
        <Grid
          item
          style={{
            cursor: 'pointer',
            paddingLeft: '27px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <IconButton onClick={toggleDocumentation}>
            {showDocumentation ? <Icon icon='mdi:expand-less' /> : <Icon icon='mdi:expand-more' />}
          </IconButton>
          <Typography variant='body1' onClick={toggleDocumentation}>
            {showDocumentation ? 'Hide Schedule Instructions' : 'Show Schedule Instructions'}
          </Typography>
        </Grid>
        {showDocumentation && (
          <Grid container spacing={2} style={{ padding: '16px' }}>
            <Grid item>
              <Typography variant='body2' gutterBottom>
                <strong>Schedule your task</strong> with precision using flexible cron-style expressions. This section
                allows you to define when and how often your task should run, similar to scheduling jobs in UNIX-like
                systems.
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='body2' gutterBottom>
                Define <strong>start and end dates</strong> to control the active period of your task schedule. Input
                dates in ISO 8601 format or select them using the provided date pickers.
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='body2' gutterBottom>
                Not all fields are mandatory. Specify only the ones you need. Unspecified fields default to their
                broadest setting, allowing the task to run more frequently. For instance, leaving the{' '}
                <strong>day</strong> field empty schedules the task to run every day of the month.
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='body2' gutterBottom>
                Use the <strong>Expression Types</strong> below to refine your schedule:
                <ul>
                  <li>
                    <strong>*</strong> - Run at every possible time/value.
                  </li>
                  <li>
                    <strong>*/a</strong> - Run at every <em>a</em> interval.
                  </li>
                  <li>
                    <strong>a-b</strong> - Run within a range from <em>a</em> to <em>b</em>.
                  </li>
                  <li>
                    <strong>a-b/c</strong> - Run within a range at every <em>c</em> interval.
                  </li>
                  <li>
                    <strong>xth y</strong> - Run on the <em>x</em>-th occurrence of weekday <em>y</em> within the month.
                  </li>
                  <li>
                    <strong>last x</strong> - Run on the last occurrence of weekday <em>x</em> within the month.
                  </li>
                  <li>
                    <strong>last</strong> - Run on the last day of the month.
                  </li>
                  <li>And more, including combinations of expressions separated by commas.</li>
                </ul>
              </Typography>
            </Grid>
            <Grid item marginBottom={4}>
              <Typography variant='body2' gutterBottom>
                Abbreviated English month names (<strong>jan</strong> – <strong>dec</strong>) and weekday names (
                <strong>mon</strong> – <strong>sun</strong>) are also supported.
              </Typography>
            </Grid>
          </Grid>
        )}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='year'
            name='year'
            label='Year'
            fullWidth
            value={taskForm.schedule.year}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='month'
            name='month'
            label='Month'
            fullWidth
            value={taskForm.schedule.month}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='day'
            name='day'
            label='Day'
            fullWidth
            value={taskForm.schedule.day}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='hour'
            name='hour'
            label='Hour'
            fullWidth
            value={taskForm.schedule.hour}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='minute'
            name='minute'
            label='Minute'
            fullWidth
            value={taskForm.schedule.minute}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='second'
            name='second'
            label='Second'
            fullWidth
            value={taskForm.schedule.second}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid>
        {/* <Grid item xs={12} sm={6}>
          <TextfieldStyled
            id='day_of_week'
            name='day_of_week'
            label='Day of Week'
            fullWidth
            value={taskForm.schedule.day_of_week}
            onChange={e => handleFormChange(e, null, 'schedule')}
          />
        </Grid> */}
        <Grid item xs={12} sm={6}>
          <DateRangePicker
            localeText={{ start: 'Start Date', end: 'End Date' }}
            value={dateRange}
            onChange={newValue => {
              setDateRange(newValue)
            }}
            renderInput={(startProps, endProps) => (
              <Fragment>
                <TextfieldStyled {...startProps} />
                <Box sx={{ mx: 2 }}> to </Box>
                <TextfieldStyled {...endProps} />
              </Fragment>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <AutocompleteStyled
            id='timezone'
            options={timezones}
            getOptionLabel={option => option} // The option is already a string, but you can format it if needed
            renderInput={params => <TextfieldStyled {...params} label='Timezone' />}
            value={taskForm.schedule.timezone}
            onChange={handleTimezoneChange}
            autoComplete // Enable autocomplete behavior
            includeInputInList // Include the input value in the list of options
            freeSolo // Allow arbitrary input values
            clearOnBlur // Clear input on blur if not selected from the list
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextfieldStyled
            id='jitter'
            name='jitter'
            label='Jitter (seconds)'
            fullWidth
            value={taskForm.schedule.jitter}
            onChange={e => {
              const value = e.target.value
              // Convert to number for validation
              const numValue = Number(value)

              // Allow empty string or valid numbers
              if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 180)) {
                handleFormChange(
                  {
                    target: {
                      name: 'jitter',
                      value: value === '' ? 0 : Math.min(180, Math.max(0, numValue))
                    }
                  },
                  null,
                  'schedule'
                )
              }
            }}
            error={taskForm.schedule.jitter > 180 || taskForm.schedule.jitter < 0}
            helperText={
              taskForm.schedule.jitter > 180 || taskForm.schedule.jitter < 0
                ? 'Value must be between 0 and 180'
                : 'Enter a number between 0 and 180'
            }
          />
        </Grid>
      </Grid>
    </Fragment>
  )
}

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
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <CheckboxStyled
                checked={taskForm.promptForCredentials}
                InputProps={{ readOnly: true }}
                name='promptForCredentials'
              />
            }
            label='Prompt for Credentials?'
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <CheckboxStyled
                checked={taskForm.promptForAPIKey}
                InputProps={{ readOnly: true }}
                name='promptForAPIKey'
              />
            }
            label='Prompt for APIKey?'
          />
        </Grid>
      </Grid>
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
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Subcomponents'
          value={taskForm.subcomponents.join(', ') || 'N/A'} // Join the array values into a string
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

  const renderScheduleSection = schedule => (
    <Fragment>
      <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
        Schedule Information
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(schedule).map(([key, value], index) => {
          // Format the key to be more readable
          const label = key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          const formattedValue = typeof value === 'object' && value !== null ? value.toLocaleString() : value

          return (
            <Grid item xs={12} sm={6} key={`schedule-${index}`}>
              <TextfieldStyled
                fullWidth
                label={label}
                value={formattedValue || 'N/A'}
                InputProps={{ readOnly: true }}
                variant='outlined'
                margin='normal'
              />
            </Grid>
          )
        })}
      </Grid>
    </Fragment>
  )

  return (
    <Fragment>
      {renderGeneralSection(taskForm)}
      {taskForm.schedule && renderScheduleSection(taskForm.schedule)}
      {taskForm.args && renderArgsSection(taskForm.args)}
      {taskForm.kwargs && <Section title='Keyword Arguments' data={taskForm.kwargs} />}
      {taskForm.prompts && renderPromptsSection(taskForm.prompts)}
      {taskForm.metadata && <Section title='Metadata' data={taskForm.metadata} />}
      {taskForm.hosts && renderHostSection(taskForm.hosts)}
    </Fragment>
  )
}

// Replace 'defaultBorderColor' and 'hoverBorderColor' with actual color values

const CloneTaskWizard = ({ onClose, ...props }) => {
  const { currentTask } = props

  // ** States
  const [taskForm, setTaskForm] = useState(initialTaskFormState)
  const [datacenters, setDatacenters] = useState([])
  const [environments, setEnvironments] = useState([])
  const [components, setComponents] = useState([])
  const [subcomponents, setSubcomponents] = useState([])
  const [activeStep, setActiveStep] = useState(0)
  const [resetFormFields, setResetFormFields] = useState(false)
  const [selectedDatacenter, setSelectedDatacenter] = useState('')
  const [selectedEnvironments, setSelectedEnvironments] = useState([])
  const [selectedComponents, setSelectedComponents] = useState([])
  const [cronValue, setCronValue] = useState('')
  const [cronError, setCronError] = useState()
  const [, setRefetchTrigger] = useAtom(refetchTaskTriggerAtom)

  // Separate state for date range picker
  const [dateRange, setDateRange] = useState([null, null])

  const theme = useTheme()
  const session = useSession()

  // When dateRange updates, update taskForm
  useEffect(() => {
    handleFormChange({ target: { name: 'schedule.start_date', value: dateRange[0] } }, null, null)
    handleFormChange({ target: { name: 'schedule.end_date', value: dateRange[1] } }, null, null)
  }, [dateRange])

  // Fetch task config and reset taskForm when currentTask changes
  useEffect(() => {
    const fetchTaskConfig = async () => {
      // Reset taskForm to initial state when currentTask changes
      setTaskForm(initialTaskFormState)

      if (currentTask?.name) {
        try {
          const response = await axios.get(`/api/tasks/config/${currentTask.name}`)
          const taskConfig = response.data

          // Safely process args with null checking and type validation
          const processedArgs = (() => {
            if (!taskConfig.args) return [{ value: '' }]
            if (!Array.isArray(taskConfig.args)) return [{ value: '' }]

            return taskConfig.args.map(arg => ({
              value: arg != null ? String(arg) : '' // Convert to string or empty string if null
            }))
          })()

          // Safely process kwargs with null checking
          const processedKwargs = (() => {
            if (!taskConfig.kwargs || typeof taskConfig.kwargs !== 'object') {
              return [{ key: '', value: '' }]
            }

            return Object.entries(taskConfig.kwargs).map(([key, value]) => ({
              key: key || '',
              value: value != null ? String(value) : '' // Convert to string or empty string if null
            }))
          })()

          // Parse components and subcomponents with null checking
          let parsedComponents = []
          let parsedSubcomponents = []

          if (Array.isArray(taskConfig.components) && taskConfig.components.length > 0) {
            taskConfig.components.forEach(component => {
              if (component && typeof component === 'string') {
                if (component.includes(':')) {
                  const [comp, subcomp] = component.split(':')
                  if (comp && !parsedComponents.includes(comp)) {
                    parsedComponents.push(comp)
                  }
                  if (subcomp && !parsedSubcomponents.includes(subcomp)) {
                    parsedSubcomponents.push(subcomp)
                  }
                } else {
                  if (!parsedComponents.includes(component)) {
                    parsedComponents.push(component)
                  }
                }
              }
            })
          }

          // Safely process other fields
          const datacenterValue = taskConfig.datacenter ? String(taskConfig.datacenter) : ''

          // Update form with fetched config and safe values
          setTaskForm(prevForm => ({
            ...initialTaskFormState,
            ...taskConfig,
            datacenter: datacenterValue,
            args: processedArgs,
            kwargs: processedKwargs,
            components: parsedComponents,
            subcomponents: parsedSubcomponents,
            prompts: Array.isArray(taskConfig.prompts)
              ? taskConfig.prompts.map(prompt => ({
                  prompt: prompt?.prompt || '',
                  default_value: prompt?.default_value || '',
                  value: prompt?.value || ''
                }))
              : [{ prompt: '', default_value: '', value: '' }],
            metadata:
              taskConfig.metadata && typeof taskConfig.metadata === 'object'
                ? Object.entries(taskConfig.metadata).map(([key, value]) => ({
                    key: key || '',
                    value: value != null ? String(value) : ''
                  }))
                : [{ key: '', value: '' }],
            hosts: Array.isArray(taskConfig.hosts)
              ? taskConfig.hosts.map(host => ({
                  ip_address: host != null ? String(host) : ''
                }))
              : [{ ip_address: '' }],
            environments: Array.isArray(taskConfig.environments) ? taskConfig.environments.map(env => String(env)) : []
          }))

          // Fetch datacenters
          try {
            const dcResponse = await axios.get('/api/inventory/datacenters')
            const datacenterNames = dcResponse.data.rows.map(dc => dc.name)
            setDatacenters(datacenterNames)

            // Fetch environments if datacenter exists
            if (datacenterValue) {
              try {
                const envResponse = await axios.get(`/api/inventory/environments?datacenter_name=${datacenterValue}`)
                const environmentNames = envResponse.data.rows.map(env => env.name)
                setEnvironments(environmentNames)
              } catch (error) {
                console.error('Error fetching environments:', error)
                setEnvironments([])
              }
            } else {
              setEnvironments([])
            }
          } catch (error) {
            console.error('Error fetching datacenters:', error)
          }

          // Fetch components and subcomponents if not already fetched
          if (components.length === 0 || subcomponents.length === 0) {
            try {
              const compResponse = await axios.get('/api/inventory/components')
              const componentNames = compResponse.data.rows.map(comp => comp.name)
              setComponents(componentNames)

              const subcompResponse = await axios.get('/api/inventory/subcomponents')
              const subcomponentNames = subcompResponse.data.rows.map(subcomp => subcomp.name)
              setSubcomponents(subcomponentNames)
            } catch (error) {
              console.error('Error fetching components and subcomponents:', error)
            }
          }
        } catch (error) {
          console.error('Error fetching task configuration:', error)
          toast.error('Failed to fetch task configuration')
          // Set safe default values on error
          setTaskForm(initialTaskFormState)
        }
      } else {
        // If no currentTask, reset form and related states
        setTaskForm(initialTaskFormState)
        setEnvironments([])
      }
    }

    fetchTaskConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTask?.name]) // Run whenever currentTask.name changes

  // Handle datacenter changes
  useEffect(() => {
    const fetchEnvironments = async () => {
      if (taskForm.datacenter) {
        try {
          const response = await axios.get(`/api/inventory/environments?datacenter_name=${taskForm.datacenter}`)
          const environmentNames = response.data.rows.map(env => env.name.toUpperCase())
          setEnvironments(environmentNames)
        } catch (error) {
          console.error('Error fetching environments:', error)
          setEnvironments([])
        }
      } else {
        setEnvironments([])
      }
    }

    fetchEnvironments()
  }, [taskForm.datacenter])

  // Function to handle form field changes
  // Function to handle form field changes for dynamic sections

  const handleFormChange = (event, index, section) => {
    // Handling both synthetic events and direct value assignments from Autocomplete
    const target = event.target || event
    const name = target.name
    const type = target?.type || 'text'
    let value = target.value

    if (type === 'checkbox') {
      value = target.checked
    }

    // Convert string values to lowercase, except for specific fields
    if (
      typeof value === 'string' &&
      !['schedule.start_date', 'schedule.end_date', 'schedule.timezone'].includes(name)
    ) {
      value = value.toLowerCase()
    }

    setTaskForm(prevForm => {
      const newForm = { ...prevForm }

      // console.log('Updating taskForm with: ', newForm)

      if (section) {
        // Check if the section is an array or an object
        if (Array.isArray(newForm[section])) {
          // For array sections, clone the array and update the specific index
          // For array sections, clone the array and update the specific index
          let updatedSection = [...newForm[section]]

          if (section === 'hosts' && name === 'ip_address' && value.trim() === '') {
            // Remove the host entry at this index
            updatedSection.splice(index, 1)
          } else {
            updatedSection[index] = { ...updatedSection[index], [name]: value }
          }
          newForm[section] = updatedSection
        } else if (typeof newForm[section] === 'object') {
          // For object sections like 'schedule', update directly
          newForm[section] = { ...newForm[section], [name]: value }
        }
      } else {
        // Directly update top-level fields or handle nested updates
        if (name.includes('.')) {
          // Nested object updates, e.g., "schedule.year"
          const [sectionName, fieldName] = name.split('.')
          newForm[sectionName] = {
            ...newForm[sectionName],
            [fieldName]: value
          }
        } else {
          // Top-level field updates
          if (name === 'datacenter') {
            // Clear dependent fields when datacenter is empty or changes
            newForm.environments = []
            newForm.components = []
            newForm.subcomponents = []
            newForm[name] = value
          } else if (name === 'environments') {
            // Clear component-related fields when environments change
            newForm.components = []
            newForm.subcomponents = []
            newForm[name] = value
          } else {
            newForm[name] = value || ''
          }
        }

        if (name === 'datacenter') {
          // Clear environments when datacenter changes
          newForm.environments = []
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
      setResetFormFields(prev => !prev)
    }
    setActiveStep(prevActiveStep => prevActiveStep + 1)
    if (activeStep === steps.length - 1) {
      try {
        const apiToken = session?.data?.user?.apiToken

        const headers = {
          Accept: 'application/json',
          Authorization: `Bearer ${apiToken}`
        }

        // Log the current task form state
        console.log('Current taskForm state:', taskForm)
        console.log('Schedule data:', taskForm.schedule)

        let processedComponents = taskForm.components
        if (taskForm.components?.length > 0 && taskForm.subcomponents?.length > 0) {
          processedComponents = taskForm.components
            .map(component => {
              const matchingSubcomponents = taskForm.subcomponents

              return matchingSubcomponents.map(subcomponent => `${component}:${subcomponent}`)
            })
            .flat()
        }

        const payload = {
          ...taskForm,
          args: taskForm.args.map(arg => arg.value),
          hosts: taskForm.hosts
            .filter(host => host.ip_address && host.ip_address.trim() !== '')
            .map(host => host.ip_address),
          kwargs: Object.fromEntries(taskForm.kwargs.map(({ key, value }) => [key, value])),
          metadata: Object.fromEntries(taskForm.metadata.map(({ key, value }) => [key, value])),
          components: processedComponents
        }

        // Remove subcomponents from payload
        delete payload.subcomponents

        // Log the final payload
        console.log('Submitting task with payload:', payload)

        const endpoint = `/api/tasks/add`
        const response = await axios.post(endpoint, payload, { headers })
        console.log('Config API Response:', response.data)

        if (response.data) {
          const task = response.data

          if (task) {
            console.log('Task successfully created for ', task.name)
          } else {
            console.error('Failed to create task')
            toast.error('Failed to create task')
          }

          // Call onClose to close the modal
          onClose && onClose()

          // Trigger a refetch of the task list
          setRefetchTrigger(new Date().getTime())
        }
      } catch (error) {
        console.error('Error updating task details:', error)
        console.error('Error response:', error.response?.data)
        toast.error('Error updating task details')
      }
    }
  }

  const handleReset = () => {
    if (currentTask && Object.keys(currentTask).length > 0) {
      let promptForCredentials = false
      let promptForAPIKey = false

      // Check directly in the object form of metadata before it's converted into an array
      if (currentTask?.metadata && currentTask.metadata['credentials'] === '1') {
        promptForCredentials = true
      }

      if (currentTask?.metadata && currentTask.metadata['api_key'] === '1') {
        promptForAPIKey = true
      }

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
        environments: currentTask.environments?.map(environment => ({ value: environment })) || [],
        components: currentTask.components?.map(component => ({ value: component })) || [],
        subcomponents: currentTask.subcomponents?.map(subcomponent => ({ value: subcomponent })) || [],
        promptForCredentials,
        promptForAPIKey
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
                  value={taskForm.owner.toUpperCase()}
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
                  value={taskForm.organization.toUpperCase()}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextfieldStyled
                  fullWidth
                  label='Description'
                  name='description'
                  autoComplete='off'
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
          <ScheduleSection
            taskForm={taskForm}
            handleFormChange={handleFormChange}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
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
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <CheckboxStyled
                      checked={taskForm.promptForCredentials}
                      onChange={() =>
                        handleFormChange({
                          target: { name: 'promptForCredentials', value: !taskForm.promptForCredentials }
                        })
                      }
                      name='promptForCredentials'
                    />
                  }
                  label='Prompt for Credentials?'
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <CheckboxStyled
                      checked={taskForm.promptForAPIKey}
                      onChange={() =>
                        handleFormChange({ target: { name: 'promptForAPIKey', value: !taskForm.promptForAPIKey } })
                      }
                      name='promptForAPIKey'
                    />
                  }
                  label='Prompt for APIKey?'
                />
              </Grid>
            </Grid>
            {/* <Divider
              style={{
                marginLeft: '5px',
                marginTop: '10px',
                marginBottom: '10px',
                marginRight: '5px',
                width: '100%',
                borderWidth: '1px',
                borderColor: 'black'
              }}
              variant='fullWidth'
            /> */}
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
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabelStyled id='datacenter-select-label' shrink={Boolean(taskForm.datacenter)}>
                    Datacenter
                  </InputLabelStyled>
                  <SelectStyled
                    labelId='datacenter-select-label'
                    id='datacenter-select'
                    value={taskForm.datacenter || ''}
                    onChange={e =>
                      handleFormChange({
                        target: {
                          name: 'datacenter',
                          value: e.target.value
                        }
                      })
                    }
                    displayEmpty
                  >
                    <MenuItem value='' sx={{ height: '32px' }}>
                      <em>None</em>
                    </MenuItem>
                    {datacenters.map(datacenter => (
                      <MenuItem key={datacenter} value={datacenter}>
                        {datacenter.toUpperCase()}
                      </MenuItem>
                    ))}
                  </SelectStyled>
                </FormControl>
              </Grid>

              {/* Environments */}
              <Grid item xs={12} sm={3}>
                <AutocompleteStyled
                  multiple
                  id='environments-autocomplete'
                  options={environments}
                  getOptionLabel={option => option}
                  value={taskForm.environments || []}
                  onChange={(event, newValue) => {
                    handleFormChange({ target: { name: 'environments', value: newValue } })
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant='outlined'
                      label='Environments'
                      placeholder={taskForm.datacenter ? 'Select environments' : 'Select a datacenter first'}
                      fullWidth
                    />
                  )}
                  disabled={!taskForm.datacenter} // Only disabled if no datacenter
                />
              </Grid>

              {/* Components */}
              <Grid item xs={12} sm={3}>
                <AutocompleteStyled
                  multiple
                  id='components-autocomplete'
                  options={components}
                  getOptionLabel={option => option}
                  value={taskForm.components || []}
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
                  disabled={!taskForm.datacenter || !taskForm.environments?.length} // Disabled if no datacenter or environments
                />
              </Grid>

              {/* Subcomponents */}
              <Grid item xs={12} sm={3}>
                <AutocompleteStyled
                  multiple
                  id='subcomponents-autocomplete'
                  options={subcomponents}
                  getOptionLabel={option => option}
                  value={taskForm.subcomponents || []}
                  onChange={(event, newValue) => {
                    handleFormChange({ target: { name: 'subcomponents', value: newValue } })
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant='outlined'
                      label='Subcomponents'
                      placeholder='Select multiple subcomponents'
                      fullWidth
                    />
                  )}
                  disabled={!taskForm.datacenter || !taskForm.environments?.length || !taskForm.components?.length} // Disabled if no datacenter, environments, or components
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

export default CloneTaskWizard
