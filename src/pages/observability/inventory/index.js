// ** React Imports
import { useContext, useState, useEffect, forwardRef, Fragment, useRef } from 'react'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import {
  serverIdsAtom,
  componentIdsAtom,
  subcomponentIdsAtom,
  refetchSubcomponentTriggerAtom,
  refetchComponentTriggerAtom,
  refetchServerTriggerAtom
} from 'src/lib/atoms'

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
import DatacentersList from 'src/views/pages/inventory/DatacentersList'
import EnvironmentsList from 'src/views/pages/inventory/EnvironmentsList'
import ServersList from 'src/views/pages/inventory/ServersList'
import ComponentsList from 'src/views/pages/inventory/ComponentsList'
import SubcomponentsList from 'src/views/pages/inventory/SubcomponentsList'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// Form Dialog Components
import AddDatacenterWizard from 'src/views/pages/inventory/forms/AddDatacenterWizard'
import AddEnvironmentWizard from 'src/views/pages/inventory/forms/AddEnvironmentWizard'
import AddComponentWizard from 'src/views/pages/inventory/forms/AddComponentWizard'
import AddSubcomponentWizard from 'src/views/pages/inventory/forms/AddSubcomponentWizard'
import AddServerWizard from 'src/views/pages/inventory/forms/AddServerWizard'
import { set } from 'nprogress'
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

const SelectStyled = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    fieldset: {
      borderColor: 'inherit' // default border color
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.customColors.accent // border color when focused
    }
  }
}))

// ** More Actions Dropdown
const MoreActionsDropdown = ({ onDelete, onExport, onUpload, onStatusUpdate, tabValue }) => {
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
      1: 'Datacenters',
      2: 'Environments',
      3: 'Servers',
      4: 'Components',
      5: 'Subcomponents'
    }

    return mapping[tabValue] || 'Add Wizard'
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
  const deletableTabs = ['3', '4', '5']
  const showStatusUpdateTab = ['1', '2', '3']
  const showExportTab = tabValue === '3'
  const showUploadServersTab = tabValue === '3'

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
          <>
            <MenuItem
              sx={{ p: 0 }}
              onClick={() => {
                onDelete && onDelete()
                handleDropdownClose()
              }}
              disabled={!ability.can('delete', getDynamicTitle(tabValue).toLowerCase())}
            >
              <Box sx={styles}>
                <Icon icon='mdi:delete-forever-outline' />
                {t('Delete')} {t(getDynamicTitle(tabValue))}
              </Box>
            </MenuItem>
          </>
        )}
        {showStatusUpdateTab.includes(tabValue) && (
          <MenuItem
            sx={{ p: 0 }}
            onClick={() => {
              onStatusUpdate && onStatusUpdate()
              handleDropdownClose()
            }}
            disabled={!ability.can('update', getDynamicTitle(tabValue).toLowerCase())}
          >
            <Box sx={styles}>
              <Icon icon='mdi:power' />
              {t('Update Status')}
            </Box>
          </MenuItem>
        )}
        {showExportTab && (
          <MenuItem
            sx={{ p: 0 }}
            onClick={() => {
              onExport()
              handleDropdownClose()
            }}
            disabled={!ability.can('read', getDynamicTitle(tabValue).toLowerCase())}
          >
            <Box sx={styles}>
              <Icon icon='mdi:file-export-outline' />
              {t('Export')}
            </Box>
          </MenuItem>
        )}
        {showUploadServersTab && (
          <MenuItem
            sx={{ p: 0 }}
            onClick={() => {
              onUpload()
              handleDropdownClose()
            }}
            disabled={!ability.can('create', 'servers')}
          >
            <Box sx={styles}>
              <Icon icon='mdi:upload' />
              {t('Upload Servers')}
            </Box>
          </MenuItem>
        )}
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
      1: 'datacenters',
      2: 'environments',
      3: 'servers',
      4: 'components',
      5: 'subcomponents'
    }

    return mapping[tabValue] || 'Add Wizard'
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            '& .MuiModal-backdrop': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)' // Adjust the alpha value to control darkness
            }
          }
        }
      }}
    >
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
          onClick={() => onConfirm(tab)}
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
const ConfirmationExportModal = ({ isOpen, onClose, onConfirm, tab }) => {
  const { t } = useTranslation()

  // Function to determine the dynamic text based on the selected tab
  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'datacenters',
      2: 'environments',
      3: 'servers',
      4: 'components',
      5: 'subcomponents'
    }

    return mapping[tabValue] || 'Add Wizard'
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to export all selected {getDynamicTitle(tab)}?</DialogContentText>
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

const ServerUploadDialog = ({ open, onClose, onSuccess, tab }) => {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [, setRefetchTrigger] = useAtom(refetchServerTriggerAtom)

  const fileInputRef = useRef(null)

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

  const { t } = useTranslation()

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

      // Start the simulation before the request is sent
      simulateProcessing = setInterval(() => {
        simulatedProgress += Math.random() * 10 // Increment progress by a random amount each time
        if (simulatedProgress >= 90) {
          simulatedProgress = 90 // Cap simulated progress at 90% to leave room for real completion
        }
        setUploadProgress(simulatedProgress)
      }, 500)

      const response = await axios.post('/api/inventory/servers/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }

        // onUploadProgress: progressEvent => {
        //   const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        //   setUploadProgress(progress)
        // }
      })

      // Clear the simulation and set progress to 100% when done
      clearInterval(simulateProcessing)
      setUploadProgress(100)

      // Handle response here
      if (response.status === 200 && response.data) {
        const { requested_count, processed_count } = response.data
        toast.success(`Upload complete: ${processed_count} out of ${requested_count} servers processed successfully.`)
        setRefetchTrigger(new Date().getTime())
      } else {
        toast.success('Upload complete.')
      }

      setFileName('')
      setFile(null)
      setIsUploading(false)

      setTimeout(() => {
        onClose() // Close the dialog after a short delay
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
      <DialogTitle>Upload Servers</DialogTitle>
      <DialogContent>
        <IconButton
          size='small'
          onClick={() => handleClose()}
          sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
        {/* Hidden file input */}
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }} // Hide the input
        />
        {/* Custom styled button */}
        <Button onClick={handleButtonClick} size='large' variant='contained' color='primary' disabled={isUploading}>
          {t('Choose File')}
        </Button>
        {fileName && (
          <Typography variant='subtitle1' sx={{ mt: 2 }}>
            Selected file: {fileName}
          </Typography>
        )}

        {isUploading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant='determinate' value={uploadProgress} />
            <Typography variant='subtitle2' align='center'>
              {Math.round(uploadProgress)}% uploaded
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

// Define a simple modal form component
const DynamicDialogForm = ({ open, handleClose, onSubmit, tab }) => {
  const { register, handleSubmit, reset } = useForm()
  const theme = useTheme()

  // Function to determine the dynamic text based on the selected tab
  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'Add Datacenter Wizard',
      2: 'Add Environment Wizard',
      3: 'Add Server Wizard',
      4: 'Add Component Wizard',
      5: 'Add Subcomponent Wizard'
    }

    return mapping[tabValue] || 'Add Wizard'
  }

  const getDynamicSubTitle = tabValue => {
    const mapping = {
      1: 'Add Datacenter Information',
      2: 'Add Environment Information',
      3: 'Add Server Information',
      4: 'Add Component Information',
      5: 'Add Subcomponent Information'
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
      case '1': // Datacenters
        return <AddDatacenterWizard onSuccess={handleSuccess} />
      case '2': // Environments
        return <AddEnvironmentWizard onSuccess={handleSuccess} />
      case '3': // Servers
        return <AddServerWizard onSuccess={handleSuccess} />
      case '4': // Components
        return <AddComponentWizard onSuccess={handleSuccess} />
      case '5':
        return <AddSubcomponentWizard onSuccess={handleSuccess} />

      // Add cases for other tabs with different fields
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

const ConfirmationStatusModal = ({ isOpen, onClose, onConfirm, tab }) => {
  const { t } = useTranslation()
  const [status, setStatus] = useState('inactive')

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{t('Update Server Status')}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 3 }}>
          {t('Are you sure you want to update the status of all selected servers?')}
        </DialogContentText>
        <FormControl fullWidth>
          <InputLabel>{t('Status')}</InputLabel>
          <SelectStyled value={status} label={t('Status')} onChange={e => setStatus(e.target.value)}>
            <MenuItem value='active'>{t('ACTIVE')}</MenuItem>
            <MenuItem value='inactive'>{t('INACTIVE')}</MenuItem>
          </SelectStyled>
        </FormControl>
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
          onClick={() => onConfirm(status)}
          size='large'
          variant='contained'
          color='warning'
          autoFocus
          startIcon={<Icon icon='mdi:content-save' />}
        >
          {t('Update')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const Settings = () => {
  // ** Hooks
  const ability = useContext(AbilityContext)
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()
  const { t } = useTranslation()

  const [value, setValue] = useState('3')
  const [datacenterTotal, setDatacenterTotal] = useState(0)
  const [environmentTotal, setEnvironmentTotal] = useState(0)
  const [serverTotal, setServerTotal] = useState(0)
  const [componentTotal, setComponentTotal] = useState(0)
  const [subcomponentTotal, setSubcomponentTotal] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [openUploadDialog, setOpenUploadDialog] = useState(false)
  const [serverIds] = useAtom(serverIdsAtom)
  const [componentIds] = useAtom(componentIdsAtom)
  const [subcomponentIds] = useAtom(subcomponentIdsAtom)
  const [, setRefetchTrigger] = useAtom(refetchServerTriggerAtom)
  const [, setRefetchComponentTrigger] = useAtom(refetchComponentTriggerAtom)
  const [, setRefetchSubcomponentTrigger] = useAtom(refetchSubcomponentTriggerAtom)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

  // Add this useEffect to fetch initial counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch all counts in parallel
        const [datacentersRes, environmentsRes, serversRes, componentsRes, subcomponentsRes] = await Promise.all([
          axios.get('/api/inventory/datacenters'),
          axios.get('/api/inventory/environments'),
          axios.get('/api/inventory/servers'),
          axios.get('/api/inventory/components'),
          axios.get('/api/inventory/subcomponents')
        ])

        // Update all totals
        setDatacenterTotal(datacentersRes.data.total || 0)
        setEnvironmentTotal(environmentsRes.data.total || 0)
        setServerTotal(serversRes.data.total || 0)
        setComponentTotal(componentsRes.data.total || 0)
        setSubcomponentTotal(subcomponentsRes.data.total || 0)
      } catch (error) {
        console.error('Error fetching counts:', error)
        toast.error('Error fetching inventory counts')
      }
    }

    fetchCounts()
  }, []) // Empty dependency array means this runs once on mount

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const handleExport = () => {
    setIsExportModalOpen(true)
  }

  const handleUpload = () => {
    setOpenUploadDialog(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  const handleCloseExportModal = () => {
    setIsExportModalOpen(false)
  }

  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false)
  }

  const handleConfirmDelete = async tab => {
    const endpointMapping = {
      3: '/api/inventory/servers',
      4: '/api/inventory/components',
      5: '/api/inventory/subcomponents'
    }

    const ids = {
      3: serverIds,
      4: componentIds,
      5: subcomponentIds
    }

    const refecthTriggers = {
      3: setRefetchTrigger,
      4: setRefetchComponentTrigger,
      5: setRefetchSubcomponentTrigger
    }

    const endpoint = endpointMapping[tab] || null

    if (!endpoint) {
      toast.error('Invalid tab selection')

      return
    }

    try {
      const response = await axios.put(endpoint, {
        ids: ids[tab]
      })

      // Handle 204 No Content response here
      // Handle successful deletion here, e.g., show a notification, refresh the list, etc.
      if (response.status === 204) {
        toast.success(`${getDynamicText(tab)} deleted successfully`)
        refecthTriggers[tab](Date.now())
      } else {
        toast.error(`Error deleting ${getDynamicText(tab).toLowerCase()}`)
      }
    } catch (error) {
      console.error(`Error deleting ${getDynamicText(tab).toLowerCase()}:`, error)
      toast.error(`Error deleting ${getDynamicText(tab).toLowerCase()}`)
    }

    setIsDeleteModalOpen(false)
  }

  const handleConfirmExport = async () => {
    try {
      // Fetch server data
      const response = await axios.get('/api/inventory/servers')
      const servers = response.data.rows

      // Create a new workbook
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Servers')

      // Define columns
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Hostname', key: 'hostname', width: 25 },
        { header: 'Datacenter', key: 'datacenter_name', width: 25 },
        { header: 'Environment', key: 'environment_name', width: 25 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Component', key: 'component_name', width: 20 },
        { header: 'Subcomponent', key: 'subcomponent_name', width: 20 },
        { header: 'Metadata', key: 'metadata', width: 50 },
        { header: 'Network Interfaces', key: 'network_interfaces', width: 50 },
        { header: 'Created At', key: 'created_at', width: 20 },
        { header: 'Modified At', key: 'modified_at', width: 20 }
      ]

      // Add rows
      servers.forEach(server => {
        worksheet.addRow({
          ...server,
          metadata: server.metadata.map(meta => `${meta.key}: ${meta.value}`).join('; '),
          network_interfaces: server.network_interfaces.map(ni => `${ni.name} (${ni.ip_address})`).join('; ')
        })
      })

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer()

      // Trigger file download
      saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        'Servers.xlsx'
      )
      console.log('Exporting...')
      toast.success('Exporting...') // Assuming you have a toast notification system
    } catch (error) {
      console.error('Error exporting servers:', error)
      toast.error('Error exporting servers') // Assuming you have a toast notification system
    }
    setIsExportModalOpen(false)
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

  const handleStatusUpdate = () => {
    setIsStatusModalOpen(true)
  }

  const handleConfirmStatusUpdate = async newStatus => {
    try {
      // Get current server data to access hostnames
      const response = await axios.get('/api/inventory/servers')
      const allServers = response.data.rows

      // Create a map of server IDs to their hostnames
      const serverMap = allServers.reduce((acc, server) => {
        acc[server.id] = server.hostname

        return acc
      }, {})

      // Update each selected server with both hostname and status
      const updatePromises = serverIds.map(serverId =>
        axios.patch(`/api/inventory/servers/${serverId}`, {
          hostname: serverMap[serverId], // Include the hostname
          status: newStatus
        })
      )

      await Promise.all(updatePromises)

      setRefetchTrigger(Date.now())
      toast.success(t('Successfully updated server statuses'))
    } catch (error) {
      console.error('Error updating server statuses:', error)
      toast.error(t('Failed to update server statuses'))
    }

    setIsStatusModalOpen(false)
  }

  // Function to determine the dynamic text based on the selected tab
  const getDynamicText = tabValue => {
    const mapping = {
      1: t('Datacenter'),
      2: t('Environment'),
      3: t('Server'),
      4: t('Component'),
      5: t('Subcomponent')
    }

    return mapping[tabValue] || 'Item'
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={10}>
          <Typography variant='h4'>{t('Inventory Management')}</Typography>
          <Box display='flex' alignItems='center'>
            {['1', '2', '3', '4', '5'].includes(value) && (
              <Fragment>
                <Button
                  variant='contained'
                  color='secondary'
                  sx={{ marginRight: 1 }}
                  startIcon={<Icon icon='mdi:plus' />}
                  onClick={handleOpenModal}
                  disabled={!ability.can('create', getDynamicText(value).toLowerCase())}
                >
                  {getDynamicText(value)}
                </Button>
                <MoreActionsDropdown
                  onDelete={handleDelete}
                  onExport={handleExport}
                  onUpload={handleUpload}
                  onStatusUpdate={handleStatusUpdate}
                  tabValue={value}
                />
              </Fragment>
            )}
          </Box>
        </Box>
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='assets'>
            {/* Datacenters Tab */}
            <Tab
              value='1'
              label={datacenterTotal == 0 ? t('Datacenters') : `${t('Datacenters')} (${datacenterTotal})`}
              icon={<Icon icon='mdi:database' />}
              iconPosition='start'
            />
            {/* Environments Tab */}
            <Tab
              value='2'
              label={environmentTotal == 0 ? t('Environments') : `${t('Environments')} (${environmentTotal})`}
              icon={<Icon icon='mdi:file-table-box-multiple' />}
              iconPosition='start'
            />
            {/* Servers Tab */}
            <Tab
              value='3'
              label={serverTotal == 0 ? t('Servers') : `${t('Servers')} (${serverTotal})`}
              icon={<Icon icon='mdi:server' />}
              iconPosition='start'
            />
            {/* Components Tab - Hidden for viewers */}
            {ability.can('read', 'components') && (
              <Tab
                value='4'
                label={componentTotal == 0 ? t('Components') : `${t('Components')} (${componentTotal})`}
                icon={<Icon icon='mdi:group' />}
                iconPosition='start'
              />
            )}
            {/* Subcomponents Tab - Hidden for viewers */}
            {ability.can('read', 'subcomponents') && (
              <Tab
                value='5'
                label={subcomponentTotal == 0 ? t('Subcomponents') : `${t('Subcomponents')} (${subcomponentTotal})`}
                icon={<Icon icon='mdi:select-group' />}
                iconPosition='start'
              />
            )}
          </TabList>
          <TabPanel value='1'>
            <DatacentersList
              set_total={setDatacenterTotal}
              set_components_total={setComponentTotal}
              set_subcomponents_total={setSubcomponentTotal}
              set_servers_total={setServerTotal}
              set_environments_total={setEnvironmentTotal}
              total={datacenterTotal}
            />
          </TabPanel>
          <TabPanel value='2'>
            <EnvironmentsList set_total={setEnvironmentTotal} total={environmentTotal} />
          </TabPanel>
          <TabPanel value='3'>
            <ServersList set_total={setServerTotal} total={serverTotal} />
          </TabPanel>
          <TabPanel value='4'>
            <ComponentsList set_total={setComponentTotal} total={componentTotal} />
          </TabPanel>
          <TabPanel value='5'>
            <SubcomponentsList set_total={setSubcomponentTotal} total={subcomponentTotal} />
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

      <ConfirmationExportModal
        isOpen={isExportModalOpen}
        onClose={handleCloseExportModal}
        onConfirm={handleConfirmExport}
        tab={value}
      />

      <ServerUploadDialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        onSuccess={() => {
          // Handle success, e.g., showing a success message or refreshing the list
          setOpenUploadDialog(false)
        }}
        tab={value}
      />

      <ConfirmationStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleConfirmStatusUpdate}
        tab={value}
      />
    </Grid>
  )
}

Settings.acl = {
  action: 'read',
  subject: 'inventory'
}

export default Settings
