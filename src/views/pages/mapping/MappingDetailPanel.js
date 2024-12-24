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

  const MappingDetailPanel = ({ row }) => {




  }


  export default MappingDetailPanel
