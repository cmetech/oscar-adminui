import React, { useState, useMemo } from 'react'
import { Tab, Box } from '@mui/material'
import MuiTabList from '@mui/lab/TabList'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { CustomDataGrid } from 'src/lib/styled-components' // Assuming this is a custom component
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarQuickFilter
} from '@mui/x-data-grid-pro'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import { styled, useTheme } from '@mui/material/styles'

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

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

const CustomTaskToolbar = () => {
  return (
    <GridToolbarContainer
      sx={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', marginBottom: '10px' }}
    >
      <Box sx={{ '& > *:not(:last-child)': { marginRight: 2 } }}>
        {/* Applying right margin to all child components except the last one */}
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        {/* Additional buttons can be placed here if needed */}
      </Box>
      <Box>
        {/* Right-aligned toolbar items */}
        <GridToolbarQuickFilter
          sx={{
            '& .MuiInputBase-root': {
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              '&:hover': {
                borderColor: 'rgba(0, 0, 0, 0.87)'
              },
              '&.Mui-focused': {
                borderColor: 'primary.main',
                boxShadow: `0 0 0 2px rgba(25, 118, 210, 0.2)`
              }
            },
            '& .MuiInputBase-input': {
              padding: '8px 8px 8px 14px' // Increase left padding
            },
            '& .MuiSvgIcon-root': {
              // Optionally target the search icon directly for finer control
              marginLeft: '8px' // Add space to the left of the search icon
            }
          }}
        />
      </Box>
    </GridToolbarContainer>
  )
}

const TaskHistoryDetailPanel = ({ row }) => {
  const [value, setValue] = useState('1')
  const [filterModel, setFilterModel] = useState({ items: [] })
  const { t } = useTranslation()

  const stageHistoryColumns = [
    { field: 'id', headerName: 'ID', width: 300, flex: 1 },
    { field: 'task_history_id', headerName: 'Task History ID', width: 300, flex: 1 },
    { field: 'task_stage', headerName: 'Task Stage', width: 150, flex: 1 },
    { field: 'stage_name', headerName: 'Stage Name', width: 200, flex: 1 }
  ]

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleFilterModelChange = newModel => {
    setFilterModel(newModel)
  }

  // Attempt to parse the result JSON string safely
  const parseResult = (resultString, state) => {
    if (!state || state === 'NONE') {
      try {
        return JSON.parse(resultString)
      } catch (e) {
        return null
      }
    }
    if (state === 'FAILURE' && resultString && typeof resultString === 'string' && resultString.length > 0) {
      return resultString
    }
    try {
      return JSON.parse(resultString)
    } catch (e) {
      return null // Return null if parsing fails
    }
  }

  // Call parseResult and store the returned value (object or null)
  const resultObject = parseResult(row.result, row.state)

  // Use useMemo to sort the stage_history once, when the component mounts or row changes
  const sortedStageHistory = useMemo(() => {
    if (!row.stage_history || row.stage_history.length === 0) {
      return []
    }

    // Creates a new array by spreading the original, then sorts the new array
    return [...row.stage_history].sort((a, b) => a.task_stage - b.task_stage)
  }, [row.stage_history]) // Dependency array, to only sort when stage_history changes

  return (
    <Box sx={{ m: 5 }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label='Task history detail tabs'>
            <Tab label={t('Stage History')} value='1' />
            <Tab label={t('Result')} value='2' />
          </TabList>
        </Box>
        <TabPanel value='1'>
          {sortedStageHistory.length > 0 ? (
            <CustomDataGrid
              rows={sortedStageHistory}
              columns={stageHistoryColumns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              autoHeight
              disablePagination={true} // Assuming your CustomDataGrid accepts this prop to disable pagination
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
              components={{ Toolbar: CustomTaskToolbar }}
              componentsProps={{
                baseButton: {
                  variant: 'outlined'
                },
                toolbar: {
                  showQuickFilter: true
                }
              }}
            />
          ) : (
            <Typography variant='body2'>No stage history available.</Typography>
          )}
        </TabPanel>
        <TabPanel value='2'>
          <Typography variant='body1'>Result:</Typography>
          {resultObject ? (
            <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(resultObject, null, 2)}
            </Typography>
          ) : (
            <Typography variant='body2'>No results returned.</Typography>
          )}
        </TabPanel>
      </TabContext>
    </Box>
  )
}

export default TaskHistoryDetailPanel
