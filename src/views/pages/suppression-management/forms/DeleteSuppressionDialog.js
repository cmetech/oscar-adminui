import React from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

const DeleteSuppressionDialog = ({ open, onClose, suppressionId, onSuccess }) => {
  const { t } = useTranslation()

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/suppressions/${suppressionId}`)
      toast.success(t('Suppression deleted successfully'))
      onSuccess()
    } catch (error) {
      console.error('Error deleting suppression:', error)
      toast.error(t('Failed to delete suppression'))
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('Confirm Deletion')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('Are you sure you want to delete this suppression?')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined' color='secondary'>
          {t('Cancel')}
        </Button>
        <Button onClick={handleDelete} variant='contained' color='error'>
          {t('Delete')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteSuppressionDialog
