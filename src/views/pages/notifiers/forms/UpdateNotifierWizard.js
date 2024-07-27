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
import StepLabel from '@mui/material/StepLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Autocomplete from '@mui/material/Autocomplete'
import Select from '@mui/material/Select'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip'
import { useTheme, styled } from '@mui/material/styles'
import { refetchNotifierTriggerAtom } from 'src/lib/atoms'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Styled Component
import StepperWrapper from 'src/@core/styles/mui/stepper'
import StepperCustomDot from 'src/views/pages/misc/forms/StepperCustomDot'

// ** Import yup for form validation
import * as yup from 'yup'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// Define initial state for the notifier form
const initialNotifierFormState = {
  name: '',
  type: '',
  status: 'enabled',
  description: '',
  email_addresses: [''],
  webhook_url: ''
}

const steps = [
  {
    title: 'Notifier Type',
    subtitle: 'Type',
    description: 'Select the notifier type.'
  },
  {
    title: 'Notifier Details',
    subtitle: 'Details',
    description: 'Edit the notifier details.'
  },
  {
    title: 'Review',
    subtitle: 'Summary',
    description: 'Review the notifier details and submit.'
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

const InputLabelStyled = styled(InputLabel)(({ theme }) => ({
  '&.Mui-focused': {
    color: theme.palette.customColors.accent
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

const UpdateNotifierWizard = ({ onClose, currentNotifier }) => {
  const [notifierForm, setNotifierForm] = useState(initialNotifierFormState)
  const [activeStep, setActiveStep] = useState(0)
  const [resetFormFields, setResetFormFields] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [, setRefetchTrigger] = useAtom(refetchNotifierTriggerAtom)

  const theme = useTheme()
  const session = useSession()

  useEffect(() => {
    if (currentNotifier && Object.keys(currentNotifier).length > 0) {
      const updatedNotifierForm = {
        ...initialNotifierFormState,
        name: currentNotifier.name || '',
        type: currentNotifier.type || '',
        status: currentNotifier.status || 'enabled',
        description: currentNotifier.description || '',
        email_addresses: currentNotifier.email_addresses || [''],
        webhook_url: currentNotifier.webhook_url || ''
      }

      setNotifierForm(updatedNotifierForm)
    }
  }, [currentNotifier])

  const handleFormChange = (event, index, section) => {
    const target = event.target || event
    const name = target.name
    let value = target.value

    setNotifierForm(prevForm => {
      const newForm = { ...prevForm }

      if (index !== undefined && section) {
        if (section === 'email_addresses') {
          newForm[section][index] = value
        } else {
          newForm[section][index][name] = value
        }
      } else {
        newForm[name] = value
      }

      return newForm
    })
  }

  const addEmailAddress = () => {
    setNotifierForm(prevForm => {
      const updatedEmails = [...prevForm.email_addresses, '']

      return { ...prevForm, email_addresses: updatedEmails }
    })
  }

  const removeEmailAddress = index => {
    setNotifierForm(prevForm => {
      const updatedEmails = [...prevForm.email_addresses]
      updatedEmails.splice(index, 1)

      return { ...prevForm, email_addresses: updatedEmails }
    })
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = async () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
    if (activeStep === steps.length - 1) {
      try {
        const apiToken = session?.data?.user?.apiToken

        const headers = {
          Accept: 'application/json',
          Authorization: `Bearer ${apiToken}`
        }

        // Ensure notifierForm and email_addresses are defined
        const emailAddresses = notifierForm?.email_addresses ?? []

        // Transform email addresses
        const payload = {
          ...notifierForm,
          email_addresses: emailAddresses.filter(email => email.trim() !== '')
        }

        console.log('Notifier form payload', payload)

        const endpoint = `/api/notifiers/update/${currentNotifier.name}`
        const response = await axios.put(endpoint, payload, { headers })

        if (response.data) {
          const notifier = response.data

          if (notifier) {
            console.log('Notifier successfully updated for ', notifier.name)
            toast.success('Notifier successfully updated')
          } else {
            console.error('Failed to update notifier')
            toast.error('Failed to update notifier')
          }

          onClose && onClose()
          setTimeout(() => {
            setRefetchTrigger(Date.now())
          }, 2000)
        }
      } catch (error) {
        console.error('Error updating notifier details', error)
        toast.error('Error updating notifier details')
      }
    }
  }

  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Fragment>
            <Typography variant='h6' gutterBottom>
              Notifier Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextfieldStyled
                  required
                  id='name'
                  name='name'
                  label='Notifier Name'
                  fullWidth
                  autoComplete='off'
                  value={notifierForm.name.toUpperCase()}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
              <TextfieldStyled
                  required
                  id='name'
                  name='name'
                  label='Notifier Name'
                  fullWidth
                  autoComplete='off'
                  value={notifierForm.type.toUpperCase()}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='notifier-status-autocomplete'
                  options={['enabled', 'disabled']}
                  value={notifierForm.status.toUpperCase()}
                  onChange={(event, newValue) => {
                    handleFormChange({ target: { name: 'status', value: newValue } }, null, null)
                  }}
                  onInputChange={(event, newInputValue) => {
                    if (event) {
                      handleFormChange({ target: { name: 'status', value: newInputValue } }, null, null)
                    }
                  }}
                  renderInput={params => (
                    <TextfieldStyled {...params} label='Notifier Status' fullWidth required autoComplete='off' />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextfieldStyled
                  fullWidth
                  label='Description'
                  name='description'
                  autoComplete='off'
                  value={notifierForm.description !== undefined ? notifierForm.description : ''}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Fragment>
        )
      case 1:
        return (
          <Fragment>
            <Typography variant='h6' gutterBottom>
              Notifier Details
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
                  value={notifierForm.name}
                  onChange={handleFormChange}
                  error={Boolean(formErrors?.name)}
                  helperText={formErrors?.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AutocompleteStyled
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  id='notifier-status-autocomplete'
                  options={['ENABLED', 'DISABLED']}
                  value={notifierForm.status.toUpperCase()}
                  onChange={(event, newValue) => {
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
              <Grid item xs={12}>
                <TextfieldStyled
                  fullWidth
                  label='Description'
                  name='description'
                  autoComplete='off'
                  value={notifierForm.description !== undefined ? notifierForm.description : ''}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                />
              </Grid>
              {notifierForm.type === 'email' && renderDynamicFormSection('email_addresses')}
              {notifierForm.type === 'webhook' && (
                <Grid item xs={12}>
                  <TextfieldStyled
                    fullWidth
                    label='Webhook URL'
                    name='webhook_url'
                    autoComplete='off'
                    value={notifierForm.webhook_url !== undefined ? notifierForm.webhook_url : ''}
                    error={Boolean(formErrors?.webhook_url)}
                    helperText={formErrors?.webhook_url}
                    disabled
                  />
                </Grid>
              )}
            </Grid>
          </Fragment>
        )
      case 2:
        return <ReviewAndSubmitSection notifierForm={notifierForm} />
      default:
        return 'Unknown Step'
    }
  }

  const handleReset = () => {
    if (currentNotifier && Object.keys(currentNotifier).length > 0) {
      const resetNotifierForm = {
        ...initialNotifierFormState,
        name: currentNotifier.name || '',
        type: currentNotifier.type || '',
        status: currentNotifier.status || 'enabled',
        description: currentNotifier.description || '',
        email_addresses: currentNotifier.email_addresses || [''],
        webhook_url: currentNotifier.webhook_url || ''
      }

      setNotifierForm(currentNotifier)
    } else {
      setNotifierForm(initialNotifierFormState)
    }
    setResetFormFields(false)
    setActiveStep(0)
  }

  const renderDynamicFormSection = section => {
    const sectionTitles = {
      email_addresses: 'Email Address',
      webhook_url: 'Webhook URL'
    }

    return notifierForm[section].map((entry, index) => (
      <Grid item xs={12} key={`${index}-${resetFormFields}`}>
        <Box key={`${index}-${resetFormFields}`} sx={{ marginBottom: 1 }}>
          <Grid container spacing={3} alignItems='center'>
            <Grid item xs={8}>
              <TextfieldStyled
                key={`key-${section}-${index}`}
                fullWidth
                label={sectionTitles[section]}
                name={section}
                value={entry}
                onChange={e => handleFormChange(e, index, section)}
                variant='outlined'
                margin='normal'
              />
            </Grid>
            <Grid item xs={2} style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
              <IconButton
                onClick={() => addSectionEntry(section)}
                style={{ color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : 'black' }}
              >
                <Icon icon='mdi:plus-circle-outline' />
              </IconButton>
              {notifierForm[section].length > 1 && (
                <IconButton onClick={() => removeSectionEntry(section, index)} color='secondary'>
                  <Icon icon='mdi:minus-circle-outline' />
                </IconButton>
              )}
            </Grid>
          </Grid>
        </Box>
      </Grid>
    ))
  }

  const renderContent = () => {
    if (activeStep === steps.length) {
      return (
        <Fragment>
          <Typography>Notifier details have been submitted.</Typography>
          <ReviewAndSubmitSection notifierForm={notifierForm} />
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

const ReviewAndSubmitSection = ({ notifierForm }) => {
  const renderGeneralSection = notifierForm => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
          General Information
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Notifier Name'
          value={notifierForm.name !== undefined ? notifierForm.name : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Notifier Type'
          value={notifierForm.type !== undefined ? notifierForm.type : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldStyled
          fullWidth
          label='Status'
          value={notifierForm.status !== undefined ? notifierForm.status : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
        />
      </Grid>
      <Grid item xs={12}>
        <TextfieldStyled
          fullWidth
          label='Description'
          value={notifierForm.description !== undefined ? notifierForm.description : ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          margin='normal'
          multiline
          rows={2}
        />
      </Grid>
    </Grid>
  )

  const renderEmailSection = taskForm => {
    if (taskForm.email_addresses && taskForm.email_addresses.length > 0) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
              Email Addresses
            </Typography>
          </Grid>
          {taskForm.email_addresses.map((email, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <TextfieldStyled
                fullWidth
                label={`Email ${index + 1}`}
                value={email}
                InputProps={{ readOnly: true }}
                variant='outlined'
                margin='normal'
              />
            </Grid>
          ))}
        </Grid>
      )
    }

    return null
  }

  const renderWebhookSection = taskForm => {
    if (taskForm.webhook_url && taskForm.webhook_url.trim() !== '') {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h6' gutterBottom style={{ marginTop: '20px' }}>
              Webhook URL
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextfieldStyled
              fullWidth
              label='Webhook URL'
              value={taskForm.webhook_url}
              InputProps={{ readOnly: true }}
              variant='outlined'
              margin='normal'
            />
          </Grid>
        </Grid>
      )
    }

    return null
  }

  return (
    <Fragment>
      {renderGeneralSection(notifierForm)}
      {notifierForm.type === 'email' && renderEmailSection(notifierForm)}
      {notifierForm.type === 'webhook' && renderWebhookSection(notifierForm)}
    </Fragment>
  )
}

export default UpdateNotifierWizard
