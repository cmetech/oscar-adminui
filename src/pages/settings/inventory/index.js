// ** React Imports
import { useContext, useState, useEffect, forwardRef } from 'react'
import getConfig from 'next/config'

// ** MUI Imports
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

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

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
        return <Typography>Form not configured for this tab.</Typography>
      case '4': // Components
        return <AddComponentWizard />
      case '5':
        return <Typography>Form not configured for this tab.</Typography>

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
          <Box>
            <Button
              variant='contained'
              color='warning'
              sx={{ marginRight: 1 }}
              startIcon={<Icon icon='mdi:plus' />}
              onClick={handleOpenModal}
            >
              {getDynamicText(value)}
            </Button>
            <Button variant='outlined' color='warning'>
              More Actions
            </Button>
          </Box>
        </Box>
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='assets'>
            {datacenterTotal == 0 ? (
              <Tab value='1' label='Datacenters' />
            ) : (
              <Tab value='1' label={'Datacenters (' + datacenterTotal + ')'} />
            )}
            {environmentTotal == 0 ? (
              <Tab value='2' label='Environments' />
            ) : (
              <Tab value='2' label={'Environments (' + environmentTotal + ')'} />
            )}
            {serverTotal == 0 ? (
              <Tab value='3' label='Servers' />
            ) : (
              <Tab value='3' label={'Servers (' + serverTotal + ')'} />
            )}
            {componentTotal == 0 ? (
              <Tab value='4' label='Components' />
            ) : (
              <Tab value='4' label={'Components (' + componentTotal + ')'} />
            )}
            {subcomponentTotal == 0 ? (
              <Tab value='5' label='SubComponents' />
            ) : (
              <Tab value='5' label={'SubComponents (' + subcomponentTotal + ')'} />
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
    </Grid>
  )
}

Settings.acl = {
  action: 'manage',
  subject: 'settings-page'
}

export default Settings
