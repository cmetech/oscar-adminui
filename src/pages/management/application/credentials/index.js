// ** React Imports
import { useContext, useState, forwardRef, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import {
  connectionsIdsAtom,
  refetchConnectionsTriggerAtom,
  secretsIdsAtom,
  refetchSecretsTriggerAtom
} from 'src/lib/atoms'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Fade from '@mui/material/Fade'

import { styled, useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import ConnectionsList from 'src/views/pages/connection-management/ConnectionsList'
import AddConnectionWizard from 'src/views/pages/connection-management/forms/AddConnectionWizard'
import SecretsList from 'src/views/pages/secrets-management/SecretsList'
import AddSecretsWizard from 'src/views/pages/secrets-management/forms/AddSecretsWizard'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useAtom } from 'jotai'
import axios from 'axios'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

// ** Styled Components
const TabListStyled = styled(TabList)(({ theme }) => ({
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
const MoreActionsDropdown = ({ onDelete, onTest, tabValue }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { t } = useTranslation()

  const handleDropdownOpen = event => {
    console.log('Dropdown opened, tabValue:', tabValue)
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
      color: 'text.primary'
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
            onDelete()
            handleDropdownClose()
          }}
        >
          <Box sx={styles}>
            <Icon icon='mdi:delete-forever-outline' />
            {t('Delete')} {tabValue === '1' ? t('Connections') : t('Secrets')}
          </Box>
        </MenuItem>
        {tabValue === '1' && (
          <MenuItem
            sx={{ p: 0 }}
            onClick={() => {
              onTest()
              handleDropdownClose()
            }}
            disabled={true}
          >
            <Box sx={styles}>
              <Icon icon='mdi:connection' />
              {t('Test')} {t('Connections')}
            </Box>
          </MenuItem>
        )}
      </Menu>
    </Fragment>
  )
}

// ** Confirmation Modal
const ConfirmationDeleteModal = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation()

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{t('Confirm Action')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('Delete all selected?')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size='large' variant='outlined' color='secondary' startIcon={<Icon icon='mdi:close' />}>
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

const CredentialsManager = () => {
  // ** Hooks
  const ability = useContext(AbilityContext)
  const { t } = useTranslation()
  const theme = useTheme()

  // ** State
  const [value, setValue] = useState('1')
  const [connectionTotal, setConnectionTotal] = useState(0)
  const [secretsTotal, setSecretsTotal] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedConnectionIds, setSelectedConnectionIds] = useAtom(connectionsIdsAtom)
  const [, setConnectionsRefetchTrigger] = useAtom(refetchConnectionsTriggerAtom)
  const [selectedSecretIds, setSelectedSecretIds] = useAtom(secretsIdsAtom)
  const [, setSecretsRefetchTrigger] = useAtom(refetchSecretsTriggerAtom)

  const handleDelete = () => {
    console.log('Current value:', value)
    console.log('Selected Secret IDs:', selectedSecretIds)
    if (value === '1') {
      // Handle connection deletion
      if (selectedConnectionIds.length > 0) {
        setIsDeleteModalOpen(true)
      } else {
        toast.error(t('No connections selected for deletion'))
      }
    } else {
      // Handle secret deletion
      if (selectedSecretIds.length > 0) {
        setIsDeleteModalOpen(true)
      } else {
        console.log('No secrets selected')
        toast.error(t('No secrets selected for deletion'))
      }
    }
  }

  const handleTest = async () => {
    try {
      const response = await axios.post('/api/connections/test', { connection_ids: selectedConnectionIds })
      if (response.data.status === 'success') {
        toast.success('Connection test successful')
      } else {
        toast.error('Connection test failed')
      }
    } catch (error) {
      console.error('Error testing connections:', error)
      toast.error('Connection test failed')
    }
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (value === '1') {
      // Handle connection deletion
      console.log('Deleting connections', selectedConnectionIds)

      const deletePromises = selectedConnectionIds.map(connectionId =>
        axios
          .delete(`/api/connections/${connectionId}`)
          .then(() => ({ success: true, connectionId }))
          .catch(error => ({ success: false, connectionId, error }))
      )

      try {
        const results = await Promise.all(deletePromises)

        results.forEach(result => {
          if (result.success) {
            toast.success(`Connection ${result.connectionId} deleted successfully`)
          } else {
            console.error(`Error deleting connection ${result.connectionId}:`, result.error)
            toast.error(`Failed to delete connection ${result.connectionId}`)
          }
        })

        setConnectionsRefetchTrigger(Date.now())
        setSelectedConnectionIds([])
      } catch (error) {
        console.error('Unexpected error during connection deletion:', error)
        toast.error('An unexpected error occurred during connection deletion')
      }
    } else {
      // Handle secret deletion
      try {
        const deletePromises = selectedSecretIds.map(id => {
          const [path, key] = id.split('-')
          return axios.delete('/api/secrets/delete', {
            params: {
              path,
              key,
              delete_empty_paths: true
            }
          })
        })

        const results = await Promise.all(deletePromises)

        const successCount = results.filter(result => result.status === 200).length
        const failCount = selectedSecretIds.length - successCount

        if (successCount > 0) {
          toast.success(t(`${successCount} secret(s) deleted successfully`))
        }
        if (failCount > 0) {
          toast.error(t(`Failed to delete ${failCount} secret(s)`))
        }

        setSecretsRefetchTrigger(Date.now())
        setSelectedSecretIds([])
      } catch (error) {
        console.error('Error deleting secrets:', error)
        toast.error(t('An error occurred while deleting secrets'))
      }
    }

    setIsDeleteModalOpen(false)
  }

  const handleChange = (event, newValue) => {
    console.log('Tab changed to:', newValue)
    setValue(newValue)
  }

  const handleOpenModal = () => {
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleAddSuccess = () => {
    handleCloseModal()
    if (value === '1') {
      setConnectionsRefetchTrigger(Date.now())
    } else {
      setSecretsRefetchTrigger(Date.now())
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={10}>
          <Typography variant='h4'>{t('Credential Management')}</Typography>
          <Box display='flex' alignItems='center'>
            <Button
              variant='contained'
              color='secondary'
              sx={{ marginRight: 1 }}
              startIcon={<Icon icon='mdi:plus' />}
              onClick={handleOpenModal}
            >
              {value === '1' ? t('Connections') : t('Secrets')}
            </Button>
            <MoreActionsDropdown onDelete={handleDelete} onTest={handleTest} tabValue={value} />
          </Box>
        </Box>
        <TabContext value={value}>
          <TabListStyled onChange={handleChange} aria-label='credentials'>
            <Tab
              value='1'
              label={connectionTotal === 0 ? t('Connections') : `${t('Connections')} (${connectionTotal})`}
              icon={<Icon icon='mdi:connection' />}
              iconPosition='start'
            />
            <Tab
              value='2'
              label={secretsTotal === 0 ? t('Secrets') : `${t('Secrets')} (${secretsTotal})`}
              icon={<Icon icon='mdi:key-variant' />}
              iconPosition='start'
            />
          </TabListStyled>
          <TabPanel value='1'>
            <ConnectionsList set_total={setConnectionTotal} total={connectionTotal} />
          </TabPanel>
          <TabPanel value='2'>
            <SecretsList set_total={setSecretsTotal} total={secretsTotal} />
          </TabPanel>
        </TabContext>
      </Grid>
      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        open={openModal}
        onClose={handleCloseModal}
        TransitionComponent={Transition}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {value === '1' ? t('Add Connection Wizard') : t('Add Secrets Wizard')}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <IconButton
            size='small'
            onClick={handleCloseModal}
            sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
          >
            <Icon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ mb: 3 }}>
              {value === '1' ? t('Add Connection Information') : t('Add Secrets Information')}
            </Typography>
            <Typography variant='body2'>{t('Information submitted will be effective immediately.')}</Typography>
          </Box>
          {value === '1' ? (
            <AddConnectionWizard onSuccess={handleAddSuccess} onClose={handleCloseModal} />
          ) : (
            <AddSecretsWizard onSuccess={handleAddSuccess} onClose={handleCloseModal} />
          )}
        </DialogContent>
      </Dialog>
      <ConfirmationDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </Grid>
  )
}

CredentialsManager.acl = {
  action: 'manage',
  subject: ['connections', 'secrets']
}

export default CredentialsManager
