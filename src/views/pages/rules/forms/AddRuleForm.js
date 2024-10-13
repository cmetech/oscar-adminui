// src/views/pages/rules/forms/AddRuleForm.js

// ** React Imports
import React, { Fragment, useEffect, useState } from 'react'

import { useSetAtom } from 'jotai'
import { refetchRulesTriggerAtom } from 'src/lib/atoms'

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
  IconButton
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

// ** Validation schemas for each step
const stepValidationSchemas = [
  // Step 0: Define Namespace
  yup.object().shape({
    namespace: yup.string().required('Namespace is required')
  }),
  // Step 1: Rule Details
  yup.object().shape({
    name: yup.string().required('Rule name is required'),
    description: yup.string(),
    condition: yup.string().required('Condition is required'),
    actionSuppress: yup.boolean()
  }),
  // Step 2: Add Labels
  yup.object().shape({
    add_labels: yup.array().of(
      yup.object().shape({
        key: yup.string().required('Label key is required'),
        value: yup.string().required('Label value is required')
      })
    )
  })
]

// ** Steps for the wizard
const steps = [
  {
    title: 'Namespace',
    subtitle: 'Define Namespace',
    description: 'Specify the namespace for the rule.'
  },
  {
    title: 'General',
    subtitle: 'Rule Details',
    description: 'Enter rule name, condition, description, and actions.'
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

const AddRuleForm = ({ open, onClose }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [activeStep, setActiveStep] = useState(0)
  const [formErrors, setFormErrors] = useState({})
  const setRefetchTrigger = useSetAtom(refetchRulesTriggerAtom)

  const [ruleForm, setRuleForm] = useState({
    namespace: '',
    name: '',
    description: '',
    condition: '',
    actionSuppress: false,
    add_labels: []
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

  // ** Submit the form
  const submitRule = async () => {
    try {
      // Transform add_labels array into an object
      const labelsObject = ruleForm.add_labels.reduce((acc, label) => {
        acc[label.key] = label.value

        return acc
      }, {})

      const payload = {
        namespace: ruleForm.namespace,
        name: ruleForm.name,
        description: ruleForm.description,
        condition: ruleForm.condition,
        actions: {
          suppress: ruleForm.actionSuppress,
          add_labels: labelsObject
        }
      }

      await axios.post('/api/rules/add', payload) // Updated endpoint
      toast.success(t('Successfully added rule'))
      setRefetchTrigger(prev => prev + 1)
      onClose()
    } catch (error) {
      console.error('Failed to add rule', error)
      toast.error(t('Failed to add rule'))
    }
  }

  // ** Render functions for each step
  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Fragment>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextFieldStyled
                  required
                  label={t('Namespace')}
                  name='namespace'
                  fullWidth
                  value={ruleForm.namespace}
                  onChange={handleFormChange}
                  error={Boolean(formErrors?.namespace)}
                  helperText={formErrors?.namespace}
                />
              </Grid>
            </Grid>
          </Fragment>
        )
      case 1:
        return (
          <Fragment>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextFieldStyled
                  required
                  label={t('Rule Name')}
                  name='name'
                  fullWidth
                  value={ruleForm.name}
                  onChange={handleFormChange}
                  error={Boolean(formErrors?.name)}
                  helperText={formErrors?.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
                  required
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
          </Fragment>
        )
      case 2:
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
      case 3:
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
              </Grid>
            </Grid>
          </Fragment>
        )
      default:
        return 'Unknown Step'
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {t('Add Rule')}
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
            {t('Add Rule Information')}
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

export default AddRuleForm
