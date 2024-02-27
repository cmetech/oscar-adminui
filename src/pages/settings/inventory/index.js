// ** React Imports
import { useContext, useState, useEffect, forwardRef, Fragment } from 'react'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

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
const MoreActionsDropdown = ({ onDelete, onExport }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { t } = useTranslation()

  const router = useRouter()

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
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
        <MenuItem
          sx={{ p: 0 }}
          onClick={() => {
            onDelete()
            handleDropdownClose()
          }}
        >
          <Box sx={styles}>
            <Icon icon='mdi:delete-forever-outline' />
            {t('Delete')}
          </Box>
        </MenuItem>
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
        <DialogContentText>Are you sure you want to delete all selected {getDynamicTitle(tab)}?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Cancel
        </Button>
        <Button onClick={onConfirm} color='secondary' autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ** Confirmation Modal
const ConfirmationExportModal = ({ isOpen, onClose, onConfirm, tab }) => {
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

  const dynamicFields = () => {
    switch (tab) {
      case '1': // Datacenters
        return <AddDatacenterWizard />
      case '2': // Environments
        return <AddEnvironmentWizard />
      case '3': // Servers
        return <AddServerWizard />
      case '4': // Components
        return <AddComponentWizard />
      case '5':
        return <AddSubcomponentWizard />

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

  const [value, setValue] = useState('1')
  const [datacenterTotal, setDatacenterTotal] = useState(0)
  const [environmentTotal, setEnvironmentTotal] = useState(0)
  const [serverTotal, setServerTotal] = useState(0)
  const [componentTotal, setComponentTotal] = useState(0)
  const [subcomponentTotal, setSubcomponentTotal] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

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

  const handleConfirmDelete = () => {
    // Implement delete functionality
    console.log('Deleting...')
    toast.success('Deleting...')
    setIsDeleteModalOpen(false)
  }

  const handleConfirmExport = () => {
    // Implement export functionality
    console.log('Exporting...')
    toast.success('Exporting...')
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

  // Function to determine the dynamic text based on the selected tab
  const getDynamicText = tabValue => {
    const mapping = {
      1: 'Datacenter',
      2: 'Environment',
      3: 'Server',
      4: 'Component',
      5: 'Subcomponent'
    }

    return mapping[tabValue] || 'Item'
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={10}>
          <Typography variant='h4'>Inventory Management</Typography>
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
            <MoreActionsDropdown onDelete={handleDelete} onExport={handleExport} />
          </Box>
        </Box>
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='assets'>
            {datacenterTotal == 0 ? (
              <Tab value='1' label='Datacenters' icon={<Icon icon='mdi:office-building' />} iconPosition='start' />
            ) : (
              <Tab
                value='1'
                label={'Datacenters (' + datacenterTotal + ')'}
                icon={<Icon icon='mdi:office-building' />}
                iconPosition='start'
              />
            )}
            {environmentTotal == 0 ? (
              <Tab
                value='2'
                label='Environments'
                icon={<Icon icon='mdi:file-table-box-multiple' />}
                iconPosition='start'
              />
            ) : (
              <Tab
                value='2'
                label={'Environments (' + environmentTotal + ')'}
                icon={<Icon icon='mdi:file-table-box-multiple' />}
                iconPosition='start'
              />
            )}
            {serverTotal == 0 ? (
              <Tab value='3' label='Servers' icon={<Icon icon='mdi:server' />} iconPosition='start' />
            ) : (
              <Tab
                value='3'
                label={'Servers (' + serverTotal + ')'}
                icon={<Icon icon='mdi:server' />}
                iconPosition='start'
              />
            )}
            {componentTotal == 0 ? (
              <Tab value='4' label='Components' icon={<Icon icon='mdi:group' />} iconPosition='start' />
            ) : (
              <Tab
                value='4'
                label={'Components (' + componentTotal + ')'}
                icon={<Icon icon='mdi:group' />}
                iconPosition='start'
              />
            )}
            {subcomponentTotal == 0 ? (
              <Tab value='5' label='SubComponents' icon={<Icon icon='mdi:select-group' />} iconPosition='start' />
            ) : (
              <Tab
                value='5'
                label={'SubComponents (' + subcomponentTotal + ')'}
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
