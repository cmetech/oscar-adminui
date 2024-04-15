import React, { useState } from 'react'
import { Tab, Box, Typography } from '@mui/material'
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
import { parseISO, format } from 'date-fns'

import { styled, useTheme } from '@mui/material/styles'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'

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

const SLOEventHistoryDetailPanel = ({ row }) => {
  console.log('row', row)
  const [value, setValue] = useState('1')

  const [filterModel, setFilterModel] = useState({
    metadata: { items: [] }
  })

  const { t } = useTranslation()

  // Define pagination state for each tab separately
  const [paginationModel, setPaginationModel] = useState({
    metadata: { page: 0, pageSize: 5 }
  })

  // console.log('row', row)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handlePaginationChange = (tab, model) => {
    setPaginationModel(prevModel => ({
      ...prevModel,
      [tab]: model
    }))
  }

  // Function to handle filter model change (if your DataGrid supports filtering)
  const handleFilterModelChange = (tab, model) => {
    setFilterModel(prevModel => ({
      ...prevModel,
      [tab]: model
    }))
  }

  // Preparing metadata for display
  const metadataRows = Object.entries(row.event_metadata).map(([key, value], index) => ({
    id: index,
    key,
    value
  }))

  // Common column definitions for args, kwargs, metadata, and hosts
  const commonColumns = [
    { field: 'key', headerName: t('Key'), flex: 1, minWidth: 150 },
    { field: 'value', headerName: t('Value'), flex: 1, minWidth: 150 }
  ]

  return (
    <Box sx={{ m: 5 }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label='SLO Event details tabs'>
            <Tab label={t('Metadata')} value='1' />
          </TabList>
        </Box>
        <TabPanel value='1'>
          <CustomDataGrid
            rows={metadataRows}
            columns={commonColumns}
            pageSize={paginationModel.metadata.pageSize}
            page={paginationModel.metadata.page}
            onPageChange={newPage => handlePaginationChange('metadata', { ...paginationModel.metadata, page: newPage })}
            onPageSizeChange={newPageSize =>
              handlePaginationChange('metadata', { ...paginationModel.metadata, pageSize: newPageSize })
            }
            filterModel={filterModel.metadata}
            onFilterModelChange={model => handleFilterModelChange('metadata', model)}
            pagination
            rowsPerPageOptions={[5, 10, 25]}
            autoHeight
            components={{
              Toolbar: CustomTaskToolbar,
              NoRowsOverlay: () => <NoRowsOverlay message='No Event Metadata' />,
              NoResultsOverlay: () => <NoResultsOverlay message='No Event Metadata' />
            }}
            componentsProps={{
              baseButton: {
                variant: 'outlined'
              },
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

export default SLOEventHistoryDetailPanel
