import React, { useState } from 'react'
import { Tab, Box, Typography } from '@mui/material'
import MuiTabList from '@mui/lab/TabList'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { CustomDataGrid } from 'src/lib/styled-components'
import { useTranslation } from 'react-i18next'
import { styled, useTheme } from '@mui/material/styles'
import { parseISO, formatInTimeZone, utcToZonedTime } from 'date-fns-tz'

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

const WorkflowHistoryDetailPanel = ({ row }) => {
  const [value, setValue] = useState('1')
  const { t } = useTranslation()
  const theme = useTheme()

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const taskInstanceColumns = [
    { field: 'task_id', headerName: 'Task ID', flex: 1 },
    { field: 'state', headerName: 'State', flex: 1 },
    {
      field: 'start_date',
      headerName: 'Start Date',
      flex: 1,
      renderCell: params => {
        const date = parseISO(params.value)
        return formatInTimeZone(utcToZonedTime(date, 'UTC'), 'UTC', 'yyyy-MM-dd HH:mm:ss zzz')
      }
    },
    {
      field: 'end_date',
      headerName: 'End Date',
      flex: 1,
      renderCell: params => {
        if (!params.value) return 'N/A'
        const date = parseISO(params.value)
        return formatInTimeZone(utcToZonedTime(date, 'UTC'), 'UTC', 'yyyy-MM-dd HH:mm:ss zzz')
      }
    },
    { field: 'duration', headerName: 'Duration', flex: 1 }
  ]

  return (
    <Box sx={{ m: 2 }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label='Workflow history detail tabs'>
            <Tab label={t('Task Instances')} value='1' />
            <Tab label={t('Configuration')} value='2' />
          </TabList>
        </Box>
        <TabPanel value='1'>
          <CustomDataGrid
            rows={row.task_instances || []}
            columns={taskInstanceColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            autoHeight
            disableSelectionOnClick
          />
        </TabPanel>
        <TabPanel value='2'>
          <Typography variant='body1'>Configuration:</Typography>
          <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(row.conf, null, 2)}
          </Typography>
        </TabPanel>
      </TabContext>
    </Box>
  )
}

export default WorkflowHistoryDetailPanel