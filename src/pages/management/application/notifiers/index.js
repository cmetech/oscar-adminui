// ** React Imports
import { useContext, useState, useEffect, forwardRef, Fragment, useRef } from 'react'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { notifierIdsAtom, refetchNotifierTriggerAtom } from 'src/lib/atoms'
import { predefinedRangesDayjs, today, todayRounded, yesterdayRounded } from 'src/lib/calendar-timeranges'
import dayjs from 'dayjs'

// ** MUI Imports
import Badge from '@mui/material/Badge'
import Divider from '@mui/material/Divider'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Tab from '@mui/material/Tab'
import MuiTabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Paper from '@mui/material/Paper'
import OutlinedInput from '@mui/material/OutlinedInput'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import LinearProgress from '@mui/material/LinearProgress'
import Fade from '@mui/material/Fade'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { styled, useTheme } from '@mui/material/styles'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'
import { useForm, Controller, get } from 'react-hook-form'
import axios from 'axios'
import { saveAs } from 'file-saver'
import ExcelJS from 'exceljs'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Views
import ActiveNotifiersList from 'src/views/pages/notifiers/ActiveNotifiersList'
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'
import { DateTimeRangePicker } from '@mui/x-date-pickers-pro/DateTimeRangePicker'
import { CustomDateTimeRangePicker } from 'src/lib/styled-components'
import { renderDigitalClockTimeView } from '@mui/x-date-pickers/timeViewRenderers'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// Form Dialog Components
import AddNotifierWizard from 'src/views/pages/notifiers/forms/AddNotifierWizard'
import toast from 'react-hot-toast'
import { useAtom } from 'jotai'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const TabList = styled(MuiTabList)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    minWidth: 65,
    minHeight: 40,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.up('md')]: {
      minWidth: 130
    }
  }
}))

const TextfieldStyled = styled(TextField)(({ theme }) => ({
  '& label.Mui-focused': {
    color: theme.palette.mode == 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.mode == 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
    }
  }
}))

// ** Confirmation Export Modal
const ConfirmationExportModal = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation()

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{t('Confirm Action')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('Are you sure you want to export all selected notifiers?')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          size='large'
          variant='outlined'
          color='secondary'
          startIcon={<Icon icon='mdi:close' />}
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          size='large'
          variant='contained'
          color='warning'
          autoFocus
          startIcon={<Icon icon='mdi:file-export' />}
        >
          {t('Export')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ** More Actions Dropdown
const MoreActionsDropdown = ({ onDelete, onDisable, onEnable, onExport, onImport }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { t } = useTranslation()

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = () => {
    setAnchorEl(null)
  }

  const styles = {
    py: 2,
    px: 4,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2,
      fontSize: '1.375rem',
      color: 'text.secondary'
    }
  }

  return (
    <Fragment>
      <IconButton color='secondary' aria-haspopup='true' onClick={handleDropdownOpen} aria-controls='customized-menu'>
        <Icon icon='mdi:menu' />
      </IconButton>
      <Menu
        id='simple-menu'
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4 } }}
      >
        <MenuItem
          sx={{ p: 0 }}
          onClick={() => {
            onExport()
            handleDropdownClose()
          }}
        >
          <Box sx={styles}>
            <Icon icon='mdi:file-export-outline' />
            {t('Export')}
          </Box>
        </MenuItem>
        <MenuItem
          sx={{ p: 0 }}
          onClick={() => {
            onImport()
            handleDropdownClose()
          }}
        >
          <Box sx={styles}>
            <Icon icon='mdi:file-import-outline' />
            {t('Import')}
          </Box>
        </MenuItem>
        <MenuItem
          sx={{ p: 0 }}
          onClick={() => {
            onDelete()
            handleDropdownClose()
          }}
        >
          <Box sx={styles}>
            <Icon icon='mdi:delete-outline' />
            {t('Delete')}
          </Box>
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

// ** Confirmation Modal
const ConfirmationDeleteModal = ({ isOpen, onClose, onConfirm, tab }) => {
  const { t } = useTranslation()

  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'Active Notifiers'
    }

    return mapping[tabValue] || ''
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{t('Confirm Action')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('Delete all selected?')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          size='large'
          variant='outlined'
          color='secondary'
          startIcon={<Icon icon='mdi:close' />}
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          size='large'
          variant='contained'
          color='error'
          autoFocus
          startIcon={<Icon icon='mdi:delete-forever' />}
        >
          {t('Delete')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ** Confirmation Modal
const ConfirmationDisableModal = ({ isOpen, onClose, onConfirm, tab }) => {
  const { t } = useTranslation()

  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'Active Notifiers'
    }

    return mapping[tabValue] || ''
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{t('Confirm Action')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('Disable all selected?')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          size='large'
          variant='outlined'
          color='secondary'
          startIcon={<Icon icon='mdi:close' />}
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          size='large'
          variant='contained'
          color='warning'
          autoFocus
          startIcon={<Icon icon='mdi:minus-box' />}
        >
          {t('Disable')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const ConfirmationEnableModal = ({ isOpen, onClose, onConfirm, tab }) => {
  const { t } = useTranslation()

  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'Active Notifiers'
    }

    return mapping[tabValue] || ''
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{t('Confirm Action')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('Enable all selected?')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          size='large'
          variant='outlined'
          color='secondary'
          startIcon={<Icon icon='mdi:close' />}
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          size='large'
          variant='contained'
          color='info'
          autoFocus
          startIcon={<Icon icon='mdi:plus-box' />}
        >
          {t('Enable')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Define a simple modal form component
const DynamicDialogForm = ({ open, handleClose, onSubmit, tab }) => {
  const { register, handleSubmit, reset } = useForm()
  const theme = useTheme()

  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'Add Notifier Wizard'
    }

    return mapping[tabValue] || 'Add Notifier Wizard'
  }

  const getDynamicSubTitle = tabValue => {
    const mapping = {
      1: 'Add Notifier Information'
    }

    return mapping[tabValue] || 'Add Information'
  }

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const handleSuccess = () => {
    handleClose()
  }

  const dynamicFields = () => {
    switch (tab) {
      case '1':
        return <AddNotifierWizard onSuccess={handleSuccess} />
      default:
        return <Typography>Form not configured for this tab.</Typography>
    }
  }

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      scroll='body'
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      aria-labelledby='form-dialog-title'
    >
      <DialogTitle id='form-dialog-title'>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography noWrap variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {getDynamicTitle(tab)}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <IconButton
          size='small'
          onClick={() => handleClose()}
          sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 3 }}>
            {getDynamicSubTitle(tab)}
          </Typography>
          <Typography variant='body2'>Information submitted will be effective immediately.</Typography>
        </Box>
        {dynamicFields()}
      </DialogContent>
    </Dialog>
  )
}

// ** Notifier Upload Dialog
const NotifierUploadDialog = ({ open, onClose }) => {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [, setNotifierRefetchTrigger] = useAtom(refetchNotifierTriggerAtom)
  const fileInputRef = useRef(null)
  const { t } = useTranslation()

  const handleButtonClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = event => {
    const file = event.target.files[0]
    if (file) {
      setFile(file)
      setFileName(file.name)
    } else {
      setFile(null)
      setFileName('')
    }
  }

  const resetForm = () => {
    setFile(null)
    setFileName('')
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetForm()
    setIsUploading(false)
    onClose()
  }

  const handleSubmit = async () => {
    if (!file) return

    setIsUploading(true)
    let successCount = 0
    let errorCount = 0
    let skippedCount = 0
    const errors = []

    try {
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(await file.arrayBuffer())
      const worksheet = workbook.worksheets[0]

      // Get headers and validate required columns
      const headers = worksheet.getRow(1).values
      const requiredColumns = ['Name', 'Type']
      const missingColumns = requiredColumns.filter(col => !headers.includes(col))

      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
      }

      // Get column indices
      const nameIndex = headers.indexOf('Name')
      const descriptionIndex = headers.indexOf('Description')
      const typeIndex = headers.indexOf('Type')
      const statusIndex = headers.indexOf('Status')
      const emailAddressesIndex = headers.indexOf('Email Addresses')
      const webhookUrlIndex = headers.indexOf('Webhook URL')

      const totalRows = worksheet.rowCount - 1 // Exclude header row
      let processedRows = 0

      // Process each row
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber).values

        // Skip empty rows
        if (row.length === 0) continue

        try {
          const notifierName = row[nameIndex]

          // Validate name is present
          if (!notifierName) {
            throw new Error('Name is required')
          }

          // Check if notifier already exists
          const existingNotifier = await axios.get(
            `/api/notifiers/lookup?identifier=${encodeURIComponent(notifierName)}&by_name=true`
          )

          if (Object.keys(existingNotifier.data).length > 0) {
            skippedCount++
            console.log(`Skipping existing notifier: ${notifierName}`)
            continue // Skip to next row
          }

          const type = row[typeIndex]?.toLowerCase()
          if (!type || !['email', 'webhook'].includes(type)) {
            throw new Error(`Invalid notifier type: ${type}. Must be 'email' or 'webhook'`)
          }

          const notifier = {
            name: notifierName,
            description: row[descriptionIndex] || '',
            type: type,
            status: row[statusIndex]?.toLowerCase() || 'enabled'
          }

          // Add type-specific fields
          if (type === 'email' && row[emailAddressesIndex]) {
            notifier.email_addresses = row[emailAddressesIndex].split(',').map(email => email.trim())
          } else if (type === 'webhook' && row[webhookUrlIndex]) {
            notifier.webhook_url = row[webhookUrlIndex]
          }

          // Create notifier
          await axios.post('/api/notifiers/add', notifier)
          successCount++
        } catch (error) {
          errorCount++
          errors.push(`Row ${rowNumber}: ${error.message}`)
        }

        // Update progress
        processedRows++
        setUploadProgress((processedRows / totalRows) * 100)
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} notifiers`)
      }
      if (skippedCount > 0) {
        toast.success(`Skipped ${skippedCount} existing notifiers`, {
          style: {
            background: '#3498db',
            color: '#fff'
          }
        })
      }
      if (errorCount > 0) {
        toast.error(`Failed to create ${errorCount} notifiers`)
        errors.forEach(error => toast.error(error))
      }

      setNotifierRefetchTrigger(Date.now())
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error processing file:', error)
      toast.error('Error processing file: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{t('Upload Notifiers')}</DialogTitle>
      <DialogContent>
        <IconButton
          size='small'
          onClick={() => handleClose()}
          sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 3 }}>
            {t('Upload Notifiers')}
          </Typography>
          <Typography variant='body2'>{t('Upload an Excel file containing notifier information.')}</Typography>
        </Box>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          accept='.xlsx,.xls'
          style={{ display: 'none' }}
        />
        <Button
          size='large'
          color='primary'
          variant='contained'
          onClick={handleButtonClick}
          disabled={isUploading}
          startIcon={<Icon icon='mdi:file-upload' />}
        >
          {t('Choose File')}
        </Button>
        {fileName && (
          <Typography variant='subtitle1' sx={{ mt: 2 }}>
            {t('Selected file')}: {fileName}
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
          autoFocus
          startIcon={<Icon icon='mdi:upload-multiple' />}
          disabled={isUploading || !file}
        >
          {isUploading ? t('Uploading...') : t('Upload')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const NotifierManager = () => {
  // ** Hooks
  const ability = useContext(AbilityContext)
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()
  const { t } = useTranslation()
  const theme = useTheme()

  const [value, setValue] = useState('1')
  const [notifierTotal, setNotifierTotal] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false)
  const [isEnableModalOpen, setIsEnableModalOpen] = useState(false)
  const [selectedNotifierIds, setSelectedNotifierIds] = useAtom(notifierIdsAtom)
  const [, setRefetchTrigger] = useAtom(refetchNotifierTriggerAtom)

  const [dateRange, setDateRange] = useState([yesterdayRounded, todayRounded])
  const [onAccept, setOnAccept] = useState(value)

  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [openNotifierUploadDialog, setOpenNotifierUploadDialog] = useState(false)

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const handleDisable = () => {
    setIsDisableModalOpen(true)
  }

  const handleEnable = () => {
    setIsEnableModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  const handleCloseDisableModal = () => {
    setIsDisableModalOpen(false)
  }

  const handleCloseEnableModal = () => {
    setIsEnableModalOpen(false)
  }

  const handleConfirmDelete = async () => {
    console.log('Deleting Notifiers', selectedNotifierIds)

    const deletePromises = selectedNotifierIds.map(notifierId =>
      axios
        .delete(`/api/notifiers/delete/${notifierId}`)
        .then(() => ({ success: true, notifierId }))
        .catch(error => ({ success: false, notifierId, error }))
    )

    try {
      const results = await Promise.all(deletePromises)

      results.forEach(result => {
        if (result.success) {
          toast.success(`Notifier ${result.notifierId} deleted successfully`)
        } else {
          console.error(`Error deleting notifier ${result.notifierId}:`, result.error)
          toast.error(`Failed to delete notifier ${result.notifierId}`)
        }
      })

      setRefetchTrigger(Date.now())

      setSelectedNotifierIds([])
    } catch (error) {
      console.error('Unexpected error during notifier deletion:', error)
      toast.error('An unexpected error occurred during notifier deletion')
    }

    setIsDeleteModalOpen(false)
  }

  const handleConfirmDisable = async () => {
    console.log('Disabling notifiers', selectedNotifierIds)

    try {
      const response = await axios.post('/api/notifiers/disable', selectedNotifierIds)
      const { message, notifier_ids } = response.data

      if (response.status === 200) {
        notifier_ids.forEach(notifierId => {
          toast.success(`${message}: ${notifierId}`)
        })

        setRefetchTrigger(Date.now())

        setIsDisableModalOpen(false)
        setSelectedNotifierIds([])
      } else {
        toast.error('Error disabling notifiers')
      }
    } catch (error) {
      toast.error(`Error disabling notifiers: ${error.response?.data?.message || error.message}`)

      setIsDisableModalOpen(false)
    }
  }

  const handleConfirmEnable = async () => {
    console.log('Enabling notifiers', selectedNotifierIds)

    try {
      const response = await axios.post('/api/notifiers/enable', selectedNotifierIds)

      if (response.status === 200) {
        const { message, notifier_ids } = response.data

        notifier_ids.forEach(notifierId => {
          toast.success(`${message}: ${notifierId}`)
        })

        setRefetchTrigger(Date.now())

        setIsEnableModalOpen(false)
        setSelectedNotifierIds([])
      } else {
        toast.error('Error enabling notifiers')
      }
    } catch (error) {
      toast.error(`Error enabling notifiers: ${error.response?.data?.message || error.message}`)

      setIsEnableModalOpen(false)
    }
  }

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleOpenModal = () => {
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleSuccess = () => {
    handleCloseModal()
  }

  const getDynamicText = tabValue => {
    const mapping = {
      1: t('Notifiers')
    }

    return mapping[tabValue] || 'Item'
  }

  const handleOnAccept = value => {
    console.log('onAccept', value)
    setOnAccept(value)
  }

  const handleExport = () => {
    setIsExportModalOpen(true)
  }

  const handleCloseExportModal = () => {
    setIsExportModalOpen(false)
  }

  const handleImport = () => {
    setOpenNotifierUploadDialog(true)
  }

  const handleConfirmExport = async () => {
    try {
      const response = await axios.get('/api/notifiers')
      const allNotifiers = response.data.records

      // Use selected notifiers if any are selected, otherwise use all notifiers
      const notifiersToExport =
        selectedNotifierIds.length > 0
          ? allNotifiers.filter(notifier => selectedNotifierIds.includes(notifier.id))
          : allNotifiers

      // Create workbook
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Notifiers')

      // Define columns
      worksheet.columns = [
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Description', key: 'description', width: 40 },
        { header: 'Type', key: 'type', width: 20 },
        { header: 'Status', key: 'status', width: 20 },
        { header: 'Email Addresses', key: 'email_addresses', width: 40 },
        { header: 'Webhook URL', key: 'url', width: 60 }
      ]

      // Add data rows
      notifiersToExport.forEach(notifier => {
        worksheet.addRow({
          name: notifier.name,
          description: notifier.description,
          type: notifier.type,
          status: notifier.status,
          email_addresses: notifier.type === 'email' ? notifier.email_addresses?.join(', ') : '',
          url: notifier.type === 'webhook' ? notifier.url : ''
        })
      })

      // Style the header row
      const headerRow = worksheet.getRow(1)
      headerRow.font = { bold: true }
      headerRow.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        }
      })

      // Auto-filter for all columns
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: worksheet.columns.length }
      }

      // Freeze the header row
      worksheet.views = [{ state: 'frozen', ySplit: 1 }]

      // Generate the Excel file
      const buffer = await workbook.xlsx.writeBuffer()

      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      saveAs(blob, `notifiers_export_${new Date().toISOString().split('T')[0]}.xlsx`)

      toast.success(`Successfully exported ${notifiersToExport.length} notifiers`)
      handleCloseExportModal()
    } catch (error) {
      console.error('Error exporting notifiers:', error)
      toast.error('Failed to export notifiers')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={10}>
          <Typography variant='h4'>{t('Notifier Management')}</Typography>
          <Box display='flex' alignItems='center'>
            {value === '1' && (
              <Fragment>
                <Button
                  variant='contained'
                  color='secondary'
                  sx={{ marginRight: 1 }}
                  startIcon={<Icon icon='mdi:plus' />}
                  onClick={handleOpenModal}
                >
                  {getDynamicText(value)}
                </Button>
                <MoreActionsDropdown
                  onDelete={handleDelete}
                  onDisable={handleDisable}
                  onEnable={handleEnable}
                  onExport={handleExport}
                  onImport={handleImport}
                />
              </Fragment>
            )}
          </Box>
        </Box>
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='assets'>
            {notifierTotal == 0 ? (
              <Tab value='1' label={t('Active Notifiers')} icon={<Icon icon='mdi:bell' />} iconPosition='start' />
            ) : (
              <Tab
                value='1'
                label={`${t('Active Notifiers')} (${notifierTotal})`}
                icon={<Icon icon='mdi:bell' />}
                iconPosition='start'
              />
            )}
          </TabList>
          <TabPanel value='1'>
            <ActiveNotifiersList set_total={setNotifierTotal} total={notifierTotal} />
          </TabPanel>
        </TabContext>
      </Grid>
      <DynamicDialogForm open={openModal} handleClose={handleCloseModal} tab={value} />

      <ConfirmationDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        tab={value}
      />

      <ConfirmationDisableModal
        isOpen={isDisableModalOpen}
        onClose={handleCloseDisableModal}
        onConfirm={handleConfirmDisable}
        tab={value}
      />

      <ConfirmationEnableModal
        isOpen={isEnableModalOpen}
        onClose={handleCloseEnableModal}
        onConfirm={handleConfirmEnable}
        tab={value}
      />

      <ConfirmationExportModal
        isOpen={isExportModalOpen}
        onClose={handleCloseExportModal}
        onConfirm={handleConfirmExport}
      />

      <NotifierUploadDialog open={openNotifierUploadDialog} onClose={() => setOpenNotifierUploadDialog(false)} />
    </Grid>
  )
}

NotifierManager.acl = {
  action: 'manage',
  subject: 'notifiers'
}

export default NotifierManager
