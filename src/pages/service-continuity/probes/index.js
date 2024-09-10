// ** React Imports
import { useContext, useState, useEffect, forwardRef, Fragment, useRef } from 'react'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { probeIdsAtom, refetchProbeTriggerAtom } from 'src/lib/atoms'
import { predefinedRangesDayjs, today, todayRounded, todayRoundedPlus1hour, yesterdayRounded } from 'src/lib/calendar-timeranges'
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
import ActiveProbesList from 'src/views/pages/probes/ActiveProbes'
import ProbeHistoryList from 'src/views/pages/probes/ProbeHistoryList'
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'
import { DateTimeRangePicker } from '@mui/x-date-pickers-pro/DateTimeRangePicker'
import { CustomDateTimeRangePicker } from 'src/lib/styled-components'
import { renderDigitalClockTimeView } from '@mui/x-date-pickers/timeViewRenderers'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// Form Dialog Components
import AddProbeWizard from 'src/views/pages/probes/forms/AddProbeWizard'
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

// ** More Actions Dropdown
const MoreActionsDropdown = ({ onDelete, onDisable, onEnable, onUpload, onExport, tabValue }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { t } = useTranslation()
  const ability = useContext(AbilityContext)

  const router = useRouter()

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  // Function to determine the dynamic text based on the selected tab
  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'Active Probes'
      //2: 'Probe History'
    }

    return mapping[tabValue] || ''
  }

  const handleDropdownClose = url => {
    if (url) {
      console.log('url', url)
      router.push(url)
    }
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
      color: 'text.primary'
    }
  }

  // Define tabs where the Delete menu item should be shown
  const deletableTabs = ['1']
  const showUploadProbesTab = tabValue === '1'

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
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4 } }}
      >
        {deletableTabs.includes(tabValue) && (
          <MenuItem
            sx={{ p: 0 }}
            onClick={() => {
              onDelete && onDelete()
              handleDropdownClose()
            }}
            disabled={!ability.can('delete', 'probes')}
          >
            <Box sx={styles}>
              <Icon icon='mdi:delete-forever-outline' />
              {t('Delete')} {t(getDynamicTitle(tabValue))}
            </Box>
          </MenuItem>
        )}
        {deletableTabs.includes(tabValue) && (
          <MenuItem
            sx={{ p: 0 }}
            onClick={() => {
              onEnable && onEnable()
              handleDropdownClose()
            }}
            disabled={!ability.can('update', 'probes')}
          >
            <Box sx={styles}>
              <Icon icon='mdi:plus-box' />
              {t('Enable')} {t(getDynamicTitle(tabValue))}
            </Box>
          </MenuItem>
        )}
        {deletableTabs.includes(tabValue) && (
          <MenuItem
            sx={{ p: 0 }}
            onClick={() => {
              onDisable && onDisable()
              handleDropdownClose()
            }}
            disabled={!ability.can('update', 'probes')}
          >
            <Box sx={styles}>
              <Icon icon='mdi:minus-box' />
              {t('Disable')} {t(getDynamicTitle(tabValue))}
            </Box>
          </MenuItem>
        )}
        {showUploadProbesTab && (
          <MenuItem
            sx={{ p: 0 }}
            onClick={() => {
              onUpload()
              handleDropdownClose()
            }}
            disabled={!ability.can('create', 'probes')}
          >
            <Box sx={styles}>
              <Icon icon='mdi:upload' />
              {t('Upload Probes')}
            </Box>
          </MenuItem>
        )}
        <MenuItem sx={{ p: 0 }} onClick={() => {
          onExport()
          handleDropdownClose()
        }} disabled={!ability.can('read', 'probes')}>
          <Box sx={styles}>
            <Icon icon='mdi:file-export' />
            {t('Export Probes')}
          </Box>
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

// ** Confirmation Modal
const ConfirmationDeleteModal = ({ isOpen, onClose, onConfirm, tab }) => {
  const { t } = useTranslation()

  // Function to determine the dynamic text based on the selected tab
  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'Active Probes'

      //2: 'Probe History'
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

  // Function to determine the dynamic text based on the selected tab
  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'Active Probes'

      //2: 'Probe History'
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

  // Function to determine the dynamic text based on the selected tab
  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'Active Probes'

      //2: 'Probe History'
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
  const { t } = useTranslation()

  // Function to determine the dynamic text based on the selected tab
  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'Add Probe Wizard'
    }

    return mapping[tabValue] || 'Add Probe Wizard'
  }

  const getDynamicSubTitle = tabValue => {
    const mapping = {
      1: 'Add Probe Information'
    }

    return mapping[tabValue] || 'Add Information'
  }

  useEffect(() => {
    // Reset form when modal closes
    if (!open) reset()
  }, [open, reset])

  const handleSuccess = () => {
    handleClose()
  }

  const dynamicFields = () => {
    switch (tab) {
      case '1':
        return <AddProbeWizard onSuccess={handleSuccess} />

      // Add cases for other tabs with different fields
      default:
        return <Typography>{t('Form not configured for this tab.')}</Typography>
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
          <Typography variant='body2'>{t('Information submitted will be effective immediately.')}</Typography>
        </Box>
        {dynamicFields()}
      </DialogContent>
    </Dialog>
  )
}

const ProbeUploadDialog = ({ open, onClose, onSuccess }) => {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [, setRefetchTrigger] = useAtom(refetchProbeTriggerAtom)

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

  const handleClose = () => {
    setFile(null)
    setFileName('')
    setUploadProgress(0)
    setIsUploading(false)
    onClose()
  }

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file to upload.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    let simulateProcessing = null

    try {
      setIsUploading(true)
      let simulatedProgress = 0

      const simulateProcessing = setInterval(() => {
        simulatedProgress += Math.random() * 10
        if (simulatedProgress >= 90) {
          simulatedProgress = 90
        }
        setUploadProgress(simulatedProgress)
      }, 500)

      const response = await axios.post('/api/probes/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      clearInterval(simulateProcessing)
      setUploadProgress(100)

      if (response.status === 200 && response.data) {
        const { requested_count, processed_count } = response.data
        toast.success(`Upload complete: ${processed_count} out of ${requested_count} probes processed successfully.`)
        setRefetchTrigger(new Date().getTime())
      } else {
        toast.success('Upload complete.')
      }

      setFileName('')
      setFile(null)
      setIsUploading(false)

      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error) {
      // Clear the simulation in case of an error if not null
      if (simulateProcessing) {
        clearInterval(simulateProcessing) // Clear the simulation in case of an error
      }
      console.error('Error uploading file:', error)
      setIsUploading(false)
      toast.error('Error uploading file')
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('Upload Probes')}</DialogTitle>
      <DialogContent>
        <IconButton
          size='small'
          onClick={() => handleClose()}
          sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
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
          onClick={onClose}
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

const ProbeManager = () => {
  // ** Hooks
  const ability = useContext(AbilityContext)
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()
  const { t } = useTranslation()
  const theme = useTheme()

  const [value, setValue] = useState('1')
  const [probeTotal, setProbeTotal] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false)
  const [isEnableModalOpen, setIsEnableModalOpen] = useState(false)
  const [selectedProbeIds, setSelectedProbeIds] = useAtom(probeIdsAtom)
  const [, setRefetchTrigger] = useAtom(refetchProbeTriggerAtom)

  const [dateRange, setDateRange] = useState([yesterdayRounded, todayRoundedPlus1hour])
  const [onAccept, setOnAccept] = useState(value)

  const [openUploadDialog, setOpenUploadDialog] = useState(false)

  const activeProbesRef = useRef(null)

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
    console.log('Deleting Probes', selectedProbeIds)

    // Generate an array of promises for deleting each probe
    const deletePromises = selectedProbeIds.map(probeId =>
      axios
        .delete(`/api/probes/delete/${probeId}`)
        .then(() => ({ success: true, probeId }))
        .catch(error => ({ success: false, probeId, error }))
    )

    try {
      // Wait for all delete operations to complete
      const results = await Promise.all(deletePromises)

      // Handle results
      results.forEach(result => {
        if (result.success) {
          toast.success(t('Probe {{probeId}} deleted successfully', { probeId: result.probeId }))
        } else {
          console.error(`Error deleting probe ${result.probeId}:`, result.error)
          toast.error(t('Failed to delete probe {{probeId}}', { probeId: result.probeId }))
        }
      })

      // Refresh data or update UI as needed
      setRefetchTrigger(Date.now())

      // Optionally clear selected probeIds after deletion
      setSelectedProbeIds([])
    } catch (error) {
      // This catch block may not be necessary since individual errors are caught above
      console.error('Unexpected error during probe deletion:', error)
      toast.error(t('An unexpected error occurred during probe deletion'))
    }

    setIsDeleteModalOpen(false)
  }

  const handleConfirmDisable = async () => {
    console.log('Disabling probes', selectedProbeIds)

    try {
      const response = await axios.post('/api/probes/disable', selectedProbeIds)
      const { message, probeids } = response.data

      if (response.status === 200) {
        // Iterate over ProbeIds and display success message for each
        probeids.forEach(probeId => {
          toast.success(`${message}: ${probeId}`)
        })

        // Trigger re-fetch of the grid data
        setRefetchTrigger(Date.now())

        // Close the disable modal dialog
        setIsDisableModalOpen(false) // Add this line to close the dialog
        setSelectedProbeIds([]) // Clear the selected probe IDs
      } else {
        toast.error(t('Error disabling probes'))
      }
    } catch (error) {
      toast.error(t('Error disabling probes: {{errorMessage}}', { errorMessage: error.response?.data?.message || error.message }))

      // Close the disable modal dialog
      setIsDisableModalOpen(false) // Add this line to close the dialog
    }
  }

  const handleConfirmEnable = async () => {
    console.log('Enabling probes', selectedProbeIds)

    try {
      const response = await axios.post('/api/probes/enable', selectedProbeIds)

      if (response.status === 200) {
        const { message, probeids } = response.data

        // Iterate over ProbeIds and display success message for each
        probeids.forEach(probeId => {
          toast.success(`${message}: ${probeId}`)
        })

        // Trigger re-fetch of the grid data
        setRefetchTrigger(Date.now())

        // Close the enable modal dialog
        setIsEnableModalOpen(false) // Add this line to close the dialog
        setSelectedProbeIds([]) // Clear the selected Probe IDs
      } else {
        toast.error(t('Error enabling probes'))
      }
    } catch (error) {
      toast.error(t('Error enabling probes: {{errorMessage}}', { errorMessage: error.response?.data?.message || error.message }))

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

  // Function to determine the dynamic text based on the selected tab
  const getDynamicText = tabValue => {
    const mapping = {
      1: t('Probes')
    }

    return mapping[tabValue] || 'Item'
  }

  const handleOnAccept = value => {
    console.log('onAccept', value)
    setOnAccept(value)
  }

  const handleUpload = () => {
    setOpenUploadDialog(true)
  }

  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false)
  }

  const handleExport = () => {
    if (activeProbesRef.current) {
      activeProbesRef.current.exportProbes()
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={10}>
          <Typography variant='h4'>{t('Probe Management')}</Typography>
          <Box display='flex' alignItems='center'>
            {value === '1' && (
              <Fragment>
                <Button
                  variant='contained'
                  color='secondary'
                  sx={{ marginRight: 1 }}
                  startIcon={<Icon icon='mdi:plus' />}
                  onClick={handleOpenModal}
                  disabled={!ability.can('create', 'probes')}
                >
                  {getDynamicText(value)}
                </Button>
                <MoreActionsDropdown
                  onDelete={handleDelete}
                  onEnable={handleEnable}
                  onDisable={handleDisable}
                  onUpload={handleUpload}
                  onExport={handleExport}
                  tabValue={value}
                />
              </Fragment>
            )}
            {value === '2' && (
              <DateTimeRangePicker
                calendars={2}
                closeOnSelect={false}
                value={dateRange}
                defaultValue={[yesterdayRounded, todayRoundedPlus1hour]}
                views={['day', 'hours']}
                timeSteps={{ minutes: 10 }}
                viewRenderers={{ hours: renderDigitalClockTimeView }}
                onChange={newValue => {
                  // console.log('Date range:', newValue)
                  setDateRange(newValue)
                }}
                onAccept={handleOnAccept}
                slotProps={{
                  field: { dateSeparator: 'to' },
                  textField: ({ position }) => ({
                    size: 'small',
                    color: position === 'start' ? 'secondary' : 'secondary',
                    focused: true,
                    InputProps: {
                      endAdornment: <Icon icon='mdi:calendar' />
                    }
                  }),

                  desktopPaper: {
                    style: {
                      backgroundColor:
                        theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.common.white
                    }
                  },

                  day: {
                    sx: {
                      '& .MuiPickersDay-root': {
                        color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
                        '&:hover': {
                          color:
                            theme.palette.mode === 'dark'
                              ? theme.palette.customColors.brandYellow
                              : theme.palette.primary.light
                        }
                      },
                      '& .MuiPickersDay-root.Mui-selected': {
                        color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.white
                      }
                    }
                  },

                  shortcuts: {
                    items: predefinedRangesDayjs,
                    sx: {
                      '& .MuiChip-root': {
                        color:
                          theme.palette.mode === 'dark'
                            ? theme.palette.customColors.brandYellow
                            : theme.palette.primary.main,
                        '&:hover': {
                          color:
                            theme.palette.mode == 'dark'
                              ? theme.palette.customColors.brandYellow
                              : theme.palette.primary.main,
                          backgroundColor:
                            theme.palette.mode === 'dark' ? theme.palette.secondary.dark : theme.palette.secondary.light
                        }
                      }
                    }
                  },

                  digitalClockItem: {
                    sx: {
                      '&:hover': {
                        color:
                          theme.palette.mode === 'dark'
                            ? theme.palette.customColors.brandBlack
                            : theme.palette.customColors.black,
                        background:
                          theme.palette.mode == 'dark'
                            ? theme.palette.customColors.brandGray4
                            : theme.palette.customColors.brandGray4
                      },
                      '&.Mui-selected': {
                        background:
                          theme.palette.mode == 'dark'
                            ? theme.palette.customColors.brandYellow4
                            : theme.palette.customColors.brandGray1
                      }
                    }
                  },

                  actionBar: {
                    actions: ['clear', 'today', 'cancel', 'accept'],
                    sx: {
                      '& .MuiDialogActions-root, .MuiButton-root': {
                        // Targeting buttons inside MuiDialogActions-root
                        borderWidth: '1px', // Ensure there's a visible border
                        borderStyle: 'solid', // Necessary for the border to show
                        borderColor:
                          theme.palette.mode === 'dark'
                            ? theme.palette.customColors.brandGray1b
                            : theme.palette.primary.main,
                        color:
                          theme.palette.mode === 'dark'
                            ? theme.palette.customColors.brandWhite
                            : theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 255, 0.04)', // Custom background color on hover
                          borderColor:
                            theme.palette.mode === 'dark'
                              ? theme.palette.customColors.brandWhite
                              : theme.palette.primary.main,
                          color:
                            theme.palette.mode === 'dark'
                              ? theme.palette.customColors.brandYellow
                              : theme.palette.primary.main
                        }
                      }
                    }
                  }
                }}
              />
            )}
          </Box>
        </Box>
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='assets'>
            {probeTotal == 0 ? (
              <Tab
                value='1'
                label={t('Active Probes')}
                icon={<Icon icon='mdi:arrow-decision-auto' />}
                iconPosition='start'
              />
            ) : (
              <Tab
                value='1'
                label={`${t('Active Probes')} (${probeTotal})`}
                icon={<Icon icon='mdi:arrow-decision-auto' />}
                iconPosition='start'
              />
            )}
          </TabList>
          <TabPanel value='1'>
            <ActiveProbesList ref={activeProbesRef} set_total={setProbeTotal} total={probeTotal} />
          </TabPanel>
          <TabPanel value='2'>
            <ProbeHistoryList dateRange={dateRange} onAccept={onAccept} />
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

      <ProbeUploadDialog
        open={openUploadDialog}
        onClose={handleCloseUploadDialog}
        onSuccess={() => {
          setOpenUploadDialog(false)
        }}
      />
    </Grid>
  )
}

ProbeManager.acl = {
  action: 'read',
  subject: 'probes'
}

export default ProbeManager

