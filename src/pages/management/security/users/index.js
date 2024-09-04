// ** React Imports
import { useContext, useState, useEffect, useCallback, forwardRef, Fragment } from 'react'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { userIdsAtom, refetchUserTriggerAtom } from 'src/lib/atoms'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Tab from '@mui/material/Tab'
import MuiTabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Button from '@mui/material/Button' // Import Button
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'

import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { styled } from '@mui/material/styles'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Views
import UsersList from 'src/views/pages/users/UsersList'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { set } from 'nprogress'
import { get } from 'react-hook-form'
import AddUserWizard from 'src/views/pages/misc/forms/AddUserWizard'
import { useAtom } from 'jotai'

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

const Settings = () => {
  // ** Hooks
  const ability = useContext(AbilityContext)
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()
  const { t } = useTranslation()

  const [value, setValue] = useState('1')
  const [userTotal, setUserTotal] = useState(0)
  const [serverTotal, setServerTotal] = useState(0)

  const [rows, setRows] = useState([])

  // ** Dialog
  const [openDialog, setOpenDialog] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const [selectedUserIds, setSelectedUserIds] = useAtom(userIdsAtom)
  const [, setRefetchTrigger] = useAtom(refetchUserTriggerAtom)

  const [openModal, setOpenModal] = useState(false)
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false)
  const [isEnableModalOpen, setIsEnableModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  
  const handleAddUserDialogClose = () => {
    setOpenDialog(false)
  }

  const handleSuccess = () => {
    handleAddUserDialogClose()
    //console.log("closing dialog on success")
  }

  const handleDeactivate = () => {
    //TO DO handle deactivate logic
    setIsDisableModalOpen(true)
    console.log("handle deactivate")
  }

  const handleDelete = () => {
    //TO DO handle deactivate logic
    setIsDeleteModalOpen(true)
    console.log("handle delete")
  }

  const handleActivate = () => {
    //TO DO handle deactivate logic
    setIsEnableModalOpen(true)
    console.log("handle activate")
  }

  const handleOpenModal = () => {
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  const handleConfirmDelete = async () => {
    console.log('Deleting tasks', selectedUserIds)

    setIsDeleteModalOpen(false)
  }

  const handleCloseEnableModal = () => {
    setIsEnableModalOpen(false)
  }

  const handleConfirmEnable = async () => {
    console.log('Enabling users', selectedUserIds)

    setIsEnableModalOpen(false)
  }

  const handleCloseDisableModal = () => {
    setIsDisableModalOpen(false)
  }

  const handleConfirmDisable = async () => {
    console.log('Enabling users', selectedUserIds)

    setIsDisableModalOpen(false)
  }

  const MoreActionsDropdown = ({ onDeactivate, onDelete , onActivate }) => {
    const [anchorEl, setAnchorEl] = useState(null)
    const { t } = useTranslation()
    const ability = useContext(AbilityContext)
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

        <MenuItem
          sx={{ p: 0 }}
          onClick={() => {
            onActivate()
            handleDropdownClose()
          }}
          disabled={!ability.can('enable', 'tasks')}
        >
          <Box sx={styles}>
            <Icon icon='mdi:plus-box' />
            {t('Enable')}
          </Box>
        </MenuItem>

        <MenuItem
            sx={{ p: 0 }}
            onClick={() => {
              onDeactivate()
              handleDropdownClose()
            }}
            disabled={!ability.can('disable', 'tasks')}
          >
            <Box sx={styles}>
              <Icon icon='mdi:minus-box' />
              {t('Disable')}
            </Box>

        </MenuItem>

        <MenuItem
            sx={{ p: 0 }}
            onClick={() => {
              onDelete()
              handleDropdownClose()
            }}
            disabled={!ability.can('delete', 'tasks')}
          >
            <Box sx={styles}>
              <Icon icon='mdi:delete-forever-outline' />
              {t('Delete')}
            </Box>
          </MenuItem>

          

      </Menu>
      </Fragment>
    )

  }

  const ConfirmationDeleteModal = ({ isOpen, onClose, onConfirm}) => {
    const { t } = useTranslation()
    
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

  const ConfirmationDisableModal = ({ isOpen, onClose, onConfirm, tab }) => {
    const { t } = useTranslation()
  
  
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

  const ConfirmationEnableModal = ({ isOpen, onClose, onConfirm }) => {
    
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

  

  const UserAddDialog = () => {

    return(
      <Dialog
          fullWidth
          maxWidth='md'
          scroll='body'
          open={openDialog}
          onClose={handleAddUserDialogClose}
          TransitionComponent={Transition}
          onSuccess={handleSuccess}
          aria-labelledby='form-dialog-title'>
            
        <DialogTitle id='form-dialog-title'>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              Add User Wizard
            </Typography>
            
          </Box>
        </DialogTitle>
        <DialogContent>
          <IconButton
          size='small'
          onClick={() => handleAddUserDialogClose()}
          sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
          >
            <Icon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ mb: 3 }}>
              Add User Information
            </Typography>
            <Typography variant='body2'>Creates a new User to be effective immediately.</Typography>
          </Box>
          <AddUserWizard setRows={setRows} onSuccess={handleSuccess}/>
        </DialogContent>

        </Dialog>
    )

  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={10}>
          <Typography variant='h4'>{t('User Management')}</Typography>
          <Box display='flex' alignItems='center'>
            {value === '1' && (
              <Fragment>
                <Button
                  variant='contained'
                  color='secondary'
                  sx={{ marginRight: 1 }}
                  startIcon={<Icon icon='mdi:user-plus' />}
                  onClick={() => {
                  //setCurrentUser(params.row)
                    if (!openDialog) {
                    setOpenDialog(true)
                  } 
                  }}
                  disabled={!ability.can('create', 'user')}
                >
                  {t('Add User')}
                </Button>
                <MoreActionsDropdown
                  onDeactivate={handleDeactivate}
                  onDelete={handleDelete}
                  onActivate={handleActivate}
                />
              </Fragment>
            )}
            
          </Box>
        </Box>
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='users'>
            {userTotal == 0 ? (
              <Tab value='1' label={t('Users')} icon={<Icon icon='mdi:user' />} iconPosition='start' />
            ) : (
              <Tab
                value='1'
                label={`${t('Users')} (${userTotal})`}
                icon={<Icon icon='mdi:users' />}
                iconPosition='start'
              />
            )}
          </TabList>
          <TabPanel value='1'>
            <UsersList set_user_total={setUserTotal} />
          </TabPanel>
          {/* dialogue content */}
          <UserAddDialog />

          {/* dialogue content ends*/}
        </TabContext>
      </Grid>
      {/*<DynamicDialogForm open={openModal} handleClose={handleCloseModal} tab={value} />*/}
      <ConfirmationDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        tab={value}
      />

      <ConfirmationEnableModal
        isOpen={isEnableModalOpen}
        onClose={handleCloseEnableModal}
        onConfirm={handleConfirmEnable}
        tab={value}
      />

      <ConfirmationDisableModal
        isOpen={isDisableModalOpen}
        onClose={handleCloseDisableModal}
        onConfirm={handleConfirmDisable}
        tab={value}
      />
    </Grid>
  )
}

Settings.acl = {
  action: 'manage',
  subject: 'security'
}

export default Settings
