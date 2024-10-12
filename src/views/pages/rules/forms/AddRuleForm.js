// src/views/pages/rules/forms/AddRuleForm.js
import React, { Fragment, useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import * as yup from 'yup'

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
    actions: yup.object().shape({
      suppress: yup.boolean(),
      add_labels: yup.array().of(
        yup.object().shape({
          key: yup.string().required('Label key is required'),
          value: yup.string().required('Label value is required')
        })
      )
    })
  })
]

// ** Steps for the wizard
const steps = [
  {
    title: 'Define Namespace',
    description: 'Specify the namespace for the rule'
  },
  {
    title: 'Rule Details',
    description: 'Enter rule name, condition, description, and actions'
  },
  {
    title: 'Review',
    description: 'Review the rule before submitting'
  }
]

const AddRuleForm = ({ open, onClose }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [activeStep, setActiveStep] = useState(0)

  const [ruleForm, setRuleForm] = useState({
    namespace: '',
    name: '',
    description: '',
    condition: '',
    actions: {
      suppress: false,
      add_labels: []
    }
  })
  const [formErrors, setFormErrors] = useState({})

  // ** Handle form input changes
  const handleFormChange = (event, index, section) => {
    const target = event.target || event
    const name = target.name
    let value = target.value

    setRuleForm(prevForm => {
      const newForm = { ...prevForm }

      if (index !== undefined && section) {
        newForm.actions[section][index][name] = value
      } else if (section) {
        newForm.actions[section] = value
      } else {
        // Top-level field updates
        newForm[name] = value
      }

      return newForm
    })
  }

  // ** Validation function
  const validateForm = async () => {
    try {
      const validationSchema = stepValidationSchemas[activeStep]
      await validationSchema.validate(ruleForm, { abortEarly: false })
      setFormErrors({})

      return true
    } catch (yupError) {
      if (yupError.inner) {
        const transformedErrors = yupError.inner.reduce(
          (acc, currentError) => ({
            ...acc,
            [currentError.path]: currentError.message
          }),
          {}
        )
        setFormErrors(transformedErrors)
      } else {
        setFormErrors({ general: yupError.message || 'An unknown error occurred' })
      }

      return false
    }
  }

  // ** Navigation handlers
  const handleNext = async () => {
    const isValid = await validateForm()
    if (isValid) {
      setActiveStep(prevActiveStep => prevActiveStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
    setRuleForm({
      namespace: '',
      name: '',
      description: '',
      condition: '',
      actions: {
        suppress: false,
        add_labels: []
      }
    })
    setFormErrors({})
  }

  // ** Handlers for dynamic add_labels
  const addLabelEntry = () => {
    setRuleForm(prevForm => ({
      ...prevForm,
      actions: {
        ...prevForm.actions,
        add_labels: [...prevForm.actions.add_labels, { key: '', value: '' }]
      }
    }))
  }

  const removeLabelEntry = index => {
    const updatedLabels = [...ruleForm.actions.add_labels]
    updatedLabels.splice(index, 1)
    setRuleForm(prevForm => ({
      ...prevForm,
      actions: {
        ...prevForm.actions,
        add_labels: updatedLabels
      }
    }))
  }

  // ** Submit the form
  const submitRule = async () => {
    try {
      // Transform add_labels array into an object
      const labelsObject = ruleForm.actions.add_labels.reduce((acc, label) => {
        acc[label.key] = label.value

        return acc
      }, {})

      const payload = {
        namespace: ruleForm.namespace,
        name: ruleForm.name,
        description: ruleForm.description,
        condition: ruleForm.condition,
        actions: {
          suppress: ruleForm.actions.suppress,
          add_labels: labelsObject
        }
      }

      await axios.post('/api/rules', payload)
      toast.success(t('Successfully added rule'))
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
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
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
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
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
              <Grid item xs={12}>
                <TextField
                  label={t('Description')}
                  name='description'
                  fullWidth
                  multiline
                  rows={2}
                  value={ruleForm.description}
                  onChange={handleFormChange}
                  error={Boolean(formErrors?.description)}
                  helperText={formErrors?.description}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  label={t('Condition')}
                  name='condition'
                  fullWidth
                  multiline
                  rows={4}
                  value={ruleForm.condition}
                  onChange={handleFormChange}
                  error={Boolean(formErrors?.condition)}
                  helperText={formErrors?.condition}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ruleForm.actions.suppress}
                      onChange={e =>
                        handleFormChange({ target: { name: 'suppress', value: e.target.checked } }, null, 'suppress')
                      }
                      name='suppress'
                      color='primary'
                    />
                  }
                  label={t('Suppress Alert')}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom>
                  {t('Add Labels')}
                </Typography>
                {ruleForm.actions.add_labels.map((entry, index) => (
                  <Grid container spacing={2} key={index} alignItems='center'>
                    <Grid item xs={5}>
                      <TextField
                        label={t('Label Key')}
                        name='key'
                        fullWidth
                        value={entry.key}
                        onChange={e => handleFormChange(e, index, 'add_labels')}
                        error={Boolean(formErrors?.[`actions.add_labels[${index}].key`])}
                        helperText={formErrors?.[`actions.add_labels[${index}].key`]}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        label={t('Label Value')}
                        name='value'
                        fullWidth
                        value={entry.value}
                        onChange={e => handleFormChange(e, index, 'add_labels')}
                        error={Boolean(formErrors?.[`actions.add_labels[${index}].value`])}
                        helperText={formErrors?.[`actions.add_labels[${index}].value`]}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Icon
                        icon='mdi:minus-circle-outline'
                        fontSize={24}
                        onClick={() => removeLabelEntry(index)}
                        style={{ cursor: 'pointer', color: theme.palette.error.main }}
                      />
                    </Grid>
                  </Grid>
                ))}
                <Button
                  startIcon={<Icon icon='mdi:plus-circle-outline' />}
                  onClick={addLabelEntry}
                  style={{ marginTop: theme.spacing(2) }}
                >
                  {t('Add Label')}
                </Button>
              </Grid>
            </Grid>
          </Fragment>
        )
      case 2:
        return (
          <Fragment>
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
                <Box component='pre' p={2} bgcolor={theme.palette.action.hover}>
                  {ruleForm.condition}
                </Box>
                <Typography variant='subtitle1'>
                  <strong>{t('Suppress Alert')}:</strong> {ruleForm.actions.suppress ? t('Yes') : t('No')}
                </Typography>
                {ruleForm.actions.add_labels.length > 0 && (
                  <Box>
                    <Typography variant='subtitle1'>
                      <strong>{t('Add Labels')}:</strong>
                    </Typography>
                    {ruleForm.actions.add_labels.map((label, index) => (
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

  // ** Main render function
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>
        {t('Add Rule')}
        <Icon
          icon='mdi:close'
          onClick={onClose}
          fontSize={24}
          style={{ cursor: 'pointer', position: 'absolute', right: theme.spacing(2), top: theme.spacing(2) }}
        />
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>{t(step.title)}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <form onSubmit={e => e.preventDefault()}>
          {getStepContent(activeStep)}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item>
              <Button
                size='large'
                variant='outlined'
                color='secondary'
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                {t('Back')}
              </Button>
            </Grid>
            {activeStep < steps.length - 1 && (
              <Grid item>
                <Button size='large' variant='contained' onClick={handleNext}>
                  {t('Next')}
                </Button>
              </Grid>
            )}
            {activeStep === steps.length - 1 && (
              <Grid item>
                <Button size='large' variant='contained' onClick={submitRule}>
                  {t('Submit')}
                </Button>
              </Grid>
            )}
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddRuleForm
