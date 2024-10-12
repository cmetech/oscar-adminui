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
  DialogActions
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import * as yup from 'yup'

const stepValidationSchemas = [
  // Step 0: Rule Details
  yup.object().shape({
    name: yup.string().required('Rule name is required'),
    description: yup.string(),
    condition: yup.string().required('Condition is required'),
    actionSuppress: yup.boolean(),
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
    title: 'Rule Details',
    description: 'Update rule name, condition, description, and actions'
  },
  {
    title: 'Review',
    description: 'Review the rule before submitting'
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
    actionSuppress: rule.suppress || false,
    add_labels: rule.add_labels ? Object.entries(rule.add_labels).map(([key, value]) => ({ key, value })) : []
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
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  label={t('Namespace')}
                  name='namespace'
                  fullWidth
                  value={ruleForm.namespace}
                  InputProps={{
                    readOnly: true
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
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
                <TextField
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
                <TextField
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
                    <Checkbox
                      checked={ruleForm.actionSuppress}
                      onChange={handleFormChange}
                      name='actionSuppress'
                      color='primary'
                    />
                  }
                  label={t('Suppress Alert')}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1'>{t('Add Labels')}</Typography>
                {ruleForm.add_labels.map((label, index) => (
                  <Grid container spacing={1} key={index}>
                    <Grid item xs={5}>
                      <TextField
                        label={t('Key')}
                        name='key'
                        fullWidth
                        value={label.key}
                        onChange={e => handleFormChange(e, index, 'add_labels')}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        label={t('Value')}
                        name='value'
                        fullWidth
                        value={label.value}
                        onChange={e => handleFormChange(e, index, 'add_labels')}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Button color='secondary' onClick={() => removeLabelEntry(index)}>
                        <Icon icon='mdi:delete-outline' />
                      </Button>
                    </Grid>
                  </Grid>
                ))}
                <Button startIcon={<Icon icon='mdi:plus-circle-outline' />} onClick={addLabelEntry} sx={{ mt: 2 }}>
                  {t('Add Label')}
                </Button>
              </Grid>
            </Grid>
          </Fragment>
        )
      case 1:
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
                <Box component='pre' p={2} bgcolor={theme.palette.action.hover} sx={{ borderRadius: 1 }}>
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
        {t('Update Rule')}
        <Icon
          icon='mdi:close'
          onClick={onClose}
          fontSize={24}
          style={{
            cursor: 'pointer',
            position: 'absolute',
            right: theme.spacing(2),
            top: theme.spacing(2)
          }}
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
                <Button size='large' variant='contained' onClick={handleNext}>
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

export default UpdateRuleForm
