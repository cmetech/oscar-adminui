import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Grid,
  Card,
  CardContent
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useTheme, styled } from '@mui/material/styles'
import StepperWrapper from 'src/@core/styles/mui/stepper'
import StepperCustomDot from 'src/views/pages/misc/forms/StepperCustomDot'

const steps = [
  {
    title: 'Add Secrets',
    subtitle: 'Enter secret details',
    description: 'Add one or more secrets with their respective paths, keys, and values.'
  },
  {
    title: 'Review',
    subtitle: 'Confirm details',
    description: 'Review the entered secrets before submission.'
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

const AddSecretsWizard = ({ onSuccess, onClose }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [activeStep, setActiveStep] = useState(0)
  const [secrets, setSecrets] = useState([{ path: '', key: '', value: '' }])

  const handleFormChange = (index, event) => {
    const { name, value } = event.target
    const newSecrets = [...secrets]
    newSecrets[index] = { ...newSecrets[index], [name]: value }
    setSecrets(newSecrets)
  }

  const handleAddSecret = () => {
    setSecrets([...secrets, { path: '', key: '', value: '' }])
  }

  const handleRemoveSecret = (index) => {
    const newSecrets = secrets.filter((_, i) => i !== index)
    setSecrets(newSecrets)
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleSubmit = async () => {
    try {
      for (const secret of secrets) {
        await axios.post('/api/secrets', {
          path: secret.path,
          secret: { [secret.key]: secret.value }
        })
      }
      toast.success(t('Secrets added successfully'))
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error adding secrets:', error)
      toast.error(t('Failed to add secrets'))
    }
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            {secrets.map((secret, index) => (
              <Grid container spacing={2} key={index} alignItems="center">
                <Grid item xs={3}>
                  <TextFieldStyled
                    fullWidth
                    label={t('Path')}
                    name="path"
                    value={secret.path}
                    onChange={(e) => handleFormChange(index, e)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextFieldStyled
                    fullWidth
                    label={t('Key')}
                    name="key"
                    value={secret.key}
                    onChange={(e) => handleFormChange(index, e)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextFieldStyled
                    fullWidth
                    label={t('Value')}
                    name="value"
                    value={secret.value}
                    onChange={(e) => handleFormChange(index, e)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton onClick={() => handleRemoveSecret(index)} disabled={secrets.length === 1}>
                    <Icon icon="mdi:minus-circle-outline" />
                  </IconButton>
                  {index === secrets.length - 1 && (
                    <IconButton onClick={handleAddSecret}>
                      <Icon icon="mdi:plus-circle-outline" />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            ))}
            <Box mt={2}>
              <Button
                startIcon={<Icon icon="mdi:plus-circle-outline" />}
                onClick={handleAddSecret}
                style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
              >
                {t('Add Secret')}
              </Button>
            </Box>
          </Box>
        )
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>{t('Review Secrets')}</Typography>
            {secrets.map((secret, index) => (
              <Box key={index} mb={2}>
                <Typography><strong>{t('Path')}:</strong> {secret.path}</Typography>
                <Typography><strong>{t('Key')}:</strong> {secret.key}</Typography>
                <Typography><strong>{t('Value')}:</strong> {secret.value}</Typography>
              </Box>
            ))}
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <>
      <DialogTitle>{t('Add Secrets')}</DialogTitle>
      <DialogContent>
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

export default AddSecretsWizard
