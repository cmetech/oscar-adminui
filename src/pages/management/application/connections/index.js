// ** React Imports
import { useContext, useState, forwardRef, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { connectionsIdsAtom, refetchConnectionsTriggerAtom } from 'src/lib/atoms'

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
            {t('Delete')} {t('Connections')}
          </Box>
        </MenuItem>
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

const ConnectionsManager = () => {
  // ** Hooks
  const ability = useContext(AbilityContext)
  const { t } = useTranslation()
  const theme = useTheme()

  // ** State
  const [value, setValue] = useState('1')
  const [connectionTotal, setConnectionTotal] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedConnectionIds, setSelectedConnectionIds] = useAtom(connectionsIdsAtom)
  const [, setRefetchTrigger] = useAtom(refetchConnectionsTriggerAtom)

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
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

      setRefetchTrigger(Date.now())
      setSelectedConnectionIds([])
    } catch (error) {
      console.error('Unexpected error during connection deletion:', error)
      toast.error('An unexpected error occurred during connection deletion')
    }

    setIsDeleteModalOpen(false)
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

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={10}>
          <Typography variant='h4'>{t('Connection Management')}</Typography>
          <Box display='flex' alignItems='center'>
            <Button
              variant='contained'
              color='secondary'
              sx={{ marginRight: 1 }}
              startIcon={<Icon icon='mdi:plus' />}
              onClick={handleOpenModal}
            >
              {t('Connections')}
            </Button>
            <MoreActionsDropdown onDelete={handleDelete} onTest={handleTest} tabValue={value} />
          </Box>
        </Box>
        <TabContext value={value}>
          <TabListStyled onChange={handleChange} aria-label='connections'>
            <Tab
              value='1'
              label={connectionTotal === 0 ? t('Connections') : `${t('Connections')} (${connectionTotal})`}
              icon={<Icon icon='mdi:connection' />}
              iconPosition='start'
            />
          </TabListStyled>
          <TabPanel value='1'>
            <ConnectionsList set_total={setConnectionTotal} total={connectionTotal} />
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
              {t('Add Connection Wizard')}
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
              {t('Add Connection Information')}
            </Typography>
            <Typography variant='body2'>{t('Information submitted will be effective immediately.')}</Typography>
          </Box>
          <AddConnectionWizard onSuccess={handleCloseModal} />
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

ConnectionsManager.acl = {
  action: 'manage',
  subject: 'connections-page'
}

export default ConnectionsManager