// src/views/pages/rules/forms/UpdateRuleForm.js

// ** React Imports
import React, { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import {
  Box,
  Grid,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Radio,
  OutlinedInput,
  Tooltip,
  tooltipClasses
} from '@mui/material'
import { useTheme, styled } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import * as yup from 'yup'

// ** Custom Components Imports
import StepperWrapper from 'src/@core/styles/mui/stepper'
import StepperCustomDot from 'src/views/pages/misc/forms/StepperCustomDot'

// ** Styled Components
const TextFieldStyled = styled(TextField)(({ theme }) => ({
  '& label.Mui-focused': {
    color: theme.palette.customColors.accent
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.customColors.accent
    }
  },
  marginTop: theme.spacing(2)
}))

const CheckboxStyled = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.customColors.accent,
  '&.Mui-checked': {
    color: theme.palette.customColors.accent
  }
}))

const SelectStyled = styled(Select)(({ theme }) => ({
  '&.MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.customColors.accent
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.customColors.accent
    }
  }
}))

const InputLabelStyled = styled(InputLabel)(({ theme }) => ({
  '&.Mui-focused': {
    color: theme.palette.customColors.accent
  }
}))

// ** Validation Schemas
const stepValidationSchemas = [
  // Step 0: Rule Details
  yup.object().shape({
    name: yup.string().required('Rule name is required'),
    description: yup.string(),
    condition: yup.string().required('Condition is required'),
    actionSuppress: yup.boolean()
  }),
  // Step 1: Add Labels
  yup.object().shape({
    add_labels: yup.array().of(
      yup.object().shape({
        key: yup.string().required('Label key is required'),
        value: yup.string().required('Label value is required')
      })
    )
  })
]

// Steps for the wizard
const steps = [
  {
    title: 'General',
    subtitle: 'Rule Details',
    description: 'Update rule name, condition, description, and actions.'
  },
  {
    title: 'Labels',
    subtitle: 'Add Labels',
    description: 'Add or edit labels to be added by the rule.'
  },
  {
    title: 'Review',
    subtitle: 'Summary',
    description: 'Review your changes before submitting.'
  }
]

const UpdateRuleForm = ({ open, onClose, rule }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [activeStep, setActiveStep] = useState(0)
  const [formErrors, setFormErrors] = useState({})

  const [availableSuppressionWindows, setAvailableSuppressionWindows] = useState([])
  const [selectedSuppressionWindows, setSelectedSuppressionWindows] = useState([])
  const [isLoadingWindows, setIsLoadingWindows] = useState(false)

  const [ruleForm, setRuleForm] = useState({
    namespace: rule.namespace || '',
    name: rule.name || '',
    description: rule.description || '',
    condition: rule.condition || '',
    actionSuppress: rule.actions && rule.actions.suppress ? true : false,
    add_labels:
      rule.actions && rule.actions.add_labels
        ? Object.entries(rule.actions.add_labels).map(([key, value]) => ({ key, value }))
        : [],
    suppression_window_ids: rule.suppression_windows ? rule.suppression_windows.map(w => w.id) : []
  })

  // ** Handle form input changes
  const handleFormChange = (event, index, section) => {
    const target = event.target || event
    const name = target.name
    let value = target.type === 'checkbox' ? target.checked : target.value

    setRuleForm(prevForm => {
      const newForm = { ...prevForm }

      if (index !== undefined && section) {
        newForm[section][index][name] = value
      } else {
        newForm[name] = value

        // If turning off suppress action, clear all suppression windows
        if (name === 'actionSuppress' && !value) {
          setSelectedSuppressionWindows([])
          newForm.suppression_window_ids = []
        }
      }

      return newForm
    })
  }

  // ** Handle Stepper
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = async () => {
    const currentStepSchema = stepValidationSchemas[activeStep]
    try {
      if (currentStepSchema) {
        await currentStepSchema.validate(ruleForm, { abortEarly: false })
      }
      setFormErrors({})
      if (activeStep === steps.length - 1) {
        submitRule()
      } else {
        setActiveStep(prevActiveStep => prevActiveStep + 1)
      }
    } catch (err) {
      const errors = {}
      if (err.inner && err.inner.length > 0) {
        err.inner.forEach(validationError => {
          errors[validationError.path] = validationError.message
        })
        setFormErrors(errors)
      } else {
        toast.error(err.message)
      }
    }
  }

  // ** Handlers for dynamic add_labels
  const addLabelEntry = () => {
    setRuleForm(prevForm => ({
      ...prevForm,
      add_labels: [...prevForm.add_labels, { key: '', value: '' }]
    }))
  }

  const removeLabelEntry = index => {
    const updatedLabels = [...ruleForm.add_labels]
    updatedLabels.splice(index, 1)
    setRuleForm(prevForm => ({
      ...prevForm,
      add_labels: updatedLabels
    }))
  }

  // ** Add these handler functions for suppression windows
  const addSuppressionWindow = () => {
    const updatedWindows = [...selectedSuppressionWindows, { id: '' }]
    setSelectedSuppressionWindows(updatedWindows)
  }

  const removeSuppressionWindow = index => {
    const updatedWindows = [...selectedSuppressionWindows]
    updatedWindows.splice(index, 1)
    setSelectedSuppressionWindows(updatedWindows)

    // Update the form's suppression window IDs
    setRuleForm(prev => ({
      ...prev,
      suppression_window_ids: updatedWindows.map(window => window.id)
    }))
  }

  const handleSuppressionWindowChange = (index, windowId) => {
    const windowDetails = availableSuppressionWindows.find(w => w.id === windowId)
    const updatedWindows = [...selectedSuppressionWindows]
    updatedWindows[index] = { ...windowDetails }
    setSelectedSuppressionWindows(updatedWindows)

    // Update the form's suppression window IDs
    const updatedIds = updatedWindows.map(window => window.id).filter(Boolean)
    setRuleForm(prev => ({
      ...prev,
      suppression_window_ids: updatedIds
    }))
  }

  // ** Add this helper function
  const hasAvailableWindows = () => {
    // Get currently selected window IDs
    const selectedIds = selectedSuppressionWindows.map(window => window.id)

    // Check if there are any windows available that aren't already selected
    return availableSuppressionWindows.some(window => !selectedIds.includes(window.id))
  }

  // ** Submit the form
  const submitRule = async () => {
    try {
      // Transform add_labels array into an object
      const labelsObject = ruleForm.add_labels.reduce((acc, label) => {
        if (label.key && label.value) {
          acc[label.key] = label.value
        }

        return acc
      }, {})

      // Get all suppression window IDs, including existing ones
      const suppressionWindowIds = ruleForm.actionSuppress
        ? selectedSuppressionWindows.map(window => window.id).filter(Boolean)
        : []

      const payload = {
        condition: ruleForm.condition,
        actions: {
          suppress: ruleForm.actionSuppress
        },
        suppression_window_ids: suppressionWindowIds
      }

      // Only add description if it's not empty
      if (ruleForm.description) {
        payload.description = ruleForm.description
      }

      // Only add 'add_labels' to the payload if there are labels
      if (Object.keys(labelsObject).length > 0) {
        payload.actions.add_labels = labelsObject
      }

      await axios.put(
        `/api/rules/update/${encodeURIComponent(ruleForm.name)}?namespace=${encodeURIComponent(ruleForm.namespace)}`,
        payload
      )

      toast.success(t('Successfully updated rule'))
      onClose()
    } catch (error) {
      console.error('Failed to update rule', error)
      toast.error(t('Failed to update rule'))
    }
  }

  // ** Render functions for each step
  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Fragment>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextFieldStyled
                  label={t('Namespace')}
                  name='namespace'
                  fullWidth
                  value={ruleForm.namespace}
                  InputProps={{
                    readOnly: true
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextFieldStyled
                  label={t('Rule Name')}
                  name='name'
                  fullWidth
                  value={ruleForm.name}
                  onChange={handleFormChange}
                  InputProps={{
                    readOnly: true
                  }}
                />
                {formErrors.name && (
                  <Typography color='error' variant='caption'>
                    {t(formErrors.name)}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextFieldStyled
                  label={t('Description')}
                  name='description'
                  fullWidth
                  value={ruleForm.description}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextFieldStyled
                  label={t('Condition')}
                  name='condition'
                  fullWidth
                  value={ruleForm.condition}
                  onChange={handleFormChange}
                  multiline
                  rows={4}
                  error={Boolean(formErrors?.condition)}
                  helperText={formErrors?.condition}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <CheckboxStyled
                      checked={ruleForm.actionSuppress}
                      onChange={handleFormChange}
                      name='actionSuppress'
                      color='primary'
                    />
                  }
                  label={t('Suppress Alert')}
                />
              </Grid>
            </Grid>
            {/* Suppression Windows Section */}
            {ruleForm.actionSuppress && (
              <Box sx={{ mt: 4 }}>
                {/* Existing Suppression Windows */}
                {selectedSuppressionWindows.map((window, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Grid container spacing={2} alignItems='center'>
                      <Grid item xs={10}>
                        <FormControl fullWidth>
                          <InputLabelStyled shrink>{t('Suppression Window')}</InputLabelStyled>
                          <TextFieldStyled
                            value={window.name}
                            InputProps={{
                              readOnly: true
                            }}
                            // Add these props to fix the label overlap issue
                            variant='outlined'
                            sx={{
                              '& .MuiInputLabel-root': {
                                backgroundColor: theme.palette.background.paper
                              }
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={2}>
                        <IconButton
                          onClick={() => removeSuppressionWindow(index)}
                          color='error'
                          aria-label='Delete suppression window'
                        >
                          <Icon icon='mdi:delete-outline' />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}

                {/* New Suppression Window Selection */}
                {selectedSuppressionWindows.length < availableSuppressionWindows.length && (
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2} alignItems='center'>
                      <Grid item xs={10}>
                        <FormControl fullWidth>
                          <InputLabelStyled>{t('Select Suppression Window')}</InputLabelStyled>
                          <SelectStyled
                            value=''
                            onChange={e => {
                              const windowId = e.target.value
                              if (windowId) {
                                const windowDetails = availableSuppressionWindows.find(w => w.id === windowId)
                                if (windowDetails) {
                                  const updatedWindows = [
                                    ...selectedSuppressionWindows,
                                    {
                                      id: windowDetails.id,
                                      name: windowDetails.name
                                    }
                                  ]
                                  setSelectedSuppressionWindows(updatedWindows)
                                  setRuleForm(prev => ({
                                    ...prev,
                                    suppression_window_ids: updatedWindows.map(w => w.id)
                                  }))
                                }
                              }
                            }}
                          >
                            <MenuItem value='' disabled>
                              {t('Select a suppression window')}
                            </MenuItem>
                            {availableSuppressionWindows
                              .filter(window => !selectedSuppressionWindows.some(selected => selected.id === window.id))
                              .map(window => (
                                <MenuItem key={window.id} value={window.id}>
                                  {window.name}
                                </MenuItem>
                              ))}
                          </SelectStyled>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Add Another Window Button */}
                {hasAvailableWindows() && (
                  <Button
                    startIcon={
                      <Icon
                        icon='mdi:plus-circle-outline'
                        style={{
                          color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : 'black'
                        }}
                      />
                    }
                    style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
                    onClick={addSuppressionWindow}
                    sx={{ mt: 2 }}
                  >
                    {t('Add Another Window')}
                  </Button>
                )}
              </Box>
            )}
          </Fragment>
        )
      case 1:
        return (
          <Fragment>
            {ruleForm.add_labels.map((label, index) => (
              <Grid container spacing={2} key={index} alignItems='center'>
                <Grid item xs={5}>
                  <TextFieldStyled
                    label={t('Key')}
                    name='key'
                    fullWidth
                    value={label.key}
                    onChange={e => handleFormChange(e, index, 'add_labels')}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextFieldStyled
                    label={t('Value')}
                    name='value'
                    fullWidth
                    value={label.value}
                    onChange={e => handleFormChange(e, index, 'add_labels')}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton color='secondary' onClick={() => removeLabelEntry(index)}>
                    <Icon icon='mdi:delete-outline' />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              startIcon={<Icon icon='mdi:plus-circle-outline' />}
              onClick={addLabelEntry}
              sx={{ mt: 2, color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
            >
              {t('Add Label')}
            </Button>
          </Fragment>
        )
      case 2:
        return (
          <Fragment>
            <Typography variant='h6' sx={{ mt: 2 }}>
              {t('Review Your Changes')}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Typography variant='subtitle1'>
                  <strong>{t('Namespace')}:</strong> {ruleForm.namespace}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>{t('Rule Name')}:</strong> {ruleForm.name}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>{t('Description')}:</strong> {ruleForm.description}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>{t('Condition')}:</strong>
                </Typography>
                <Box
                  component='pre'
                  p={2}
                  bgcolor={theme.palette.action.hover}
                  sx={{ borderRadius: 1, whiteSpace: 'pre-wrap' }}
                >
                  {ruleForm.condition}
                </Box>
                <Typography variant='subtitle1'>
                  <strong>{t('Suppress Alert')}:</strong> {ruleForm.actionSuppress ? t('Yes') : t('No')}
                </Typography>
                {ruleForm.add_labels.length > 0 && (
                  <Box>
                    <Typography variant='subtitle1'>
                      <strong>{t('Add Labels')}:</strong>
                    </Typography>
                    {ruleForm.add_labels.map((label, index) => (
                      <Typography key={index}>
                        {label.key}: {label.value}
                      </Typography>
                    ))}
                  </Box>
                )}
                {ruleForm.actionSuppress && selectedSuppressionWindows.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant='subtitle1'>
                      <strong>{t('Suppression Windows')}:</strong>
                    </Typography>
                    <List>
                      {selectedSuppressionWindows.map((window, index) => {
                        const windowDetails = availableSuppressionWindows.find(w => w.id === window.id)

                        return (
                          <ListItem key={index}>
                            <ListItemText
                              primary={windowDetails?.name}
                              secondary={windowDetails?.description || t('No description')}
                            />
                          </ListItem>
                        )
                      })}
                    </List>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Fragment>
        )
      default:
        return 'Unknown Step'
    }
  }

  // Fetch available suppression windows
  useEffect(() => {
    const fetchSuppressionWindows = async () => {
      setIsLoadingWindows(true)
      try {
        const response = await axios.get('/api/suppressions')
        setAvailableSuppressionWindows(response.data.windows)
        console.log('Available Suppression Windows:', response.data.windows)
      } catch (error) {
        console.error('Error fetching suppression windows:', error)
        toast.error('Failed to fetch suppression windows')
      } finally {
        setIsLoadingWindows(false)
      }
    }

    fetchSuppressionWindows()
  }, [])

  // Initialize selected suppression windows when rule or availableSuppressionWindows change
  useEffect(() => {
    if (rule && rule.suppression_window_ids && availableSuppressionWindows.length > 0) {
      const selectedWindows = rule.suppression_window_ids
        .map(windowId => {
          const windowDetails = availableSuppressionWindows.find(w => w.id === windowId)

          return windowDetails ? { ...windowDetails, id: windowId } : null
        })
        .filter(Boolean) // Remove any null values

      setSelectedSuppressionWindows(selectedWindows)
      console.log('Selected Suppression Windows:', selectedWindows)
    }
  }, [rule, availableSuppressionWindows])

  // Synchronize suppression_window_ids with selectedSuppressionWindows
  useEffect(() => {
    const updatedIds = selectedSuppressionWindows.map(window => window.id).filter(Boolean)
    setRuleForm(prev => ({
      ...prev,
      suppression_window_ids: updatedIds
    }))
  }, [selectedSuppressionWindows])

  // Initialize form with existing suppression windows
  useEffect(() => {
    if (rule && rule.suppression_windows) {
      // Convert existing suppression windows to the format expected by the form
      const existingWindows = rule.suppression_windows.map(window => ({
        id: window.id,
        name: window.name
      }))
      setSelectedSuppressionWindows(existingWindows)
    }
  }, [rule])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {t('Update Rule')}
          </Typography>
          <Typography
            noWrap
            variant='caption'
            sx={{
              color:
                theme.palette.mode === 'light'
                  ? theme.palette.customColors.brandBlack
                  : theme.palette.customColors.brandYellow
            }}
          >
            {ruleForm.namespace.toUpperCase()} - {ruleForm.name.toUpperCase()}
          </Typography>
        </Box>
        <IconButton
          size='small'
          onClick={onClose}
          sx={{ position: 'absolute', right: theme.spacing(2), top: theme.spacing(2) }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* Added content above the stepper */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 3 }}>
            {t('Update Rule Information')}
          </Typography>
          <Typography variant='body2'>{t('Information submitted will be effective immediately.')}</Typography>
        </Box>

        <StepperWrapper>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => {
              return (
                <Step key={index}>
                  <StepLabel StepIconComponent={StepperCustomDot}>
                    <div className='step-label'>
                      <div>
                        <Typography className='step-title'>{t(step.title)}</Typography>
                        <Typography
                          className='step-subtitle'
                          style={{
                            color:
                              theme.palette.mode === 'dark'
                                ? theme.palette.customColors.brandYellow
                                : theme.palette.secondary.light
                          }}
                        >
                          {t(step.subtitle)}
                        </Typography>
                      </div>
                    </div>
                  </StepLabel>
                </Step>
              )
            })}
          </Stepper>
        </StepperWrapper>

        {/* Add spacing between StepperWrapper and form content */}
        <Box sx={{ mt: 4 }} />

        {/* Wrap the form content in a Box with padding */}
        <Box sx={{ paddingLeft: theme.spacing(5), paddingRight: theme.spacing(5) }}>
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
                  {t('Back')}
                </Button>
                <Button size='large' variant='contained' onClick={handleNext}>
                  {activeStep === steps.length - 1 ? t('Submit') : t('Next')}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateRuleForm
