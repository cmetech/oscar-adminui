// src/pages/management/application/rules/index.js
import React, { useRef, useState, useEffect, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { Grid, Box, Typography, Button } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { styled } from '@mui/material/styles'
import MuiTabList from '@mui/lab/TabList'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Tab from '@mui/material/Tab'
import ActiveRules from 'src/views/pages/rules/ActiveRules'
import AddRuleForm from 'src/views/pages/rules/forms/AddRuleForm'
import MoreActionsDropdown from 'src/views/pages/rules/MoreActionsDropdown'
import ImportRulesDialog from 'src/views/pages/rules/ImportRulesDialog'
import toast from 'react-hot-toast'
import axios from 'axios'

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

const RuleManager = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [value, setValue] = useState('1')
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedRuleIds, setSelectedRuleIds] = useState([])
  const [ruleTotal, setRuleTotal] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true)
  }

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false)
  }

  const handleMoreActions = async action => {
    if (action === 'import') {
      setImportDialogOpen(true)
    } else if (action === 'export') {
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
      }
    } else if (action === 'delete') {
      if (selectedRuleIds.length === 0) {
        toast.error(t('No rules selected'))

        return
      }
      // Implement bulk delete functionality here
    }
  }

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={10}>
          <Typography variant='h4'>{t('Rule Manager')}</Typography>
          <Box display='flex' alignItems='center'>
            <Fragment>
              <Button
                variant='contained'
                color='secondary'
                sx={{ marginRight: 1 }}
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
          <TabPanel value='1'>
            <ActiveRules
              setRuleTotal={setRuleTotal}
              selectedRuleIds={selectedRuleIds}
              setSelectedRuleIds={setSelectedRuleIds}
            />
          </TabPanel>
        </TabContext>
      </Grid>
      {openAddDialog && <AddRuleForm open={openAddDialog} onClose={handleCloseAddDialog} />}
      {importDialogOpen && <ImportRulesDialog open={importDialogOpen} onClose={handleCloseImportDialog} />}
    </Grid>
  )
}

export default RuleManager
