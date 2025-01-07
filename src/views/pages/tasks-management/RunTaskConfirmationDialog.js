import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Button,
  Typography,
  IconButton,
  TextField
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'
import axios from 'axios'
import { parseInt } from 'lodash' // Or just native parseInt
import { useTranslation } from 'react-i18next'
import { styled, useTheme } from '@mui/material/styles'

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

const RunTaskConfirmationDialog = ({ open, onClose, currentTask }) => {
  const { t } = useTranslation()
  const [runDelay, setRunDelay] = useState('')
  const [runDelayError, setRunDelayError] = useState('')

  // Reset whenever the dialog opens or closes
  useEffect(() => {
    if (!open) {
      setRunDelay('')
      setRunDelayError('')
    }
  }, [open])

  const validateDelay = value => {
    if (value === '') return true // Allow empty value
    const isInteger = /^\d+$/.test(value)
    if (!isInteger) {
      setRunDelayError('Delay must be a positive integer')

      return false
    }
    setRunDelayError('')

    return true
  }

  const handleSubmit = async () => {
    // If user typed something invalid, don’t let them proceed
    if (!validateDelay(runDelay)) return

    const taskId = currentTask?.id
    if (!taskId) {
      console.error('Task ID is undefined')
      toast.error(t('Task ID is undefined or invalid'))

      return
    }

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${apiToken}`
    }

    try {
      const endpoint = `/api/tasks/run/${taskId}`

      const payload = {
        prompts: [],
        user_data: runDelay ? { __delay__: parseInt(runDelay) } : null
      }

      const response = await axios.post(endpoint, payload, { headers })
      if (response.status === 200) {
        toast.success(t('Task Successfully Run'))
      } else {
        toast.error(t('Failed to Run Task'))
      }
    } catch (error) {
      console.error(t('Failed to Run Task'), error)
      toast.error(t('Failed to Run Task'))
    }
    onClose() // Close dialog after run
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby='run-task-dialog-title'
      aria-describedby='run-task-dialog-description'
      PaperProps={{
        sx: { width: '100%', maxWidth: '450px' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {t('Run Task')}
          </Typography>
          <IconButton size='small' onClick={onClose} aria-label='close'>
            <Icon icon='mdi:close' />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center' }}>
          <Stack direction='column' spacing={3}>
            <Typography variant='h6'>{t('Confirm you want to run this task.')}</Typography>
            <TextfieldStyled
              fullWidth
              id='task-delay'
              label={t('Delay in seconds (optional)')}
              value={runDelay}
              onChange={e => {
                setRunDelay(e.target.value)
                validateDelay(e.target.value)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              error={!!runDelayError}
              helperText={runDelayError || t('Leave empty for no delay')}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                autoComplete: 'off'
              }}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant='contained'
          size='large'
          onClick={handleSubmit}
          color='primary'
          startIcon={<Icon icon='mdi:play' />}
          disabled={!!runDelayError}
        >
          {t('Run')}
        </Button>
        <Button
          variant='outlined'
          size='large'
          onClick={onClose}
          color='secondary'
          startIcon={<Icon icon='mdi:close' />}
        >
          {t('Cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RunTaskConfirmationDialog
