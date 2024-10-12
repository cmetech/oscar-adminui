// ** React Imports
import React, { useState, Fragment } from 'react'
import { useTranslation } from 'react-i18next'

// ** MUI Imports
import { styled } from '@mui/material/styles'
import {
  Grid,
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab
} from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import MuiTabList from '@mui/lab/TabList'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Component Imports
import ActiveRules from 'src/views/pages/rules/ActiveRules'
import AddRuleForm from 'src/views/pages/rules/forms/AddRuleForm'
import ImportRulesDialog from 'src/views/pages/rules/ImportRulesDialog'

// ** Other Imports
import toast from 'react-hot-toast'
import axios from 'axios'

// ** Styled Components
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

// ** MoreActionsDropdown Component
const MoreActionsDropdown = ({ onAction }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { t } = useTranslation()
  const theme = useTheme()

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMenuItemClick = action => {
    onAction(action)
    handleClose()
  }

  const menuItemStyles = {
    py: 2,
    px: 4,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.text.primary,
    textDecoration: 'none',
    '& svg': {
      mr: 2,
      fontSize: '1.375rem',
      color: theme.palette.text.primary
    }
  }

  return (
    <Fragment>
      <IconButton color='secondary' onClick={handleClick}>
        <Icon icon='mdi:menu' />
      </IconButton>
      <Menu
        id='more-actions-menu'
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4 } }}
      >
        <MenuItem sx={{ p: 0 }} onClick={() => handleMenuItemClick('import')}>
          <Box sx={menuItemStyles}>
            <Icon icon='mdi:upload' />
            {t('Upload Rules')}
          </Box>
        </MenuItem>
        <MenuItem sx={{ p: 0 }} onClick={() => handleMenuItemClick('export')}>
          <Box sx={menuItemStyles}>
            <Icon icon='mdi:file-export-outline' />
            {t('Export Rules')}
          </Box>
        </MenuItem>
        <MenuItem sx={{ p: 0 }} onClick={() => handleMenuItemClick('delete')}>
          <Box sx={menuItemStyles}>
            <Icon icon='mdi:delete-forever-outline' />
            {t('Delete Selected')}
          </Box>
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

// ** Main Component
const RuleManager = () => {
  const { t } = useTranslation()
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [ruleTotal, setRuleTotal] = useState(0)
  const [selectedRuleIds, setSelectedRuleIds] = useState([])
  const [value, setValue] = useState('1')

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true)
  }

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false)
  }

  const handleOpenImportDialog = () => {
    setImportDialogOpen(true)
  }

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false)
  }

  const handleOpenExportDialog = () => {
    setExportDialogOpen(true)
  }

  const handleCloseExportDialog = () => {
    setExportDialogOpen(false)
  }

  const handleImportSuccess = () => {
    setImportDialogOpen(false)
    toast.success(t('Rules imported successfully'))
    // Optionally refresh rules
  }

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/rules/export', {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'rules_export.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)

      toast.success(t('Successfully exported rules'))
    } catch (error) {
      console.error('Failed to export rules', error)
      toast.error(t('Failed to export rules'))
    } finally {
      handleCloseExportDialog()
    }
  }

  const handleMoreActions = action => {
    if (action === 'import') {
      handleOpenImportDialog()
    } else if (action === 'export') {
      handleOpenExportDialog()
    } else if (action === 'delete') {
      // Handle delete action
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
          <Typography variant='h4'>{t('Rule Manager')}</Typography>
          <Box display='flex' alignItems='center'>
            <Fragment>
              <Button
                variant='contained'
                color='secondary'
                sx={{ mr: 2 }}
                startIcon={<Icon icon='mdi:plus' />}
                onClick={handleOpenAddDialog}
              >
                {t('Add Rule')}
              </Button>
              <MoreActionsDropdown onAction={handleMoreActions} />
            </Fragment>
          </Box>
        </Box>

        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='rules'>
            <Tab
              value='1'
              label={`${t('Active Rules')} (${ruleTotal})`}
              icon={<Icon icon='mdi:book-open-outline' />}
              iconPosition='start'
            />
          </TabList>

          <TabPanel value='1' sx={{ p: 0 }}>
            <ActiveRules
              setRuleTotal={setRuleTotal}
              selectedRuleIds={selectedRuleIds}
              setSelectedRuleIds={setSelectedRuleIds}
            />
          </TabPanel>
        </TabContext>

        {openAddDialog && <AddRuleForm open={openAddDialog} onClose={handleCloseAddDialog} />}
        {importDialogOpen && (
          <ImportRulesDialog
            open={importDialogOpen}
            onClose={handleCloseImportDialog}
            onSuccess={handleImportSuccess}
          />
        )}
        {exportDialogOpen && (
          <Dialog open={exportDialogOpen} onClose={handleCloseExportDialog}>
            <DialogTitle>{t('Export Rules')}</DialogTitle>
            <DialogContent>
              <Typography>{t('Are you sure you want to export the rules?')}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseExportDialog} variant='outlined' color='secondary'>
                {t('Cancel')}
              </Button>
              <Button onClick={handleExport} variant='contained' color='primary'>
                {t('Confirm')}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Grid>
    </Grid>
  )
}

export default RuleManager
