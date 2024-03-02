// ** React Imports
import { useContext, useState, useEffect, forwardRef, Fragment } from 'react'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { serverIdsAtom, refetchServerTriggerAtom } from 'src/lib/atoms'

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

// ** More Actions Dropdown
const MoreActionsDropdown = ({ onDelete, onExport, tabValue }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { t } = useTranslation()

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
  const deletableTabs = ['3']

  return (
    <Fragment>
      <IconButton color='warning' aria-haspopup='true' onClick={handleDropdownOpen} aria-controls='customized-menu'>
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
              onDelete()
              handleDropdownClose()
            }}
          >
            <Box sx={styles}>
              <Icon icon='mdi:delete-forever-outline' />
              {t('Delete')} {t(getDynamicTitle(tabValue))}
            </Box>
          </MenuItem>
        )}
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
        <Button onClick={onClose} color='primary'>
          Cancel
        </Button>
        <Button onClick={onConfirm} color='secondary' autoFocus>
          Export
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

const Settings = () => {
  // ** Hooks
  const ability = useContext(AbilityContext)
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()
  const { t } = useTranslation()

  const [value, setValue] = useState('1')
  const [datacenterTotal, setDatacenterTotal] = useState(0)
  const [environmentTotal, setEnvironmentTotal] = useState(0)
  const [serverTotal, setServerTotal] = useState(0)
  const [componentTotal, setComponentTotal] = useState(0)
  const [subcomponentTotal, setSubcomponentTotal] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [serverIds] = useAtom(serverIdsAtom)
  const [, setRefetchTrigger] = useAtom(refetchServerTriggerAtom)

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const handleExport = () => {
    setIsExportModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  const handleCloseExportModal = () => {
    setIsExportModalOpen(false)
  }

  const handleConfirmDelete = async () => {
    // Implement delete functionality
    console.log('Deleting...')
    console.log('serverIds', serverIds)

    try {
      const response = await axios.put('/api/inventory/servers/bulk', {
        ids: serverIds // Assuming the API expects an object with an ids array
      })

      // Handle 204 No Content response here
      // Handle successful deletion here, e.g., show a notification, refresh the list, etc.
      if (response.status === 204) {
        toast.success('Servers deleted successfully')
        setRefetchTrigger(Date.now())
      } else {
        toast.error('Error deleting servers')
      }
    } catch (error) {
      console.error('Error deleting servers:', error)

      // Handle errors here, e.g., show an error notification
      toast.error('Error deleting servers')
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
            <Button
              variant='contained'
              color='warning'
              sx={{ marginRight: 1 }}
              startIcon={<Icon icon='mdi:plus' />}
              onClick={handleOpenModal}
            >
              {getDynamicText(value)}
            </Button>
            <MoreActionsDropdown onDelete={handleDelete} onExport={handleExport} tabValue={value} />
          </Box>
        </Box>
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='assets'>
            {datacenterTotal == 0 ? (
              <Tab value='1' label={t('Datacenters')} icon={<Icon icon='mdi:office-building' />} iconPosition='start' />
            ) : (
              <Tab
                value='1'
                label={`${t('Datacenters')} (${datacenterTotal})`}
                icon={<Icon icon='mdi:office-building' />}
                iconPosition='start'
              />
            )}
            {environmentTotal == 0 ? (
              <Tab
                value='2'
                label={t('Environments')}
                icon={<Icon icon='mdi:file-table-box-multiple' />}
                iconPosition='start'
              />
            ) : (
              <Tab
                value='2'
                label={`${t('Environments')} (${environmentTotal})`}
                icon={<Icon icon='mdi:file-table-box-multiple' />}
                iconPosition='start'
              />
            )}
            {serverTotal == 0 ? (
              <Tab value='3' label={t('Servers')} icon={<Icon icon='mdi:server' />} iconPosition='start' />
            ) : (
              <Tab
                value='3'
                label={`${t('Servers')} (${serverTotal})`}
                icon={<Icon icon='mdi:server' />}
                iconPosition='start'
              />
            )}
            {componentTotal == 0 ? (
              <Tab value='4' label={t('Components')} icon={<Icon icon='mdi:group' />} iconPosition='start' />
            ) : (
              <Tab
                value='4'
                label={`${t('Components')} (${componentTotal})`}
                icon={<Icon icon='mdi:group' />}
                iconPosition='start'
              />
            )}
            {subcomponentTotal == 0 ? (
              <Tab value='5' label={t('Subcomponents')} icon={<Icon icon='mdi:select-group' />} iconPosition='start' />
            ) : (
              <Tab
                value='5'
                label={`${t('Subcomponents')} (${subcomponentTotal})`}
                icon={<Icon icon='mdi:select-group' />}
                iconPosition='start'
              />
            )}
          </TabList>
          <TabPanel value='1'>
            <DatacentersList set_total={setDatacenterTotal} total={datacenterTotal} />
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
    </Grid>
  )
}

Settings.acl = {
  action: 'manage',
  subject: 'settings-page'
}

export default Settings
