// ** React Imports
import { useContext, useState, useEffect, useCallback, forwardRef  } from 'react'
import getConfig from 'next/config'
import { useTranslation } from 'react-i18next'

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
import DialogTitle from '@mui/material/DialogTitle'

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

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  

  const handleAddUserDialogClose = () => {
    setOpenDialog(false)
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
          <AddUserWizard setRows={setRows} />
        </DialogContent>

        </Dialog>
    )

  }

  return (
    <Grid container spacing={6} alignItems="center">
      <Grid item xs={12}>
        <TabContext value={value}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
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
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Icon icon='mdi:user-plus' />}
                onClick={() => {
                  //setCurrentUser(params.row)
                  setOpenDialog(true)
                }}
              >
                {t('Add User')}
              </Button>
            </Grid>
          </Grid>
          <TabPanel value='1'>
            <UsersList set_user_total={setUserTotal} />
          </TabPanel>
          {/* dialogue content */}
          <UserAddDialog />

          {/* dialogue content ends*/}
        </TabContext>
      </Grid>
    </Grid>
  )
}

Settings.acl = {
  action: 'manage',
  subject: 'security'
}

export default Settings
