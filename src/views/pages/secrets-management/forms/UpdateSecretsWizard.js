import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  IconButton
} from '@mui/material'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useTheme, styled } from '@mui/material/styles'
import StepperWrapper from 'src/@core/styles/mui/stepper'
import StepperCustomDot from 'src/views/pages/misc/forms/StepperCustomDot'
import Icon from 'src/@core/components/icon'

const steps = [
  {
    title: 'Edit Secret',
    subtitle: 'Modify secret details',
    description: 'Edit the secret value.'
  },
  {
    title: 'Review',
    subtitle: 'Confirm changes',
    description: 'Review the updated secret before submission.'
  }
]

const TextFieldStyled = styled(TextField)(({ theme }) => ({
  '& label.Mui-focused': {
    color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
    }
  }
}))

const StepLabelStyled = styled(StepLabel)(({ theme }) => ({
  '& .MuiStepLabel-label': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
}))

const UpdateSecretsWizard = ({ secretData, onSuccess, onClose }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [activeStep, setActiveStep] = useState(0)
  const [secretForm, setSecretForm] = useState({
    path: '',
    key: '',
    value: ''
  })

  useEffect(() => {
    if (secretData) {
      setSecretForm({
        path: secretData.path,
        key: secretData.key,
        value: secretData.value
      })
    }
  }, [secretData])

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setSecretForm(prevForm => ({
      ...prevForm,
      [name]: value
    }))
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleSubmit = async () => {
    try {
      await axios.post('/api/secrets', {
        path: secretForm.path,
        secret: { [secretForm.key]: secretForm.value }
      })
      toast.success(t('Secret updated successfully'))
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating secret:', error)
      toast.error(t('Failed to update secret'))
    }
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextFieldStyled
                  fullWidth
                  label={t('Path')}
                  name="path"
                  value={secretForm.path}
                  onChange={handleFormChange}
                  margin="normal"
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextFieldStyled
                  fullWidth
                  label={t('Key')}
                  name="key"
                  value={secretForm.key}
                  onChange={handleFormChange}
                  margin="normal"
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextFieldStyled
                  fullWidth
                  label={t('Value')}
                  name="value"
                  value={secretForm.value}
                  onChange={handleFormChange}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        )
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>{t('Review Secret')}</Typography>
            <Typography><strong>{t('Path')}:</strong> {secretForm.path}</Typography>
            <Typography><strong>{t('Key')}:</strong> {secretForm.key}</Typography>
            <Typography><strong>{t('Value')}:</strong> {secretForm.value}</Typography>
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <>
      <DialogTitle>{t('Update Secret')}</DialogTitle>
      <DialogContent>
        <IconButton
          size='small'
          onClick={onClose}
          sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
        <StepperWrapper>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabelStyled StepIconComponent={StepperCustomDot}>
                  <Typography className='step-title'>{t(step.title)}</Typography>
                  <Typography
                    className='step-subtitle'
                    variant='caption'
                    style={{
                      color: theme.palette.mode === 'dark'
                        ? theme.palette.customColors.brandYellow
                        : theme.palette.secondary.light
                    }}
                  >
                    {t(step.subtitle)}
                  </Typography>
                </StepLabelStyled>
              </Step>
            ))}
          </Stepper>
        </StepperWrapper>
        <Card sx={{ mt: 4, minHeight: 400, boxShadow: 'none', border: 'none' }}>
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {t(steps[activeStep].title)}
                </Typography>
                <Typography
                  variant='caption'
                  component='p'
                  paddingBottom={5}
                  className='step-subtitle'
                  style={{
                    color: theme.palette.mode === 'dark'
                      ? theme.palette.customColors.brandYellow
                      : theme.palette.secondary.light
                  }}
                >
                  {t(steps[activeStep].description)}
                </Typography>
              </Grid>
              {renderStepContent(activeStep)}
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
                <Button
                  size='large'
                  variant='contained'
                  onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                >
                  {activeStep === steps.length - 1 ? t('Submit') : t('Next')}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </DialogContent>
    </>
  )
}

export default UpdateSecretsWizard
