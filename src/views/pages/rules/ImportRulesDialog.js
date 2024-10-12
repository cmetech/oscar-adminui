// src/views/pages/rules/ImportRulesDialog.js
import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  LinearProgress
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const ImportRulesDialog = ({ open, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handleButtonClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = event => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFileName(selectedFile.name)
    } else {
      setFile(null)
      setFileName('')
    }
  }

  const handleClose = () => {
    setFile(null)
    setFileName('')
    setUploadProgress(0)
    setIsUploading(false)
    onClose()
  }

  const handleSubmit = async () => {
    if (!file) {
      toast.error(t('Please select a file to upload.'))

      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    let simulateProcessing = null

    try {
      let simulatedProgress = 0

      simulateProcessing = setInterval(() => {
        simulatedProgress += Math.random() * 10
        if (simulatedProgress >= 90) {
          simulatedProgress = 90
        }
        setUploadProgress(simulatedProgress)
      }, 500)

      const response = await axios.post('/api/rules/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      clearInterval(simulateProcessing)
      setUploadProgress(100)

      if (response.status === 200) {
        toast.success(t('Successfully imported rules'))
        if (onSuccess) onSuccess()
        setTimeout(() => {
          handleClose()
        }, 1000)
      } else {
        toast.error(t('Failed to import rules'))
      }
    } catch (error) {
      if (simulateProcessing) {
        clearInterval(simulateProcessing)
      }
      console.error('Failed to import rules:', error)
      toast.error(t('Failed to import rules'))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('Upload Rules')}</DialogTitle>
      <DialogContent>
        <IconButton size='small' onClick={handleClose} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
          <Icon icon='mdi:close' />
        </IconButton>
        {/* Hidden file input */}
        <input type='file' ref={fileInputRef} onChange={handleFileChange} accept='.xlsx' style={{ display: 'none' }} />
        {/* Custom styled button */}
        <Button onClick={handleButtonClick} size='large' variant='contained' color='primary' disabled={isUploading}>
          {t('Choose File')}
        </Button>
        {fileName && (
          <Typography variant='subtitle1' sx={{ mt: 2 }}>
            {t('Selected file:')} {fileName}
          </Typography>
        )}

        {isUploading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant='determinate' value={uploadProgress} />
            <Typography variant='subtitle2' align='center'>
              {Math.round(uploadProgress)}% {t('uploaded')}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          size='large'
          variant='outlined'
          color='secondary'
          startIcon={<Icon icon='mdi:close' />}
          disabled={isUploading}
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          size='large'
          variant='contained'
          color='warning'
          startIcon={<Icon icon='mdi:upload-multiple' />}
          disabled={isUploading || !file}
        >
          {isUploading ? t('Importing...') : t('Upload')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ImportRulesDialog
