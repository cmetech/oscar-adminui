// src/views/pages/rules/ImportRulesDialog.js
import React, { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const ImportRulesDialog = ({ open, onClose }) => {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = event => {
    setFile(event.target.files[0])
  }

  const handleSubmit = async () => {
    if (!file) {
      toast.error(t('Please select a file'))

      return
    }
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      await axios.post('/api/rules/upload', formData)
      toast.success(t('Successfully imported rules'))
      onClose()
    } catch (error) {
      console.error('Failed to import rules', error)
      toast.error(t('Failed to import rules'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        {t('Import Rules')}
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8
          }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant='body1'>{t('Select an Excel file to import rules')}</Typography>
        <input type='file' accept='.xlsx' onChange={handleFileChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined' color='secondary'>
          {t('Cancel')}
        </Button>
        <Button onClick={handleSubmit} variant='contained' color='primary' disabled={loading}>
          {t('Import')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ImportRulesDialog
