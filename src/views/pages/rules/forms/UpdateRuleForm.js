// src/views/pages/rules/forms/UpdateRuleForm.js
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
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material'
import { useTheme, styled } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import * as yup from 'yup'
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
    subtitle: 'Information',
    description: 'Update the rule details.'
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

  const [ruleForm, setRuleForm] = useState({
    namespace: rule.namespace || '',
    name: rule.name || '',
    description: rule.description || '',
    condition: rule.condition || '',
    actionSuppress: rule.actions?.suppress || false,
    add_labels: rule.actions?.add_labels
      ? Object.entries(rule.actions.add_labels).map(([key, value]) => ({ key, value }))
      : []
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
        newForm[section][index][name] = value
      } else {
        if (target.type === 'checkbox') {
          value = target.checked
        }
        newForm[name] = value
      }

      return newForm
    })
  }

  const addLabelEntry = () => {
    setRuleForm(prevForm => ({
      ...prevForm,
      add_labels: [...prevForm.add_labels, { key: '', value: '' }]
    }))
  }

  const removeLabelEntry = index => {
    setRuleForm(prevForm => {
      const updatedLabels = [...prevForm.add_labels]
      updatedLabels.splice(index, 1)

      return { ...prevForm, add_labels: updatedLabels }
    })
  }

  // ** Handle Stepper
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = async () => {
    const currentStepSchema = stepValidationSchemas[activeStep]
    try {
      await currentStepSchema.validate(ruleForm, { abortEarly: false })
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

  const submitRule = async () => {
    try {
      const actions = {
        suppress: ruleForm.actionSuppress,
        add_labels: ruleForm.add_labels.reduce((acc, label) => {
          acc[label.key] = label.value

          return acc
        }, {})
      }

      const updatedRule = {
        name: ruleForm.name,
        description: ruleForm.description,
        condition: ruleForm.condition,
        actions
      }

      await axios.put(`/api/rules/update/${encodeURIComponent(ruleForm.name)}`, updatedRule)
      toast.success(t('Successfully updated rule'))
      onClose()
    } catch (error) {
      console.error('Failed to update rule', error)
      toast.error(t('Failed to update rule'))
    }
  }

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
                />
                {formErrors.condition && (
                  <Typography color='error' variant='caption'>
                    {t(formErrors.condition)}
                  </Typography>
                )}
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
      case 1:
        return (
          <Fragment>
            <Typography variant='h6' sx={{ mt: 2 }}>
              {t('Add Labels')}
            </Typography>
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
        <form onSubmit={e => e.preventDefault()}>
          {getStepContent(activeStep)}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Button
                size='large'
                variant='outlined'
                color='secondary'
                disabled={activeStep === 0}
                onClick={handleBack}
                fullWidth
              >
                {t('Back')}
              </Button>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              {activeStep < steps.length - 1 && (
                <Button size='large' variant='contained' onClick={handleNext} fullWidth>
                  {t('Next')}
                </Button>
              )}
              {activeStep === steps.length - 1 && (
                <Button size='large' variant='contained' onClick={handleNext} fullWidth>
                  {t('Submit')}
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateRuleForm
