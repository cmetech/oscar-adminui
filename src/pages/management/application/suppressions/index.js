import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import toast from 'react-hot-toast'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Icon from 'src/@core/components/icon'

// ** Components
import SuppressionsList from 'src/views/pages/suppressions-management/SuppressionsList'
import AddSuppressionForm from 'src/views/pages/suppressions-management/forms/AddSuppressionForm'
import UpdateSuppressionForm from 'src/views/pages/suppressions-management/forms/UpdateSuppressionForm'
import DeleteSuppressionDialog from 'src/views/pages/suppressions-management/forms/DeleteSuppressionDialog'

// ** Custom Styled Components
import { styled } from '@mui/material/styles'

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
const MoreActionsDropdown = ({ onDelete, onEnable, onDisable }) => {
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
      <IconButton color='secondary' aria-haspopup='true' onClick={handleDropdownOpen}>
        <Icon icon='mdi:menu' />
      </IconButton>
      <Menu
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
            {t('Delete Selected')}
          </Box>
        </MenuItem>
        {/* Add more actions if needed */}
      </Menu>
    </Fragment>
  )
}

const SuppressionsManager = () => {
  const { t } = useTranslation()
  const theme = useTheme()

  const [value, setValue] = useState('1')
  const [suppressionsTotal, setSuppressionsTotal] = useState(0)
  const [addFormOpen, setAddFormOpen] = useState(false)
  const [updateFormOpen, setUpdateFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSuppressionId, setSelectedSuppressionId] = useState(null)

  const handleTabChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleAddSuccess = () => {
    setAddFormOpen(false)
    // Refresh the list after adding
  }

  const handleUpdateSuccess = () => {
    setUpdateFormOpen(false)
    // Refresh the list after updating
  }

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false)
    // Refresh the list after deleting
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
          <Typography variant='h4'>{t('Suppression Management')}</Typography>
          <Box display='flex' alignItems='center'>
            <Button
              variant='contained'
              color='secondary'
              sx={{ mr: 2 }}
              startIcon={<Icon icon='mdi:plus' />}
              onClick={() => setAddFormOpen(true)}
            >
              {t('Add Suppression')}
            </Button>
            {/* Include any additional actions if necessary */}
          </Box>
        </Box>

        <TabContext value={value}>
          <TabListStyled onChange={handleTabChange} aria-label='suppressions'>
            <Tab
              value='1'
              label={`${t('Suppressions')} (${suppressionsTotal})`}
              icon={<Icon icon='mdi:bell-off-outline' />}
              iconPosition='start'
            />
          </TabListStyled>

          <TabPanel value='1' sx={{ p: 0 }}>
            <SuppressionsList setTotalCount={setSuppressionsTotal} />
          </TabPanel>
        </TabContext>

        {/* Add Suppression Form */}
        <AddSuppressionForm open={addFormOpen} onClose={() => setAddFormOpen(false)} onSuccess={handleAddSuccess} />

        {/* Update Suppression Form */}
        <UpdateSuppressionForm
          open={updateFormOpen}
          onClose={() => setUpdateFormOpen(false)}
          suppressionId={selectedSuppressionId}
          onSuccess={handleUpdateSuccess}
        />

        {/* Delete Suppression Dialog */}
        <DeleteSuppressionDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          suppressionId={selectedSuppressionId}
          onSuccess={handleDeleteSuccess}
        />
      </Grid>
    </Grid>
  )
}

export default SuppressionsManager
