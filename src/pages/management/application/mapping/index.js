// ** React Imports
import { useContext, useState, useEffect, forwardRef, Fragment, useRef } from 'react'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import {
  mappingNamespacesAtom,
  refetchMappingNamespaceTriggerAtom,
  mappingsAtom,
  refetchMappingTriggerAtom
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
import MappingNamespaceList from 'src/views/pages/mapping/MappingNamespaceList'
import MappingList from 'src/views/pages/mapping/MappingList'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// Form Dialog Components
import AddMappingNamespaceWizard from 'src/views/pages/mapping/forms/AddMappingNamespaceWizard'
import AddMappingWizard from 'src/views/pages/mapping/forms/AddMappingWizard'

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
      1: 'MappingNamespaces',
      2: 'Mapping'
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
  const deletableTabs = ['2']
  const showUploadMappingTab = tabValue === '2'
  
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
          </>
        )}
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
        {showUploadMappingTab && (
          <MenuItem
            sx={{ p: 0 }}
            onClick={() => {
              onUpload()
              handleDropdownClose()
            }}
            disabled={!ability.can('create', 'mappings')}
          >
            <Box sx={styles}>
              <Icon icon='mdi:upload' />
              {t('Upload Mappings')}
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
      1: 'mappingNamespaces',
      2: 'mapping'
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
      1: 'mappingNamespaces',
      2: 'mapping'
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

const MappingUploadDialog = ({ open, onClose, onSuccess, tab }) => {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [, setRefetchTrigger] = useAtom(refetchMappingTriggerAtom)

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

      const response = await axios.post('/api/mapping/bulk', formData, {  //N.B.: bulk apis to be created
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
        toast.success(`Upload complete: ${processed_count} out of ${requested_count} mappings processed successfully.`)
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
      <DialogTitle>Upload Mappings</DialogTitle>
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
      1: 'Add Mapping Namespace Wizard',
      2: 'Add Mapping Wizard'
    }

    return mapping[tabValue] || 'Add Wizard'
  }

  const getDynamicSubTitle = tabValue => {
    const mapping = {
      1: 'Add Mapping Namespace Information',
      2: 'Add Mapping Information'
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
        return <AddMappingNamespaceWizard onSuccess={handleSuccess} />
      case '2': // Environments
        return <AddMappingWizard onSuccess={handleSuccess} />

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
      <DialogTitle>{t('Update Mapping Status')}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 3 }}>
          {t('Are you sure you want to update the status of all selected mappings?')}
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

  const [value, setValue] = useState('1')
  const [mappingNamespaceTotal, setMappingNamespaceTotal] = useState(0)
  const [mappingTotal, setMappingTotal] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [openUploadDialog, setOpenUploadDialog] = useState(false)
  const [mappings] = useAtom(mappingsAtom)
  const [namespaces] = useAtom(mappingNamespacesAtom)
  const [, setRefetchComponentTrigger] = useAtom(refetchMappingNamespaceTriggerAtom)
  const [, setRefetchTrigger] = useAtom(refetchMappingTriggerAtom)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

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
      2: '/api/mapping'
    }

    const ids = {
      2: mappings    //mappings hold the mappingnames which is the id 
    }

    const refecthTriggers = {
      2: setRefetchTrigger
    }

    const endpoint = endpointMapping[tab] || null

    if (!endpoint) {
      toast.error('Invalid tab selection')

      return
    }

    console.log("selected mappings", mappings, typeof(mappings));

    const headers = {
      Accept: 'application/json' // Add the authorization if necessary
    };
    
    try {
      // Ensure ids[tab] is an array of IDs, not wrapped in an object
      console.log("Request Ids :"+ids[tab] + " and type "+ typeof(ids[tab]))
      const response = await axios.put(endpoint, {ids: ids[tab]});  // Send the array directly
      console.log('Response:', response);
    
      if (response.status === 204) {
        toast.success('Mappings deleted successfully');
        // Trigger a refetch of the data
        refecthTriggers[tab](Date.now());
      } else {
        toast.error('Error deleting Mappings');
      }
    } catch (error) {
      console.error('Error deleting Mappings:', error.response ? error.response.data : error.message);
      toast.error('Error deleting servers');
    }
    

    setIsDeleteModalOpen(false)
  }

  const handleConfirmExport = async () => {
    try {
      // Fetch server data
      const response = await axios.get('/api/mapping')
      const mappingss = response.data.rows

      // Create a new workbook
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Mappings')

      // Define columns
      worksheet.columns = [
        { header: 'Mapping', key: 'name', width: 30 },
        { header: 'Mapping Description', key: 'description', width: 25 },
        { header: 'Mapping Namespace', key: 'mapping_namespace_name', width: 25 },
        { header: 'Key', key: 'key', width: 25 },
        { header: 'Value', key: 'value', width: 25 },
        { header: 'Metadata', key: 'metadata', width: 50 },
        { header: 'Created At', key: 'created_at', width: 20 },
        { header: 'Modified At', key: 'modified_at', width: 20 }
      ]

      // Add rows
      mappingss.forEach(mapping => {
        worksheet.addRow({
          ...mapping,
          metadata: mapping.metadata.map(meta => `${meta.key}: ${meta.value}`).join('; ')
        })
      })

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer()

      // Trigger file download
      saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        'Mappings.xlsx'
      )
      console.log('Exporting...')
      toast.success('Exporting...') // Assuming you have a toast notification system
    } catch (error) {
      console.error('Error exporting mappings:', error)
      toast.error('Error exporting mappings') // Assuming you have a toast notification system
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
    try
     {
      // Get current mapping data to access hostnames
      const response = await axios.get('/api/mapping')
      const allMappings = response.data.rows

      // Create a map of mapping IDs to their map name
      const mappingMap = allMappings.reduce((acc, mapping) => {
        acc[mapping.id] = mapping.name

        return acc
      }, {})

      const isFeatureAllowed = false;  // Set this according to your logic, e.g., feature flag or condition
      if (!isFeatureAllowed) {
        // Throw an error with a message to indicate that the action is not allowed
        throw new Error('Status update for Mappings are not allowed all Mappings are Active by default');
      }

      // Update each selected server with both hostname and status
      const updatePromises = mappings.map(mappingId =>
        axios.patch(`/api/mapping/${mappingId}`, {
          name: mappingMap[mappingId],
          status: newStatus
        })
      )

      await Promise.all(updatePromises)

      setRefetchTrigger(Date.now())
      toast.success(t('Successfully updated mapping status'))
    } catch (error) {
      
      console.error('Error updating mapping statuse:', error)
      toast.error(t('Mapping status update not allowed. All Mappings are active by default'))
    }

    setIsStatusModalOpen(false)
  }

  // Function to determine the dynamic text based on the selected tab
  const getDynamicText = tabValue => {
    const mapping = {
      1: t('Mapping Namespace'),
      2: t('Mapping')
    }

    return mapping[tabValue] || 'Item'
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={10}>
          <Typography variant='h4'>{t('Data Map Management')}</Typography>
          <Box display='flex' alignItems='center'>
            {['1', '2'].includes(value) && (
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
            {/* Mapping-Namespaces Tab */}
            <Tab
              value='1'
              label={mappingNamespaceTotal == 0 ? t('MappingNamespaces') : `${t('MappingNamespaces')} (${mappingNamespaceTotal})`}
              icon={<Icon icon='mdi:file-table-box-multiple' />}
              iconPosition='start'
            />
            {/* Environments Tab */}
            <Tab
              value='2'
              label={mappingTotal == 0 ? t('Mappings') : `${t('Mappings')} (${mappingTotal})`}
              icon={<Icon icon='mdi:file-table-box-outline' />}
              iconPosition='start'
            />
          </TabList>
          <TabPanel value='1'>
            <MappingNamespaceList set_total={setMappingNamespaceTotal} total={mappingNamespaceTotal} />
          </TabPanel>
          <TabPanel value='2'>
            <MappingList set_total={setMappingTotal} total={mappingTotal} />
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

      <MappingUploadDialog
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