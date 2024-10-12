// ** React Imports
import React, { useState } from 'react'

// ** MUI Imports
import { Box, Typography, Tab } from '@mui/material'
import MuiTabList from '@mui/lab/TabList'
import { styled, useTheme } from '@mui/material/styles'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// ** DataGrid Imports
import { CustomDataGrid } from 'src/lib/styled-components'
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarQuickFilter,
  GridLogicOperator
} from '@mui/x-data-grid-pro'

// ** Custom Components Imports
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'

// ** Translation Hook
import { useTranslation } from 'react-i18next'

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
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.up('md')]: {
      minWidth: 130
    }
  }
}))

const CustomToolbar = () => (
  <GridToolbarContainer sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
    <Box sx={{ '& > *:not(:last-child)': { marginRight: 2 } }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
    </Box>
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
          padding: '8px 8px 8px 14px'
        },
        '& .MuiSvgIcon-root': {
          marginLeft: '8px'
        }
      }}
    />
  </GridToolbarContainer>
)

const ActiveRulesDetailPanel = ({ row }) => {
  const [value, setValue] = useState('condition')
  const theme = useTheme()
  const { t } = useTranslation()

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  // Prepare data for 'Labels to Add' tab
  const labelsRows = row.actions?.add_labels
    ? Object.entries(row.actions.add_labels).map(([key, value], index) => ({ id: index, key, value }))
    : []

  // Column definitions for labels
  const columns = [
    { field: 'key', headerName: t('Key'), flex: 1, minWidth: 150 },
    { field: 'value', headerName: t('Value'), flex: 1, minWidth: 150 }
  ]

  return (
    <Box sx={{ m: 5 }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label={t('Rule details tabs')}>
            <Tab label={t('Condition')} value='condition' />
            <Tab label={t('Labels to Add')} value='labels' />
          </TabList>
        </Box>
        <TabPanel value='condition'>
          <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
            {row.condition || t('No condition specified')}
          </Typography>
        </TabPanel>
        <TabPanel value='labels'>
          <CustomDataGrid
            rows={labelsRows}
            columns={columns}
            autoHeight
            pageSize={5}
            rowsPerPageOptions={[5, 10, 25]}
            slots={{
              toolbar: CustomToolbar,
              noRowsOverlay: NoRowsOverlay,
              noResultsOverlay: NoResultsOverlay,
              loadingOverlay: CustomLoadingOverlay
            }}
            slotProps={{
              baseButton: { variant: 'outlined' },
              noRowsOverlay: { message: t('No Labels to Add') },
              noResultsOverlay: { message: t('No Results Found') },
              toolbar: { showQuickFilter: true }
            }}
          />
        </TabPanel>
      </TabContext>
    </Box>
  )
}

export default ActiveRulesDetailPanel
