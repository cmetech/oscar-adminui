import React, { useState } from 'react'
import { Tab, Box, Typography } from '@mui/material'
import MuiTabList from '@mui/lab/TabList'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { CustomDataGrid } from 'src/lib/styled-components'
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarQuickFilter
} from '@mui/x-data-grid-pro'
import { useTranslation } from 'react-i18next'
import { parseISO, format } from 'date-fns'

import { styled, useTheme } from '@mui/material/styles'
import { DataGridPro, GridLogicOperator } from '@mui/x-data-grid-pro'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'

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

const CustomToolbar = () => {
  return (
    <GridToolbarContainer
      sx={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', marginBottom: '10px' }}
    >
      <Box sx={{ '& > *:not(:last-child)': { marginRight: 2 } }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
      </Box>
      <Box>
        <GridToolbarQuickFilter />
      </Box>
    </GridToolbarContainer>
  )
}

const WorkflowDetailPanel = ({ row }) => {
  const [value, setValue] = useState('1')
  const theme = useTheme()
  const { t } = useTranslation()

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const generalInfoColumns = [
    { field: 'field', headerName: 'Field', flex: 1 },
    { field: 'value', headerName: 'Value', flex: 2 }
  ]

  const generalInfoRows = [
    { id: 1, field: 'DAG ID', value: row.dag_id || 'N/A' },
    { id: 2, field: 'Display Name', value: row.dag_display_name || 'N/A' },
    { id: 3, field: 'Description', value: row.description || 'N/A' },
    { id: 4, field: 'Owner', value: Array.isArray(row.owners) ? row.owners.join(', ') : 'N/A' },
    { id: 5, field: 'Is Paused', value: row.is_paused != null ? (row.is_paused ? 'Yes' : 'No') : 'N/A' },
    { id: 6, field: 'Is Active', value: row.is_active != null ? (row.is_active ? 'Yes' : 'No') : 'N/A' },
    { id: 7, field: 'Is Subdag', value: row.is_subdag != null ? (row.is_subdag ? 'Yes' : 'No') : 'N/A' },
    { id: 8, field: 'File Location', value: row.fileloc || 'N/A' },
    {
      id: 9,
      field: 'Tags',
      value: Array.isArray(row.tags) ? row.tags.map(tag => tag?.name || 'N/A').join(', ') : 'N/A'
    }
  ]

  const scheduleInfoColumns = [
    { field: 'field', headerName: 'Field', flex: 1 },
    { field: 'value', headerName: 'Value', flex: 2 }
  ]

  const scheduleInfoRows = [
    { id: 1, field: 'Schedule Interval', value: row.schedule_interval?.value || 'N/A' },
    { id: 2, field: 'Timetable Description', value: row.timetable_description || 'N/A' },
    { id: 3, field: 'Next Dagrun', value: row.next_dagrun || 'N/A' },
    { id: 4, field: 'Next Dagrun Data Interval Start', value: row.next_dagrun_data_interval_start || 'N/A' },
    { id: 5, field: 'Next Dagrun Data Interval End', value: row.next_dagrun_data_interval_end || 'N/A' },
    { id: 6, field: 'Next Dagrun Create After', value: row.next_dagrun_create_after || 'N/A' }
  ]

  const detailsColumns = [
    { field: 'field', headerName: 'Field', flex: 1 },
    { field: 'value', headerName: 'Value', flex: 2 }
  ]

  const detailsRows = [
    { id: 1, field: 'Last Parsed Time', value: row.last_parsed_time || 'N/A' },
    { id: 2, field: 'Default View', value: row.default_view || 'N/A' },
    { id: 3, field: 'Max Active Tasks', value: row.max_active_tasks != null ? row.max_active_tasks.toString() : 'N/A' },
    { id: 4, field: 'Max Active Runs', value: row.max_active_runs != null ? row.max_active_runs.toString() : 'N/A' },
    {
      id: 5,
      field: 'Has Task Concurrency Limits',
      value: row.has_task_concurrency_limits != null ? (row.has_task_concurrency_limits ? 'Yes' : 'No') : 'N/A'
    },
    {
      id: 6,
      field: 'Has Import Errors',
      value: row.has_import_errors != null ? (row.has_import_errors ? 'Yes' : 'No') : 'N/A'
    },
    {
      id: 7,
      field: 'Max Consecutive Failed Dag Runs',
      value: row.max_consecutive_failed_dag_runs != null ? row.max_consecutive_failed_dag_runs.toString() : 'N/A'
    }
  ]

  return (
    <Box sx={{ m: 5 }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label='Workflow details tabs'>
            <Tab label={t('General Info')} value='1' />
            <Tab label={t('Schedule Info')} value='2' />
            <Tab label={t('Additional Details')} value='3' />
          </TabList>
        </Box>
        <TabPanel value='1'>
          <CustomDataGrid
            rows={generalInfoRows}
            columns={generalInfoColumns}
            autoHeight
            hideFooter
            slots={{
              toolbar: CustomToolbar,
              noRowsOverlay: NoRowsOverlay,
              noResultsOverlay: NoResultsOverlay,
              loadingOverlay: CustomLoadingOverlay
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true
              }
            }}
          />
        </TabPanel>
        <TabPanel value='2'>
          <CustomDataGrid
            rows={scheduleInfoRows}
            columns={scheduleInfoColumns}
            autoHeight
            hideFooter
            slots={{
              toolbar: CustomToolbar,
              noRowsOverlay: NoRowsOverlay,
              noResultsOverlay: NoResultsOverlay,
              loadingOverlay: CustomLoadingOverlay
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true
              }
            }}
          />
        </TabPanel>
        <TabPanel value='3'>
          <CustomDataGrid
            rows={detailsRows}
            columns={detailsColumns}
            autoHeight
            hideFooter
            slots={{
              toolbar: CustomToolbar,
              noRowsOverlay: NoRowsOverlay,
              noResultsOverlay: NoResultsOverlay,
              loadingOverlay: CustomLoadingOverlay
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true
              }
            }}
          />
        </TabPanel>
      </TabContext>
    </Box>
  )
}

export default WorkflowDetailPanel
