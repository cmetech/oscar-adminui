import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'

const UpdateSuppressionForm = ({ open, onClose, suppressionId, onSuccess }) => {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const fetchSuppressionDetails = async () => {
    try {
      const response = await axios.get(`/api/suppressions/${suppressionId}`)
      setName(response.data.name)
      setDescription(response.data.description)
    } catch (error) {
      console.error('Error fetching suppression details:', error)
      toast.error(t('Failed to fetch suppression details'))
    }
  }

  useEffect(() => {
    if (suppressionId) {
      fetchSuppressionDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suppressionId])

  const handleSubmit = async () => {
    try {
      await axios.put(`/api/suppressions/${suppressionId}`, {
        name,
        description
      })
      toast.success(t('Suppression updated successfully'))
      onSuccess()
    } catch (error) {
      console.error('Error updating suppression:', error)
      toast.error(t('Failed to update suppression'))
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        {t('Update Suppression')}
        <IconButton
          size='small'
          onClick={onClose}
          sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label={t('Name')}
          value={name}
          onChange={e => setName(e.target.value)}
          margin='normal'
        />
        <TextField
          fullWidth
          label={t('Description')}
          value={description}
          onChange={e => setDescription(e.target.value)}
          margin='normal'
          multiline
          rows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined' color='secondary'>
          {t('Cancel')}
        </Button>
        <Button onClick={handleSubmit} variant='contained'>
          {t('Update')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UpdateSuppressionForm
